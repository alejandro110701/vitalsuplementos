import { describe, expect, it } from "vitest";
import { buildAuthorizeUrl, WPCOM_AUTHORIZE, WPCOM_MCP_RESOURCE } from "../src/oauth";

describe("buildAuthorizeUrl", () => {
  it("builds a WordPress.com authorize URL for Safari", () => {
    const url = new URL(
      buildAuthorizeUrl({
        clientId: "client-123",
        redirectUri: "https://wordpress.com/me/mcp",
        codeChallenge: "challenge",
        state: "abc",
      }),
    );
    expect(url.origin + url.pathname).toBe(WPCOM_AUTHORIZE);
    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("client_id")).toBe("client-123");
    expect(url.searchParams.get("redirect_uri")).toBe("https://wordpress.com/me/mcp");
    expect(url.searchParams.get("code_challenge_method")).toBe("S256");
    expect(url.searchParams.get("resource")).toBe(WPCOM_MCP_RESOURCE);
    expect(url.searchParams.get("scope")).toBe("global");
  });
});
