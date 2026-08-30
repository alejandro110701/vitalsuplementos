import { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";
import {
  findCatalogProduct,
  mapStoreProduct,
  type StoreProduct,
} from "./catalog";
import {
  DEFAULT_WPCOM_MCP_URL,
  jsonResult,
  missingTokenResult,
  resolveToken,
  textResult,
  wpcomRpc,
} from "./wpcom";

export type WorkerEnv = Env & {
  WPCOM_ACCESS_TOKEN?: string;
};

const facadeAction = z.enum(["list", "describe", "execute", "get"]);

export function createServer(env: WorkerEnv, request: Request) {
  const server = new McpServer({
    name: "wpcom-mcp",
    version: "1.0.0",
  });

  const storeUrl = trimSlash(env.VITAL_STORE_URL || "https://vitalsuplementos.com.mx");
  const wpcomUrl = env.WPCOM_MCP_URL || DEFAULT_WPCOM_MCP_URL;
  const defaultSite = env.WPCOM_SITE || "vitalsuplementos.com.mx";
  const token = resolveToken(request, env.WPCOM_ACCESS_TOKEN);

  server.registerTool(
    "vital_catalog",
    {
      description:
        "List live Vital Suplementos products from the WooCommerce Store API, mapped onto catalogue slugs.",
      inputSchema: {
        in_stock: z.boolean().optional(),
      },
    },
    async ({ in_stock }) => {
      const products = await loadCatalog(storeUrl);
      const filtered =
        typeof in_stock === "boolean"
          ? products.filter((product) => product.inStock === in_stock)
          : products;
      return jsonResult({ store: storeUrl, count: filtered.length, products: filtered });
    },
  );

  server.registerTool(
    "vital_product",
    {
      description:
        "Get one Vital Suplementos product by catalogue slug or WooCommerce id, using live shop price and stock.",
      inputSchema: {
        slug: z.string().optional(),
        id: z.number().int().optional(),
      },
    },
    async ({ slug, id }) => {
      if (!slug && typeof id !== "number") {
        return textResult("Provide slug or id.", true);
      }
      const products = await loadCatalog(storeUrl);
      const product = findCatalogProduct(products, { slug, id });
      if (!product) {
        return textResult(`Product not found: ${slug ?? id}`, true);
      }
      return jsonResult(product);
    },
  );

  server.registerTool(
    "vital_site",
    {
      description:
        "Return Vital store metadata, the default WordPress.com site, and whether a WP.com token is present (never the token itself).",
      inputSchema: {},
    },
    async () =>
      jsonResult({
        store: storeUrl,
        wpcom_site: defaultSite,
        wpcom_mcp_url: wpcomUrl,
        wpcom_authenticated: Boolean(token),
        official_mcp: DEFAULT_WPCOM_MCP_URL,
      }),
  );

  server.registerTool(
    "wpcom_list_tools",
    {
      description:
        "List tools exposed by the official WordPress.com MCP server. Requires a WordPress.com access token.",
      inputSchema: {},
    },
    async () => callWpcom(token, wpcomUrl, "tools/list", {}),
  );

  server.registerTool(
    "wpcom_call",
    {
      description:
        "Call any official WordPress.com MCP tool by name. Write operations must include user_confirmed: true in arguments. Requires a WordPress.com access token.",
      inputSchema: {
        name: z.string().min(1),
        arguments: z.record(z.string(), z.unknown()).optional(),
      },
    },
    async ({ name, arguments: args }) =>
      callWpcom(token, wpcomUrl, "tools/call", {
        name,
        arguments: withDefaultSite(args ?? {}, defaultSite, name),
      }),
  );

  server.registerTool(
    "wpcom_content",
    {
      description:
        "WordPress.com content-authoring facade (posts, pages, comments, media, taxonomies). Actions: list, describe, execute. Writes require params.user_confirmed.",
      inputSchema: {
        action: facadeAction,
        operation: z.string().optional(),
        params: z.record(z.string(), z.unknown()).optional(),
        wpcom_site: z.string().optional(),
        include_fields: z.array(z.string()).optional(),
      },
    },
    async (input) =>
      callFacade(token, wpcomUrl, "wpcom-mcp-content-authoring", defaultSite, input),
  );

  server.registerTool(
    "wpcom_site",
    {
      description:
        "WordPress.com site facade (settings, statistics, plugins, activity, themes). Actions: list, describe, execute.",
      inputSchema: {
        action: facadeAction,
        operation: z.string().optional(),
        params: z.record(z.string(), z.unknown()).optional(),
        wpcom_site: z.string().optional(),
        include_fields: z.array(z.string()).optional(),
      },
    },
    async (input) => callFacade(token, wpcomUrl, "wpcom-mcp-site", defaultSite, input),
  );

  server.registerTool(
    "wpcom_account",
    {
      description:
        "WordPress.com account facade (profile, notifications, domains, security). No wpcom_site required.",
      inputSchema: {
        action: facadeAction,
        operation: z.string().optional(),
        params: z.record(z.string(), z.unknown()).optional(),
        include_fields: z.array(z.string()).optional(),
      },
    },
    async (input) =>
      callFacade(token, wpcomUrl, "wpcom-mcp-account", undefined, input),
  );

  server.registerTool(
    "wpcom_sites",
    {
      description:
        "List WordPress.com and Jetpack sites the authenticated user can access.",
      inputSchema: {
        search: z.string().optional(),
        page: z.number().int().optional(),
      },
    },
    async (args) =>
      callWpcom(token, wpcomUrl, "tools/call", {
        name: "wpcom-user-sites",
        arguments: args,
      }),
  );

  return server;
}

async function loadCatalog(storeUrl: string) {
  const response = await fetch(`${storeUrl}/wp-json/wc/store/v1/products?per_page=100`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`Store API ${response.status} ${response.statusText}`);
  }
  const live = (await response.json()) as StoreProduct[];
  return live.map(mapStoreProduct);
}

async function callWpcom(
  token: string | null,
  url: string,
  method: string,
  params: unknown,
) {
  if (!token) return missingTokenResult();
  const result = await wpcomRpc({ url, token, method, params });
  if (!result.ok) {
    return jsonResult(
      { error: "WordPress.com MCP request failed", status: result.status, body: result.body },
      true,
    );
  }
  return jsonResult(result.body);
}

async function callFacade(
  token: string | null,
  url: string,
  name: string,
  defaultSite: string | undefined,
  input: {
    action: "list" | "describe" | "execute" | "get";
    operation?: string;
    params?: Record<string, unknown>;
    wpcom_site?: string;
    include_fields?: string[];
  },
) {
  const arguments_: Record<string, unknown> = {
    action: input.action,
  };
  if (input.operation) arguments_.operation = input.operation;
  if (input.params) arguments_.params = input.params;
  if (input.include_fields) arguments_.include_fields = input.include_fields;
  if (defaultSite || input.wpcom_site) {
    arguments_.wpcom_site = input.wpcom_site || defaultSite;
  }
  return callWpcom(token, url, "tools/call", { name, arguments: arguments_ });
}

function withDefaultSite(
  args: Record<string, unknown>,
  defaultSite: string,
  toolName: string,
): Record<string, unknown> {
  if (toolName === "wpcom-mcp-account" || args.wpcom_site) return args;
  return { ...args, wpcom_site: defaultSite };
}

function trimSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}
