# wpcom-mcp

Remote [Model Context Protocol](https://modelcontextprotocol.io/) server on Cloudflare Workers. It exposes Vital Suplementos shop tools and proxies the official WordPress.com MCP endpoint:

`https://public-api.wordpress.com/wpcom/v2/mcp/v1`

## Tools

| Tool | Auth | What it does |
| --- | --- | --- |
| `vital_catalog` | none | Live WooCommerce Store API catalogue, mapped onto Vital slugs |
| `vital_product` | none | One product by slug or WooCommerce id |
| `vital_site` | none | Store URL, default `wpcom_site`, and whether a token is present |
| `wpcom_list_tools` | WordPress.com token | `tools/list` against the official server |
| `wpcom_call` | WordPress.com token | Call any official tool by name |
| `wpcom_content` | WordPress.com token | `wpcom-mcp-content-authoring` facade |
| `wpcom_site` | WordPress.com token | `wpcom-mcp-site` facade |
| `wpcom_account` | WordPress.com token | `wpcom-mcp-account` facade |
| `wpcom_sites` | WordPress.com token | `wpcom-user-sites` |

Write operations on WordPress.com still require `user_confirmed: true` in the execute params, as the official server enforces.

## Connect a client

The project Cursor config in `.cursor/mcp.json` points at the official WordPress.com server. Cursor will run the WordPress.com OAuth 2.1 flow on first connect.

```json
{
  "mcpServers": {
    "wpcom-mcp": {
      "url": "https://public-api.wordpress.com/wpcom/v2/mcp/v1"
    }
  }
}
```

This Worker is an extra edge endpoint with Vital shop tools plus a WP.com proxy. Locally it is `http://localhost:8788/mcp`; after deploy, `https://<worker>.workers.dev/mcp`.

## WordPress.com authentication

1. Enable MCP on the account at [wordpress.com/me/mcp](https://wordpress.com/me/mcp).

To get a Safari authorization link:

```bash
npm run oauth:start
```

Open the printed `authorize_url` in Safari, tap Allow, then paste the redirected URL (it contains `code=`) back so the token can be exchanged. The Worker also serves the same flow at `/oauth/start`.
2. Pass `Authorization: Bearer <access_token>` on MCP requests, **or** set the Worker secret `WPCOM_ACCESS_TOKEN`.
3. Default site is `vitalsuplementos.com.mx` (`WPCOM_SITE`).

```bash
npx wrangler secret put WPCOM_ACCESS_TOKEN
```

Locally, copy `.dev.vars.example` to `.dev.vars`.

## Develop

```bash
cd mcp
npm install
npm test
npm start          # http://localhost:8788/mcp
npx wrangler deploy
```

The Worker is stateless (`createMcpHandler` from the Agents SDK). Shop reads go to `https://vitalsuplementos.com.mx/wp-json/wc/store/v1/products`. WordPress.com calls go to the official MCP URL and never log or return the access token.
