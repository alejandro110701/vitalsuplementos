export const DEFAULT_WPCOM_MCP_URL =
  "https://public-api.wordpress.com/wpcom/v2/mcp/v1";

export type WpcomRpcResult = {
  ok: boolean;
  status: number;
  body: unknown;
  sessionId?: string | null;
};

export function textResult(text: string, isError = false) {
  return {
    content: [{ type: "text" as const, text }],
    isError,
  };
}

export function jsonResult(value: unknown, isError = false) {
  return textResult(JSON.stringify(value, null, 2), isError);
}

export async function wpcomPost(options: {
  url: string;
  token: string;
  method: string;
  params?: unknown;
  id?: number;
  sessionId?: string | null;
}): Promise<WpcomRpcResult> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${options.token}`,
    Accept: "application/json, text/event-stream",
    "Content-Type": "application/json",
  };
  if (options.sessionId) headers["Mcp-Session-Id"] = options.sessionId;

  const response = await fetch(options.url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: options.id ?? 1,
      method: options.method,
      params: options.params ?? {},
    }),
  });

  const raw = await response.text();
  let body: unknown = raw;
  try {
    body = raw ? JSON.parse(raw) : null;
  } catch {
    body = { raw };
  }

  const sessionId = response.headers.get("mcp-session-id") ?? options.sessionId ?? null;
  const rpcError =
    body && typeof body === "object" && "error" in body
      ? (body as { error: unknown }).error
      : null;

  return {
    ok: response.ok && !rpcError,
    status: response.status,
    body: rpcError
      ? body
      : body && typeof body === "object" && "result" in body
        ? (body as { result: unknown }).result
        : body,
    sessionId,
  };
}

export async function wpcomRpc(options: {
  url: string;
  token: string;
  method: string;
  params?: unknown;
}): Promise<WpcomRpcResult> {
  const session = await wpcomPost({
    url: options.url,
    token: options.token,
    method: "initialize",
    params: {
      protocolVersion: "2025-11-25",
      capabilities: {},
      clientInfo: { name: "wpcom-mcp", version: "1.0.0" },
    },
    id: 1,
  });
  if (!session.ok && !session.sessionId) return session;

  return wpcomPost({
    url: options.url,
    token: options.token,
    method: options.method,
    params: options.params,
    id: 2,
    sessionId: session.sessionId,
  });
}

export function resolveToken(
  request: Request,
  envToken: string | undefined,
): string | null {
  const header = request.headers.get("Authorization");
  if (header?.toLowerCase().startsWith("bearer ")) {
    const token = header.slice(7).trim();
    if (token) return token;
  }
  const fallback = envToken?.trim();
  return fallback ? fallback : null;
}

export function missingTokenResult() {
  return textResult(
    [
      "WordPress.com authentication is required for this tool.",
      "Pass Authorization: Bearer <access_token> on the MCP request,",
      "or set the WPCOM_ACCESS_TOKEN Worker secret.",
      "Enable MCP first: https://my.wordpress.com/me/preferences/mcp",
      "Official server: https://public-api.wordpress.com/wpcom/v2/mcp/v1",
    ].join(" "),
    true,
  );
}
