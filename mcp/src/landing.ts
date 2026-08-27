export function landingHtml(origin: string): string {
  const mcpUrl = `${origin}/mcp`;
  const officialUrl = "https://public-api.wordpress.com/wpcom/v2/mcp/v1";
  const config = JSON.stringify(
    {
      mcpServers: {
        "wpcom-mcp": {
          url: officialUrl,
        },
      },
    },
    null,
    2,
  );

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>wpcom-mcp</title>
    <style>
      :root {
        color-scheme: light;
        --ink: #1b1c19;
        --paper: #f4f1ea;
        --teal: #0f6b62;
        --line: #d8d3c8;
      }
      body {
        margin: 0;
        font: 16px/1.5 ui-sans-serif, system-ui, sans-serif;
        color: var(--ink);
        background: var(--paper);
      }
      main {
        max-width: 44rem;
        margin: 0 auto;
        padding: 3rem 1.25rem 4rem;
      }
      h1 { font-size: 1.75rem; letter-spacing: -0.03em; }
      h2 { font-size: 1.05rem; margin-top: 2rem; }
      code, pre {
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 0.86rem;
      }
      pre {
        overflow: auto;
        padding: 1rem;
        background: #fff;
        border: 1px solid var(--line);
      }
      a { color: var(--teal); }
      .muted { color: #5c5a54; }
    </style>
  </head>
  <body>
    <main>
      <p class="muted">Cloudflare Worker · Model Context Protocol</p>
      <h1>wpcom-mcp</h1>
      <p>
        Remote MCP server for
        <a href="https://vitalsuplementos.com.mx">Vital Suplementos</a>
        and WordPress.com. Shop tools read the public WooCommerce Store API.
        WordPress.com tools proxy
        <a href="https://developer.wordpress.com/docs/mcp/">the official MCP endpoint</a>.
      </p>
      <h2>Connect a client</h2>
      <pre>${escapeHtml(config)}</pre>
      <p class="muted">
        Official WordPress.com MCP (recommended):
        <code>${escapeHtml(officialUrl)}</code>
      </p>
      <p class="muted">This Worker: <code>${escapeHtml(mcpUrl)}</code></p>
      <h2>WordPress.com auth</h2>
      <p>
        <a href="/oauth/start">Get a Safari authorization link</a>.
        Enable MCP on the account first, then send
        <code>Authorization: Bearer &lt;token&gt;</code>
        or set the <code>WPCOM_ACCESS_TOKEN</code> Worker secret.
        You can also connect clients directly to
        <code>https://public-api.wordpress.com/wpcom/v2/mcp/v1</code>
        and use this Worker for Vital shop tools.
      </p>
      <h2>Tools</h2>
      <ul>
        <li><code>vital_catalog</code> — live shop catalogue</li>
        <li><code>vital_product</code> — one product by slug or WooCommerce id</li>
        <li><code>vital_site</code> — store URL, default site, auth status</li>
        <li><code>wpcom_list_tools</code> — list official WordPress.com MCP tools</li>
        <li><code>wpcom_call</code> — call any official WordPress.com MCP tool</li>
        <li><code>wpcom_content</code> — content-authoring facade</li>
        <li><code>wpcom_site</code> — site settings, stats, plugins, activity</li>
        <li><code>wpcom_account</code> — account profile and domains</li>
        <li><code>wpcom_sites</code> — sites the authenticated user can access</li>
      </ul>
    </main>
  </body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
