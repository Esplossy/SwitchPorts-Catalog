import { mkdir, writeFile } from "node:fs/promises";

const sources = [
  {
    url: "https://raw.githubusercontent.com/robzilla10001/SwitchPorts/main/README.md",
    archived: false,
  },
  {
    url: "https://raw.githubusercontent.com/robzilla10001/SwitchPorts/main/DEAD.md",
    archived: true,
  },
];
const PRESERVIA_MANIFEST_URL = "https://raw.githubusercontent.com/preservia/ports/main/ports.json";
const PRESERVIA_RAW_BASE_URL = "https://raw.githubusercontent.com/preservia/ports/main/";
const BTECH_CATALOG_URL = "https://btechgames.com/index.php/wp-json/btech-ports/v1/catalog";
const BTECH_PROJECTS_URL = "https://btechgames.com/index.php/wp-json/btech-ports/v1/watchlist";
const TRUSTED_HOSTS = new Set(["github.com", "raw.githubusercontent.com", "gbatemp.net", "preservia.github.io", "btechgames.com", "opengraph.githubassets.com", "gitlab.com", "flyinghead.github.io", "www.shipofharkinian.com", "eliasoenal.com", "buildbot.libretro.com", "thumbnails.libretro.com", "upload.wikimedia.org"]);

function normalizeTrustedUrl(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  let parsed;
  try { parsed = new URL(value.trim()); } catch { return null; }
  const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
  if (parsed.username || parsed.password || parsed.port || ![...TRUSTED_HOSTS].some((trusted) => host === trusted || host.endsWith(`.${trusted}`))) return null;
  if (parsed.protocol === "http:" && host === "github.com") parsed.protocol = "https:";
  return parsed.protocol === "https:" ? parsed.toString() : null;
}

function cleanCell(value = "") {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/\*+/g, "")
    .replace(/`/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function splitRow(line) {
  const trimmed = line.trim();
  const withoutEdges = trimmed.startsWith("|") ? trimmed.slice(1) : trimmed;
  const content = withoutEdges.endsWith("|") ? withoutEdges.slice(0, -1) : withoutEdges;
  return content.split("|").map((cell) => cell.trim());
}

function isSeparator(line) {
  return splitRow(line).every((cell) => /^:?-{3,}:?$/.test(cell.trim()));
}

function extractLink(value = "") {
  const match = value.match(/\[[^\]]*\]\(([^)]+)\)/);
  if (match) return normalizeTrustedUrl(match[1]) ?? "";
  const raw = cleanCell(value);
  return normalizeTrustedUrl(raw) ?? "";
}

function stripMarker(value = "") {
  return value.replace(/^[🟢🟠🔴]\s*/u, "").trim();
}

function slug(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

function parsePreserviaRecord(record, key) {
  const name = typeof record.name === "string" ? cleanCell(record.name) : "";
  if (!name) return null;
  const source = normalizeTrustedUrl(record.source) ?? "https://github.com/preservia/ports";
  const icon = typeof record.icon === "string" ? record.icon.replace(/^\/+/, "") : "";
  return {
    id: slug(`preservia-${key}-${name}`),
    name,
    system: "Nintendo Switch",
    category: "Preservia Archive",
    version: typeof record.version === "string" ? record.version : "n/a",
    lastUpdated: "n/a",
    firmware: "n/d",
    repoUrl: source,
    threadUrl: "",
    archived: false,
    recent: false,
    source: "Preservia",
    ...(normalizeTrustedUrl(`https://preservia.github.io/ports/${icon}`) ? { imageUrl: normalizeTrustedUrl(`https://preservia.github.io/ports/${icon}`) } : {}),
  };
}

function classifyBtechType(platform) {
  if (/emulator/i.test(platform)) return "Emulador";
  if (/android/i.test(platform)) return "Android";
  if (/xbox|playstation|gamecube|gameboy|nintendo|sega|arcade|super nintendo/i.test(platform)) return "Port";
  return "Outro";
}

