export const DEFAULT_WPCOM_MCP_URL =
  "https://public-api.wordpress.com/wpcom/v2/mcp/v1";

export type WpcomRpcResult = {
  ok: boolean;
  status: number;
  body: unknown;
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

export async function wpcomRpc(options: {
  url: string;
  token: string;
  method: string;
  params?: unknown;
}): Promise<WpcomRpcResult> {
  const response = await fetch(options.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${options.token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
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

  return { ok: response.ok, status: response.status, body };
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
      "Enable MCP first: https://wordpress.com/me/mcp",
      "Official server: https://public-api.wordpress.com/wpcom/v2/mcp/v1",
    ].join(" "),
    true,
  );
}
