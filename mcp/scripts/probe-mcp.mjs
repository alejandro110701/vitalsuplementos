/**
 * Exercise the local or remote Streamable HTTP MCP endpoint.
 * Usage: MCP_URL=http://localhost:8788 node scripts/probe-mcp.mjs
 */
const origin = (process.env.MCP_URL || "http://localhost:8788").replace(/\/$/, "");
const mcpUrl = origin.endsWith("/mcp") ? origin : `${origin}/mcp`;
const base = mcpUrl.replace(/\/mcp$/, "");

async function readJson(response) {
  const text = await response.text();
  const event = text
    .split("\n")
    .filter((line) => line.startsWith("data: "))
    .map((line) => line.slice(6))
    .join("\n");
  const payload = event || text;
  try {
    return { status: response.status, json: JSON.parse(payload), raw: text };
  } catch {
    return { status: response.status, json: null, raw: text };
  }
}

async function mcp(method, params, id) {
  const response = await fetch(mcpUrl, {
    method: "POST",
    headers: {
      Accept: "application/json, text/event-stream",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id,
      method,
      params,
    }),
  });
  return readJson(response);
}

const failures = [];
function check(name, ok, detail) {
  const mark = ok ? "ok" : "FAIL";
  console.log(`${mark}  ${name}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures.push(name);
}

const health = await fetch(`${base}/health`).then((r) => r.json());
check("GET /health", health.ok === true && health.name === "wpcom-mcp");

const home = await fetch(`${base}/`);
const html = await home.text();
check("GET / landing", home.ok && html.includes("vital_catalog"));

const init = await mcp(
  "initialize",
  {
    protocolVersion: "2025-03-26",
    capabilities: {},
    clientInfo: { name: "wpcom-mcp-probe", version: "1.0.0" },
  },
  1,
);
check(
  "initialize",
  init.status === 200 && init.json?.result?.serverInfo?.name === "wpcom-mcp",
  init.json?.result?.serverInfo?.name || init.raw.slice(0, 180),
);

const listed = await mcp("tools/list", {}, 2);
const tools = listed.json?.result?.tools?.map((t) => t.name) ?? [];
const expected = [
  "vital_catalog",
  "vital_product",
  "vital_site",
  "wpcom_list_tools",
  "wpcom_call",
  "wpcom_content",
  "wpcom_site",
  "wpcom_account",
  "wpcom_sites",
];
check(
  "tools/list",
  expected.every((name) => tools.includes(name)),
  tools.join(", ") || listed.raw.slice(0, 180),
);

const site = await mcp("tools/call", { name: "vital_site", arguments: {} }, 3);
const siteText = site.json?.result?.content?.[0]?.text ?? "";
check(
  "vital_site",
  siteText.includes("vitalsuplementos.com.mx") && siteText.includes('"wpcom_authenticated": false'),
  siteText.slice(0, 180),
);

const catalog = await mcp("tools/call", { name: "vital_catalog", arguments: {} }, 4);
const catalogBody = JSON.parse(catalog.json?.result?.content?.[0]?.text ?? "{}");
check(
  "vital_catalog",
  Array.isArray(catalogBody.products) && catalogBody.products.length === 16,
  `count=${catalogBody.count ?? "missing"}`,
);

const product = await mcp(
  "tools/call",
  { name: "vital_product", arguments: { slug: "serum-anua" } },
  5,
);
const productBody = JSON.parse(product.json?.result?.content?.[0]?.text ?? "{}");
check(
  "vital_product serum-anua",
  productBody.slug === "serum-anua" && productBody.id === 35 && typeof productBody.price === "number",
  JSON.stringify({ slug: productBody.slug, id: productBody.id, price: productBody.price }),
);

const wpcom = await mcp("tools/call", { name: "wpcom_list_tools", arguments: {} }, 6);
const wpcomText = wpcom.json?.result?.content?.[0]?.text ?? "";
check(
  "wpcom_list_tools without token",
  wpcom.json?.result?.isError === true && wpcomText.includes("WPCOM_ACCESS_TOKEN"),
  wpcomText.slice(0, 180),
);

if (failures.length) {
  console.error(`\n${failures.length} check(s) failed`);
  process.exit(1);
}
console.log("\nall checks passed");