function classifyBtechProjectType(kind, platform) {
  if (kind === "pack" || /pack/i.test(platform)) return "Pack";
  if (kind === "utilitario" || /util/i.test(platform)) return "Utilitário";
  return "Outro";
}

function parseBtechRecords(records) {
  return records.flatMap((record) => {
    const name = typeof record.title === "string" ? cleanCell(record.title) : "";
    const repoUrl = normalizeTrustedUrl(record.project_url) ?? "";
    if (!name || !repoUrl) return [];
    const platform = typeof record.platform === "string" ? cleanCell(record.platform) : "BTech Games";
    const type = classifyBtechType(platform);
    return [{
      id: slug(`btech-${String(record.id ?? name)}-${name}-${repoUrl}`),
      name,
      system: typeof record.system === "string" && record.system ? cleanCell(record.system) : platform,
      category: `BTech · ${type}`,
      version: typeof record.version === "string" ? cleanCell(record.version) || "n/a" : "n/a",
      lastUpdated: typeof record.source_date === "string" ? record.source_date : "n/a",
      firmware: "n/d",
      repoUrl,
      threadUrl: normalizeTrustedUrl(record.thread_url) ?? "",
      archived: false,
      recent: record.source_marker === "highlight",
      source: "BTech",
      catalogType: type,
      ...(normalizeTrustedUrl(record.cover_url) ? { imageUrl: normalizeTrustedUrl(record.cover_url) } : {}),
    }];
  });
}

function parseBtechProjectRecords(records) {
  return records.flatMap((record) => {
    const name = typeof record.title === "string" ? cleanCell(record.title) : "";
    const repoUrl = normalizeTrustedUrl(record.project_url) ?? "";
    if (!name || !repoUrl) return [];
    const platform = typeof record.platform === "string" ? cleanCell(record.platform) : "BTech Games";
    const type = classifyBtechProjectType(typeof record.kind === "string" ? record.kind : "", platform);
    return [{
      id: slug(`btech-project-${String(record.id ?? name)}-${name}-${repoUrl}`),
      name,
      system: platform,
      category: `BTech Projetos · ${type}`,
      version: typeof record.version === "string" ? cleanCell(record.version) || "n/a" : "n/a",
      lastUpdated: typeof record.source_date === "string" ? record.source_date : "n/a",
      firmware: "n/d",
      repoUrl,
      threadUrl: normalizeTrustedUrl(record.thread_url) ?? "",
      archived: Boolean(record.archived),
      recent: record.last_change === "novo" || record.source_marker === "highlight",
      source: "BTechProjects",
      catalogType: type,
      ...(normalizeTrustedUrl(record.cover_url) ? { imageUrl: normalizeTrustedUrl(record.cover_url) } : {}),
    }];
  });
}

function parseMarkdown(markdown, archived) {
  const text = markdown.replace(/<!--[\s\S]*?-->/g, "");
  const lines = text.split(/\r?\n/);
  const items = [];
  let category = "Outros";
  let headers = null;
  let lastSystem = "";

  for (const line of lines) {
    const heading = line.match(/^###\s+(.+?)\s*$/);
    if (heading) {
      category = cleanCell(heading[1]);
      headers = null;
      lastSystem = "";
      continue;
    }

    if (!line.includes("|") || /^\s*[-⎯]/.test(line)) continue;
    const cells = splitRow(line);
    if (cells.length < 3) continue;

    if (!headers && !isSeparator(line)) {
      const possible = cells.map(cleanCell).map((cell) => cell.toLowerCase());
      if (possible.some((cell) => /^(system|game|title|software)$/.test(cell)) && possible.includes("version")) {
        headers = possible;
      }
      continue;
    }
    if (isSeparator(line) || !headers) continue;

    const row = Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""]));
    const nameValue = row.title || row.game || row.software || "";
    const nameWithMarker = cleanCell(nameValue);
    const name = stripMarker(nameWithMarker);
    if (!name || /^(title|game|software)$/i.test(name)) continue;

    const systemValue = cleanCell(row.system || "");
    if (systemValue) lastSystem = stripMarker(systemValue);
    const system = lastSystem || category;
    const version = cleanCell(row.version || "") || "n/a";
    const lastUpdated = cleanCell(row["last updated?"] || row["last updated"] || "") || "n/a";
    const repoUrl = extractLink(row.link || "");
    const threadUrl = extractLink(row["gbatemp thread?"] || row["gbatemp thread"] || "");
    const firmware = cleanCell(row["updated for fw 21+?"] || row["updated for fw 21+"] || "");
    if (!repoUrl && !threadUrl) continue;

    const id = slug(`${category}-${system}-${name}-${repoUrl}`) || `item-${items.length + 1}`;
    items.push({
      id,
      name,
      system,
      category,
      version,
      lastUpdated,
      firmware: firmware || "n/d",
      repoUrl,
      threadUrl,
      archived,
      recent: nameWithMarker.startsWith("🟢"),
      source: "SwitchPorts",
    });
  }

  return items;
}

