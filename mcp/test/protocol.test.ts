import { describe, expect, it } from "vitest";
import { landingHtml } from "../src/landing";

describe("landingHtml", () => {
  it("embeds the worker MCP URL in client config", () => {
    const html = landingHtml("https://wpcom-mcp.example.workers.dev");
    expect(html).toContain("https://wpcom-mcp.example.workers.dev/mcp");
    expect(html).toContain("wpcom-mcp");
    expect(html).toContain("vital_catalog");
    expect(html).toContain("WPCOM_ACCESS_TOKEN");
  });
});
