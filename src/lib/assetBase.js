/**
 * Where this build's own files live, worked out at runtime.
 *
 * It cannot be baked in, because the storefront is SERVED from a different path
 * than it is DEPLOYED to. The must-use plugin that puts the shop on the site
 * root reads /tienda/index.html and serves it at /, so anything resolved
 * against the document would look for /packshots and miss, while the real files
 * sit at /tienda/packshots.
 *
 * import.meta.url is the URL this bundle was fetched from — .../tienda/assets/
 * index-abc.js — so its grandparent is the directory holding index.html,
 * assets/ and packshots/. That is true whether the build is deployed to a
 * subdirectory or to the site root, and whether or not something re-serves the
 * shell from somewhere else.
 *
 * In dev nothing is bundled, so import.meta.url points at /src/lib/ and the
 * trick does not apply; the dev server serves public/ from the root instead.
 */
export const ASSET_BASE = import.meta.env.DEV
  ? new URL(import.meta.env.BASE_URL, window.location.origin).href
  : new URL('../', import.meta.url).href;

/** Join a build-relative path (no leading slash) onto that base. */
export function asset(path) {
  return new URL(String(path).replace(/^\//, ''), ASSET_BASE).href;
}