const allItems = [];
for (const source of sources) {
  const response = await fetch(source.url);
  if (!response.ok) throw new Error(`Falha ao baixar ${source.url}: ${response.status}`);
  allItems.push(...parseMarkdown(await response.text(), source.archived));
}

const preserviaManifestResponse = await fetch(PRESERVIA_MANIFEST_URL);
if (preserviaManifestResponse.ok) {
  const manifest = await preserviaManifestResponse.json();
  const keys = Array.isArray(manifest) ? manifest.map(String) : Object.values(manifest).map(String);
  const records = await Promise.all(keys.map(async (key) => {
    const response = await fetch(`${PRESERVIA_RAW_BASE_URL}ports/${key}.json`);
    return { key, record: response.ok ? await response.json() : {} };
  }));
  allItems.push(...records.map(({ key, record }) => parsePreserviaRecord(record, key)).filter(Boolean));
}

const btechFirstResponse = await fetch(`${BTECH_CATALOG_URL}?page=1`);
if (btechFirstResponse.ok) {
  const firstPage = await btechFirstResponse.json();
  const pages = Math.min(Math.max(Number(firstPage.pagination?.pages ?? 1), 1), 30);
  const records = [...(firstPage.items ?? [])];
  for (let page = 2; page <= pages; page += 1) {
    const response = await fetch(`${BTECH_CATALOG_URL}?page=${page}`);
    if (response.ok) records.push(...((await response.json()).items ?? []));
  }
  allItems.push(...parseBtechRecords(records));
}

const btechProjectsResponse = await fetch(BTECH_PROJECTS_URL);
if (btechProjectsResponse.ok) {
  const payload = await btechProjectsResponse.json();
  allItems.push(...parseBtechProjectRecords(payload.items ?? []));
}

const seenProjects = new Set();
const unique = allItems.filter((item) => {
  const projectKey = item.repoUrl.trim().toLocaleLowerCase("pt-BR").replace(/\/?(?:releases|\.git)\/?$/, "");
  const key = `${item.source ?? "SwitchPorts"}:${projectKey || item.name.trim().toLocaleLowerCase("pt-BR")}`;
  if (seenProjects.has(key)) return false;
  seenProjects.add(key);
  return true;
});
unique.sort((a, b) => Number(a.archived) - Number(b.archived) || a.category.localeCompare(b.category) || a.name.localeCompare(b.name));

await mkdir("data", { recursive: true });
const output = `// Generated by scripts/generate-catalog-seed.mjs. Do not edit manually.\nimport type { CatalogItem } from "@/lib/catalog";\n\nexport const CATALOG_SEED: CatalogItem[] = ${JSON.stringify(unique, null, 2)};\n`;
await writeFile("data/catalog-seed.ts", output);
console.log(`Generated ${unique.length} catalog items (${unique.filter((item) => !item.archived).length} active, ${unique.filter((item) => item.archived).length} archived).`);
