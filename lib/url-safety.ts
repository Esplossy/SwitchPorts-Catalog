const TRUSTED_HOSTS = [
  "github.com",
  "raw.githubusercontent.com",
  "gbatemp.net",
  "preservia.github.io",
  "btechgames.com",
  "opengraph.githubassets.com",
  "gitlab.com",
  "flyinghead.github.io",
  "www.shipofharkinian.com",
  "eliasoenal.com",
  "buildbot.libretro.com",
  "thumbnails.libretro.com",
  "upload.wikimedia.org",
] as const;

function isTrustedHost(hostname: string) {
  const host = hostname.toLowerCase().replace(/^www\./, "");
  return TRUSTED_HOSTS.some((trusted) => host === trusted || host.endsWith(`.${trusted}`));
}

/**
 * Keeps catalog links on HTTPS and on domains that are expected for this app.
 * A small exception upgrades legacy GitHub HTTP links to HTTPS.
 */
export function normalizeTrustedUrl(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const raw = value.trim();
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return null;
  }
  if (parsed.username || parsed.password || parsed.port || !isTrustedHost(parsed.hostname)) return null;
  if (parsed.protocol === "http:" && parsed.hostname.toLowerCase().replace(/^www\./, "") === "github.com") {
    parsed.protocol = "https:";
  }
  if (parsed.protocol !== "https:") return null;
  return parsed.toString();
}

export function isTrustedUrl(value: unknown): value is string {
  return normalizeTrustedUrl(value) !== null;
}
