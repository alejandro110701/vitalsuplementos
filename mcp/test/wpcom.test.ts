import { afterEach, describe, expect, it, vi } from "vitest";
import {
  missingTokenResult,
  resolveToken,
  wpcomRpc,
} from "../src/wpcom";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("resolveToken", () => {
  it("prefers the request Authorization header over the env secret", () => {
    const request = new Request("https://example.com/mcp", {
      headers: { Authorization: "Bearer header-token" },
    });
    expect(resolveToken(request, "env-token")).toBe("header-token");
  });

  it("falls back to the env secret", () => {
    expect(resolveToken(new Request("https://example.com/mcp"), " env-token ")).toBe(
      "env-token",
    );
  });

  it("returns null when neither is set", () => {
    expect(resolveToken(new Request("https://example.com/mcp"), undefined)).toBeNull();
  });
});

describe("missingTokenResult", () => {
  it("tells the client how to authenticate and does not leak a token", () => {
    const result = missingTokenResult();
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("WPCOM_ACCESS_TOKEN");
    expect(result.content[0].text).not.toMatch(/Bearer [A-Za-z0-9._-]+/);
  });
});

describe("wpcomRpc", () => {
  it("POSTs method and params with a bearer token", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ tools: [] }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await wpcomRpc({
      url: "https://public-api.wordpress.com/wpcom/v2/mcp/v1",
      token: "test-token",
      method: "tools/list",
      params: {},
    });

    expect(result.ok).toBe(true);
    expect(result.body).toEqual({ tools: [] });
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://public-api.wordpress.com/wpcom/v2/mcp/v1");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer test-token");
    expect(JSON.parse(String(init.body))).toEqual({ method: "tools/list", params: {} });
  });

  it("surfaces a WordPress.com 401 as a failed result", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(JSON.stringify({ code: "rest_unauthorized" }), { status: 401 }),
      ),
    );

    const result = await wpcomRpc({
      url: "https://public-api.wordpress.com/wpcom/v2/mcp/v1",
      token: "bad",
      method: "tools/list",
    });

    expect(result.ok).toBe(false);
    expect(result.status).toBe(401);
    expect(result.body).toEqual({ code: "rest_unauthorized" });
  });
});
