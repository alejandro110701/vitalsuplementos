import { createMcpHandler } from "agents/mcp/server";
import { landingHtml } from "./landing";
import {
  authorizePageHtml,
  buildAuthorizeUrl,
  createPkce,
  exchangeWpcomCode,
  registerWpcomClient,
  SAFARI_REDIRECT,
} from "./oauth";
import { createServer, type WorkerEnv } from "./server";

const OAUTH_COOKIE = "wpcom_oauth";

export default {
  async fetch(request: Request, env: WorkerEnv, ctx: ExecutionContext) {
    const url = new URL(request.url);

    if (url.pathname === "/mcp" || url.pathname === "/sse") {
      return createMcpHandler((context) => createServer(env, context.requestInfo ?? request), {
        route: url.pathname,
      })(request, env, ctx);
    }

    if (url.pathname === "/health") {
      return Response.json({
        ok: true,
        name: "wpcom-mcp",
        mcp: `${url.origin}/mcp`,
      });
    }

    if (url.pathname === "/oauth/start") {
      return startOAuth(url);
    }

    if (url.pathname === "/oauth/callback") {
      return finishOAuth(request, url);
    }

    if (url.pathname === "/" || url.pathname === "/index.html") {
      return new Response(landingHtml(url.origin), {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    return new Response("Not found", { status: 404 });
  },
} satisfies ExportedHandler<WorkerEnv>;

async function startOAuth(url: URL): Promise<Response> {
  const redirectUri = url.searchParams.get("redirect_uri") || SAFARI_REDIRECT;
  const { client_id } = await registerWpcomClient([
    redirectUri,
    `${url.origin}/oauth/callback`,
    SAFARI_REDIRECT,
  ]);
  const pkce = await createPkce();
  const state = crypto.randomUUID();
  const authorizeUrl = buildAuthorizeUrl({
    clientId: client_id,
    redirectUri,
    codeChallenge: pkce.codeChallenge,
    state,
  });
  const cookie = `${OAUTH_COOKIE}=${encodeURIComponent(
    JSON.stringify({
      client_id,
      redirect_uri: redirectUri,
      code_verifier: pkce.codeVerifier,
      state,
    }),
  )}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`;

  return new Response(authorizePageHtml(authorizeUrl), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Set-Cookie": cookie,
    },
  });
}

function callbackHtml(title: string, body: string, currentUrl?: string): string {
  const urlBlock = currentUrl
    ? `<p>Paste this URL back in chat:</p><textarea readonly>${currentUrl
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")}</textarea>`
    : "";
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <style>
      body { margin: 0; font: 16px/1.5 ui-sans-serif, system-ui, sans-serif; background: #f4f1ea; color: #1b1c19; }
      main { max-width: 36rem; margin: 0 auto; padding: 3rem 1.25rem; }
      textarea { width: 100%; min-height: 7rem; font: 12px/1.4 ui-monospace, monospace; }
    </style>
  </head>
  <body>
    <main>
      <h1>${title}</h1>
      <p>${body}</p>
      ${urlBlock}
    </main>
  </body>
</html>`;
}

async function finishOAuth(request: Request, url: URL): Promise<Response> {
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code) {
    return new Response(
      callbackHtml(
        "No authorization code",
        "This page is the OAuth callback. Open the WordPress.com authorize link first, then Allow in Safari.",
        url.toString(),
      ),
      { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }

  console.log(JSON.stringify({ event: "wpcom_oauth_callback", has_code: true, state }));

  const cookieHeader = request.headers.get("Cookie") || "";
  const raw = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${OAUTH_COOKIE}=`))
    ?.slice(OAUTH_COOKIE.length + 1);

  if (!raw) {
    return new Response(
      callbackHtml(
        "Authorization received",
        "Safari completed the WordPress.com Allow step. Paste this full URL back in chat so the token can be exchanged.",
        url.toString(),
      ),
      { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }

  const stored = JSON.parse(decodeURIComponent(raw)) as {
    client_id: string;
    redirect_uri: string;
    code_verifier: string;
    state: string;
  };
  if (state && stored.state !== state) {
    return new Response("OAuth state mismatch", { status: 400 });
  }

  const tokens = await exchangeWpcomCode({
    clientId: stored.client_id,
    code,
    redirectUri: stored.redirect_uri,
    codeVerifier: stored.code_verifier,
  });

  return Response.json({
    ok: true,
    token_type: tokens.token_type,
    expires_in: tokens.expires_in,
    scope: tokens.scope,
    has_access_token: Boolean(tokens.access_token),
    has_refresh_token: Boolean(tokens.refresh_token),
  });
}
