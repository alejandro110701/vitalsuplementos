/**
 * Local stdio bridge to the live shop's WooCommerce MCP.
 *
 * Cursor talks to this process on stdin/stdout. The process forwards MCP
 * messages to https://vitalsuplementos.com.mx/wp-json/woocommerce/mcp using
 * the shop's REST consumer key as `X-MCP-API-Key`.
 *
 * Do not put keys in this file. Set WOO_KEY and WOO_SECRET in `.env`
 * (see `.env.example`) or in the environment.
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const key = process.env.WOO_KEY;
const secret = process.env.WOO_SECRET;
if (!key || !secret) {
  console.error(
    'woo-mcp-local: set WOO_KEY and WOO_SECRET. Copy .env.example to .env and fill the shop REST key.'
  );
  process.exit(1);
}

const env = {
  ...process.env,
  WP_API_URL:
    process.env.WP_API_URL || 'https://vitalsuplementos.com.mx/wp-json/woocommerce/mcp',
  CUSTOM_HEADERS: JSON.stringify({ 'X-MCP-API-Key': `${key}:${secret}` }),
  // WooCommerce MCP authenticates with the API-key header, not WordPress.com OAuth.
  OAUTH_ENABLED: 'false'
};

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const bin = join(root, 'node_modules', '.bin', 'mcp-wordpress-remote');
const child = existsSync(bin)
  ? spawn(bin, [], { env, stdio: 'inherit' })
  : spawn('npx', ['-y', '@automattic/mcp-wordpress-remote@0.4.0'], {
      env,
      stdio: 'inherit'
    });

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
