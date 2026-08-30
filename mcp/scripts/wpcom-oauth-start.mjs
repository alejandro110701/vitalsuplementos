/**
 * Register a WordPress.com OAuth client and print a Safari authorize URL.
 * State is written to mcp/.oauth-state.json (gitignored) and the agent store.
 */
import { createHash, randomBytes } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REGISTER = "https://public-api.wordpress.com/oauth2-1/register";
const AUTHORIZE = "https://public-api.wordpress.com/oauth2-1/authorize";
const RESOURCE = "https://public-api.wordpress.com/wpcom/v2/mcp/v1";
const REDIRECT = process.env.WPCOM_REDIRECT_URI || "https://wordpress.com/me/mcp";

const verifier = randomBytes(32).toString("base64url");
const challenge = createHash("sha256").update(verifier).digest("base64url");
const state = randomBytes(16).toString("hex");

const register = await fetch(REGISTER, {
  method: "POST",
  headers: { Accept: "application/json", "Content-Type": "application/json" },
  body: JSON.stringify({
    client_name: "Vital Suplementos wpcom-mcp",
    redirect_uris: [
      REDIRECT,
      "http://127.0.0.1:8788/oauth/callback",
      "http://localhost:8788/oauth/callback",
    ],
    grant_types: ["authorization_code", "refresh_token"],
    token_endpoint_auth_method: "none",
    scope: "global",
  }),
});

const registration = await register.json();
if (!register.ok || !registration.client_id) {
  console.error(JSON.stringify(registration, null, 2));
  process.exit(1);
}

const authorize = new URL(AUTHORIZE);
authorize.searchParams.set("response_type", "code");
authorize.searchParams.set("client_id", registration.client_id);
authorize.searchParams.set("redirect_uri", REDIRECT);
authorize.searchParams.set("code_challenge", challenge);
authorize.searchParams.set("code_challenge_method", "S256");
authorize.searchParams.set("scope", "global");
authorize.searchParams.set("resource", RESOURCE);
authorize.searchParams.set("state", state);

const payload = {
  client_id: registration.client_id,
  redirect_uri: REDIRECT,
  code_verifier: verifier,
  state,
  created_at: new Date().toISOString(),
  authorize_url: authorize.toString(),
};

const here = dirname(fileURLToPath(import.meta.url));
writeFileSync(join(here, "../.oauth-state.json"), JSON.stringify(payload, null, 2));

const storeDir = "/cursor/stores/self";
try {
  mkdirSync(storeDir, { recursive: true });
  writeFileSync(join(storeDir, "wpcom-oauth.json"), JSON.stringify(payload, null, 2));
} catch (error) {
  console.warn("store write skipped", error);
}

console.log(JSON.stringify({ authorize_url: payload.authorize_url, client_id: payload.client_id, state }, null, 2));
