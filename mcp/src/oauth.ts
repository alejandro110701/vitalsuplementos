export const WPCOM_AUTHORIZE = "https://public-api.wordpress.com/oauth2-1/authorize";
export const WPCOM_REGISTER = "https://public-api.wordpress.com/oauth2-1/register";
export const WPCOM_TOKEN = "https://public-api.wordpress.com/oauth2-1/token";
export const WPCOM_MCP_RESOURCE = "https://public-api.wordpress.com/wpcom/v2/mcp/v1";
export const SAFARI_REDIRECT = "https://wordpress.com/me/mcp";

export type OAuthState = {
  client_id: string;
  redirect_uri: string;
  code_verifier: string;
  state: string;
  created_at: string;
};

export function base64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export async function createPkce(): Promise<{
  codeVerifier: string;
  codeChallenge: string;
}> {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const codeVerifier = base64Url(bytes);
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(codeVerifier));
  return { codeVerifier, codeChallenge: base64Url(new Uint8Array(digest)) };
}

export function buildAuthorizeUrl(input: {
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  state: string;
  scope?: string;
}): string {
  const url = new URL(WPCOM_AUTHORIZE);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", input.clientId);
  url.searchParams.set("redirect_uri", input.redirectUri);
  url.searchParams.set("code_challenge", input.codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("scope", input.scope ?? "global");
  url.searchParams.set("resource", WPCOM_MCP_RESOURCE);
  url.searchParams.set("state", input.state);
  return url.toString();
}

export async function registerWpcomClient(redirectUris: string[]): Promise<{ client_id: string }> {
  const response = await fetch(WPCOM_REGISTER, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      client_name: "Vital Suplementos wpcom-mcp",
      redirect_uris: redirectUris,
      grant_types: ["authorization_code", "refresh_token"],
      token_endpoint_auth_method: "none",
      scope: "global",
    }),
  });
  const body = (await response.json()) as { client_id?: string; error?: string; error_description?: string };
  if (!response.ok || !body.client_id) {
    throw new Error(body.error_description || body.error || `OAuth register failed (${response.status})`);
  }
  return { client_id: body.client_id };
}

export async function exchangeWpcomCode(input: {
  clientId: string;
  code: string;
  redirectUri: string;
  codeVerifier: string;
}): Promise<Record<string, unknown>> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: input.code,
    redirect_uri: input.redirectUri,
    code_verifier: input.codeVerifier,
    client_id: input.clientId,
  });
  const response = await fetch(WPCOM_TOKEN, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const json = (await response.json()) as Record<string, unknown>;
  if (!response.ok) {
    throw new Error(String(json.error_description || json.error || `token exchange failed (${response.status})`));
  }
  return json;
}

export function authorizePageHtml(authorizeUrl: string): string {
  const safeUrl = authorizeUrl
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Authorize WordPress.com</title>
    <style>
      body { margin: 0; font: 16px/1.5 ui-sans-serif, system-ui, sans-serif; background: #f4f1ea; color: #1b1c19; }
      main { max-width: 36rem; margin: 0 auto; padding: 3rem 1.25rem; }
      a.btn { display: inline-block; background: #0f6b62; color: #fff; text-decoration: none; padding: 0.85rem 1.2rem; }
      textarea { width: 100%; min-height: 8rem; font: 12px/1.4 ui-monospace, monospace; }
    </style>
  </head>
  <body>
    <main>
      <h1>Authorize WordPress.com MCP</h1>
      <p>Open this link in Safari, sign in, and tap Allow. After the redirect, copy the browser address (it contains <code>code=</code>) and paste it back in chat.</p>
      <p><a class="btn" href="${safeUrl}">Open WordPress.com in Safari</a></p>
      <p>Or copy the URL:</p>
      <textarea readonly>${safeUrl}</textarea>
    </main>
  </body>
</html>`;
}
