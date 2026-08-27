/**
 * Local stdio bridge to the live shop's WooCommerce MCP.
 *
 * Cursor talks to this process on stdin/stdout. The process forwards MCP
 * messages to https://vitalsuplementos.com.mx/wp-json/woocommerce/mcp using
 * the shop's REST consumer key as `X-MCP-API-Key`.
 *
 * Do not put keys in this file. Set the shop REST key in `.env` or as
 * environment secrets. Accepted names (first match wins):
 *   key:    WOO_KEY, WOO_key, wookey, WOOKEY
 *   secret: WOO_SECRET, WOO_secret, woosecret, WOOSECRET
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

function firstEnv(...names) {
  for (const name of names) {
    const value = process.env[name];
    if (value && value.trim()) return value.trim();
  }
  return '';
}

const key = firstEnv('WOO_KEY', 'WOO_key', 'wookey', 'WOOKEY', 'woo_key');
const secret = firstEnv('WOO_SECRET', 'WOO_secret', 'woosecret', 'WOOSECRET', 'woo_secret');
if (!key || !secret) {
  console.error(
    'woo-mcp-local: missing shop REST credentials. Set WOO_key/WOO_secret (or WOO_KEY/WOO_SECRET) in the environment or in .env.'
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
