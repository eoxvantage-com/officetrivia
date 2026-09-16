import { Client } from "@taruvi/sdk";

/**
 * Taruvi configuration, injected at build time by Vite `define` from the
 * TARUVI_* variables (see vite.config.ts). Vite reads them from the process
 * environment as well as from `.env` / `.env.local`, so a `.env` file is
 * optional — the app boots either way and only warns when values are missing.
 */
const configuredSiteUrl = __TARUVI_SITE_URL__;
const configuredApiKey = __TARUVI_API_KEY__;
const configuredAppSlug = __TARUVI_APP_SLUG__;

const missingConfig = Object.entries({
  TARUVI_SITE_URL: configuredSiteUrl,
  TARUVI_API_KEY: configuredApiKey,
  TARUVI_APP_SLUG: configuredAppSlug,
})
  .filter(([, value]) => !value)
  .map(([key]) => key);

/** True when every TARUVI_* variable was provided at build time. */
export const isTaruviConfigured = missingConfig.length === 0;

if (!isTaruviConfigured) {
  console.warn(
    `[taruvi] Missing configuration: ${missingConfig.join(", ")}. ` +
      "Set them as TARUVI_* environment variables (or in a .env file — see .env.example). " +
      "Taruvi API requests will fail until they are provided."
  );
}

// Fallbacks so the SDK client can be constructed without configuration:
// - site URL defaults to the page origin, which is correct when the app is
//   served from the Taruvi site as a frontend worker;
// - the SDK rejects an empty API key, so a clearly-invalid placeholder is used.
const siteUrl =
  configuredSiteUrl ||
  (typeof window !== "undefined" ? window.location.origin : "");
const apiKey = configuredApiKey || "unconfigured";

/**
 * Taruvi Client instance configured with environment variables.
 * Participant-facing setup uses TARUVI_* variables injected into the client
 * build through Vite configuration.
 * Used for Navkit, DataProviders, and direct SDK operations.
 *
 * @example
 * // Use with Refine providers (recommended)
 * import { taruviDataProvider, taruviAuthProvider } from "./providers/refineProviders";
 *
 * @example
 * // Direct SDK usage (advanced)
 * import { taruviClient } from "./taruviClient";
 * const response = await taruviClient.httpClient.get("api/...");
 *
 * @see {@link https://docs.taruvi.com|Taruvi Documentation}
 */
export const taruviClient = new Client({
  apiKey,
  appSlug: configuredAppSlug,
  apiUrl: siteUrl,
});
