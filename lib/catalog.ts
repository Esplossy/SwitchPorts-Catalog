import AsyncStorage from "@react-native-async-storage/async-storage";

import { CATALOG_SEED } from "@/data/catalog-seed";

export const REPOSITORY_URL = "https://github.com/robzilla10001/SwitchPorts";
export const README_URL = "https://raw.githubusercontent.com/robzilla10001/SwitchPorts/main/README.md";
export const DEAD_URL = "https://raw.githubusercontent.com/robzilla10001/SwitchPorts/main/DEAD.md";
export const PRESERVIA_MANIFEST_URL = "https://raw.githubusercontent.com/preservia/ports/main/ports.json";
export const PRESERVIA_RAW_BASE_URL = "https://raw.githubusercontent.com/preservia/ports/main/";
export const BTECH_CATALOG_URL = "https://btechgames.com/index.php/wp-json/btech-ports/v1/catalog";
export const BTECH_PROJECTS_URL = "https://btechgames.com/index.php/wp-json/btech-ports/v1/watchlist";
export const COMPLEMENTARY_SOURCES = [
  {
    name: "Preservia Port Archive",
    description: "Arquivo curado de ports homebrew com metadados e links de origem.",
    url: "https://preservia.github.io/ports/",
    repositoryUrl: "https://github.com/preservia/ports",
  },
  {
    name: "Ultimate Switch Port Thread",
    description: "Discussão comunitária do GBATemp com novidades e sugestões de ports.",
    url: "https://gbatemp.net/threads/ultimate-switch-port-thread.683071/",
    repositoryUrl: "https://github.com/robzilla10001/SwitchPorts",
  },
  {
    name: "GitHub · switch-homebrew",
    description: "Descoberta ampla de projetos marcados com o tópico switch-homebrew.",
    url: "https://github.com/topics/switch-homebrew",
    repositoryUrl: "https://github.com/topics/switch-homebrew",
  },
  {
    name: "BTech Games · Central de Ports",
    description: "Catálogo público com ports, emuladores e projetos classificados pela plataforma de origem.",
    url: "https://btechgames.com/index.php/status_ports/",
    repositoryUrl: "https://btechgames.com/index.php/wp-json/btech-ports/v1/catalog",
  },
] as const;

export type CatalogItem = {
  id: string;
  name: string;
  system: string;
  category: string;
  version: string;
  lastUpdated: string;
  firmware: string;
  repoUrl: string;
  threadUrl: string;
  archived: boolean;
  recent: boolean;
  source?: "SwitchPorts" | "Preservia" | "BTech" | "BTechProjects";
  catalogType?: "Port" | "Emulador" | "Android" | "Pack" | "Utilitário" | "Outro";
  imageUrl?: string;
  externalImageUrl?: string;
  githubPopularity?: GithubPopularity;
};

export type GithubPopularity = { stars: number; forks: number; watchers: number; openIssues: number; fetchedAt: string };

export type FirmwareStatus = "fw21" | "older" | "unknown";
export type CatalogChangeType = "added" | "updated" | "removed";
export type CatalogChange = { id: string; name: string; type: CatalogChangeType; source: string; detectedAt: string };

export type SyncState = "loading" | "ready" | "syncing" | "offline" | "error";

export type CatalogSort = "recent" | "oldest" | "name" | "popularity";

export type CachedCatalog = {
  items: CatalogItem[];
  syncedAt: string;
};

const CATALOG_CACHE_KEY = "switchports.catalog.cache.v1";
const PREFERENCES_KEY = "switchports.preferences.v2";
const GITHUB_POPULARITY_CACHE_KEY = "switchports.github.popularity.v1";

function cleanCell(value = "") {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/\*+/g, "")
    .replace(/`/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function splitRow(line: string) {
  const trimmed = line.trim();
  const withoutEdges = trimmed.startsWith("|") ? trimmed.slice(1) : trimmed;
  const content = withoutEdges.endsWith("|") ? withoutEdges.slice(0, -1) : withoutEdges;
  return content.split("|").map((cell) => cell.trim());
}

function isSeparator(line: string) {
  return splitRow(line).every((cell) => /^:?-{3,}:?$/.test(cell.trim()));
}

function extractLink(value = "") {
  const match = value.match(/\[[^\]]*\]\(([^)]+)\)/);
  if (match) return match[1].trim();
  const raw = cleanCell(value);
  return /^https?:\/\//i.test(raw) ? raw : "";
}

function stripMarker(value = "") {
  return value.replace(/^[🟢🟠🔴]\s*/u, "").trim();
}

function slug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

type PreserviaRecord = { name?: unknown; icon?: unknown; version?: unknown; source?: unknown };

function parsePreserviaRecord(record: PreserviaRecord, key: string): CatalogItem | null {
  const name = typeof record.name === "string" ? cleanCell(record.name) : "";
  if (!name) return null;
  const source = typeof record.source === "string" && /^https?:\/\//i.test(record.source) ? record.source : "https://github.com/preservia/ports";
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
    imageUrl: icon ? `https://preservia.github.io/ports/${icon}` : undefined,
  };
}

export function parsePreserviaRecords(manifest: unknown, records: Array<{ key: string; record: PreserviaRecord }>) {
  const keys = Array.isArray(manifest) ? manifest.map(String) : Object.values((manifest ?? {}) as Record<string, unknown>).map(String);
  const byKey = new Map(records.map((entry) => [entry.key, entry.record]));
  return keys.map((key) => parsePreserviaRecord(byKey.get(key) ?? {}, key)).filter((item): item is CatalogItem => Boolean(item));
}

type BtechRecord = { id?: unknown; platform?: unknown; title?: unknown; system?: unknown; kind?: unknown; version?: unknown; source_date?: unknown; project_url?: unknown; thread_url?: unknown; source_marker?: unknown; cover_url?: unknown; archived?: unknown; last_change?: unknown };

function classifyBtechType(platform: string): CatalogItem["catalogType"] {
  if (/emulator/i.test(platform)) return "Emulador";
  if (/android/i.test(platform)) return "Android";
  if (/xbox|playstation|gamecube|gameboy|nintendo|sega|arcade|super nintendo/i.test(platform)) return "Port";
  return "Outro";
}

function classifyBtechProjectType(kind: string, platform: string): CatalogItem["catalogType"] {
  if (kind === "pack" || /pack/i.test(platform)) return "Pack";
  if (kind === "utilitario" || /util/i.test(platform)) return "Utilitário";
  return "Outro";
}

export function parseBtechRecords(records: BtechRecord[]) {
  return records.flatMap((record) => {
    const title = typeof record.title === "string" ? cleanCell(record.title) : "";
    const projectUrl = typeof record.project_url === "string" && /^https?:\/\//i.test(record.project_url) ? record.project_url : "";
    if (!title || !projectUrl) return [];
    const platform = typeof record.platform === "string" ? cleanCell(record.platform) : "BTech Games";
    const version = typeof record.version === "string" ? cleanCell(record.version) : "n/a";
    const date = typeof record.source_date === "string" ? record.source_date : "n/a";
    return [{
      id: slug(`btech-${String(record.id ?? title)}-${title}-${projectUrl}`),
      name: title,
      system: typeof record.system === "string" && record.system ? cleanCell(record.system) : platform,
      category: `BTech · ${classifyBtechType(platform)}`,
      version: version || "n/a",
      lastUpdated: date || "n/a",
      firmware: "n/d",
      repoUrl: projectUrl,
      threadUrl: typeof record.thread_url === "string" ? record.thread_url : "",
      archived: false,
      recent: record.source_marker === "highlight",
      source: "BTech" as const,
      catalogType: classifyBtechType(platform),
      imageUrl: typeof record.cover_url === "string" && record.cover_url ? record.cover_url : undefined,
    } satisfies CatalogItem];
  });
}

export function parseBtechProjectRecords(records: BtechRecord[]) {
  return records.flatMap((record) => {
    const title = typeof record.title === "string" ? cleanCell(record.title) : "";
    const projectUrl = typeof record.project_url === "string" && /^https?:\/\//i.test(record.project_url) ? record.project_url : "";
    if (!title || !projectUrl) return [];
    const platform = typeof record.platform === "string" ? cleanCell(record.platform) : "BTech Games";
    const kind = typeof record.kind === "string" ? record.kind : "";
    const type = classifyBtechProjectType(kind, platform);
    return [{
      id: slug(`btech-project-${String(record.id ?? title)}-${title}-${projectUrl}`),
      name: title,
      system: platform,
      category: `BTech Projetos · ${type}`,
      version: typeof record.version === "string" ? cleanCell(record.version) || "n/a" : "n/a",
      lastUpdated: typeof record.source_date === "string" ? record.source_date : "n/a",
      firmware: "n/d",
      repoUrl: projectUrl,
      threadUrl: typeof record.thread_url === "string" ? record.thread_url : "",
      archived: Boolean(record.archived),
      recent: record.last_change === "novo" || record.source_marker === "highlight",
      source: "BTechProjects" as const,
      catalogType: type,
      imageUrl: typeof record.cover_url === "string" && record.cover_url ? record.cover_url : undefined,
    } satisfies CatalogItem];
  });
}

export function parsePortMarkdown(markdown: string, archived: boolean): CatalogItem[] {
  const text = markdown.replace(/<!--[\s\S]*?-->/g, "");
  const lines = text.split(/\r?\n/);
  const items: CatalogItem[] = [];
  let category = "Outros";
  let headers: string[] | null = null;
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

export async function fetchCatalog(): Promise<CatalogItem[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const responses = await Promise.all(
      [README_URL, DEAD_URL].map((url) => fetch(url, { signal: controller.signal })),
    );
    if (responses.some((response) => !response.ok)) {
      throw new Error("A fonte não respondeu corretamente.");
    }
    const [readme, dead] = await Promise.all(responses.map((response) => response.text()));
    const primaryItems = [...parsePortMarkdown(readme, false), ...parsePortMarkdown(dead, true)];
    let complementaryItems: CatalogItem[] = [];
    try {
      const manifestResponse = await fetch(PRESERVIA_MANIFEST_URL, { signal: controller.signal });
      if (manifestResponse.ok) {
        const manifest = await manifestResponse.json();
        const keys = Array.isArray(manifest) ? manifest.map(String) : Object.values((manifest ?? {}) as Record<string, unknown>).map(String);
        const recordResponses = await Promise.all(keys.map((key) => fetch(`${PRESERVIA_RAW_BASE_URL}ports/${key}.json`, { signal: controller.signal })));
        const records = await Promise.all(recordResponses.map(async (response, index) => ({ key: keys[index], record: response.ok ? await response.json() as PreserviaRecord : {} })));
        complementaryItems = parsePreserviaRecords(manifest, records);
      }
    } catch {
      complementaryItems = [];
    }
    let btechItems: CatalogItem[] = [];
    try {
      const firstResponse = await fetch(`${BTECH_CATALOG_URL}?page=1`, { signal: controller.signal });
      if (firstResponse.ok) {
        const firstPage = await firstResponse.json() as { items?: BtechRecord[]; pagination?: { pages?: number } };
        const pages = Math.min(Math.max(Number(firstPage.pagination?.pages ?? 1), 1), 30);
        const pageRecords = [...(firstPage.items ?? [])];
        if (pages > 1) {
          const pageResponses = await Promise.all(Array.from({ length: pages - 1 }, (_, index) => fetch(`${BTECH_CATALOG_URL}?page=${index + 2}`, { signal: controller.signal })));
          for (const response of pageResponses) if (response.ok) pageRecords.push(...((await response.json()) as { items?: BtechRecord[] }).items ?? []);
        }
        btechItems = parseBtechRecords(pageRecords);
      }
    } catch {
      btechItems = [];
    }
    let btechProjectItems: CatalogItem[] = [];
    try {
      const projectsResponse = await fetch(BTECH_PROJECTS_URL, { signal: controller.signal });
      if (projectsResponse.ok) {
        const projectsPayload = await projectsResponse.json() as { items?: BtechRecord[] };
        btechProjectItems = parseBtechProjectRecords(projectsPayload.items ?? []);
      }
    } catch {
      btechProjectItems = [];
    }
    const seenProjects = new Set<string>();
    const unique = [...primaryItems, ...complementaryItems, ...btechItems, ...btechProjectItems].filter((item) => {
      const projectKey = item.repoUrl.trim().toLocaleLowerCase("pt-BR").replace(/\/?(?:releases|\.git)\/?$/, "");
      const fallbackKey = item.name.trim().toLocaleLowerCase("pt-BR");
      const key = `${item.source ?? "SwitchPorts"}:${projectKey || fallbackKey}`;
      if (seenProjects.has(key)) return false;
      seenProjects.add(key);
      return true;
    });
    if (unique.length < 10) throw new Error("A fonte retornou poucos itens para uma sincronização segura.");
    return unique.sort((a, b) => Number(a.archived) - Number(b.archived) || a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
  } finally {
    clearTimeout(timeout);
  }
}

export async function loadCachedCatalog(): Promise<CachedCatalog | null> {
  try {
    const raw = await AsyncStorage.getItem(CATALOG_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedCatalog;
    if (!Array.isArray(parsed.items) || !parsed.syncedAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function saveCachedCatalog(items: CatalogItem[], syncedAt: string) {
  await AsyncStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify({ items, syncedAt } satisfies CachedCatalog));
}

export async function loadPreferences(): Promise<{ favorites: string[]; showArchived: boolean; sortMode: CatalogSort; firmwareOnly: boolean; favoriteNotifications: boolean; externalCovers: boolean }> {
  try {
    const raw = await AsyncStorage.getItem(PREFERENCES_KEY);
    if (!raw) return { favorites: [], showArchived: true, sortMode: "recent", firmwareOnly: false, favoriteNotifications: false, externalCovers: false };
    const parsed = JSON.parse(raw) as { favorites?: unknown; showArchived?: unknown; sortMode?: unknown; firmwareOnly?: unknown; favoriteNotifications?: unknown; externalCovers?: unknown };
    return {
      favorites: Array.isArray(parsed.favorites) ? parsed.favorites.filter((value): value is string => typeof value === "string") : [],
      showArchived: parsed.showArchived !== false,
      sortMode: parsed.sortMode === "oldest" || parsed.sortMode === "name" || parsed.sortMode === "popularity" ? parsed.sortMode : "recent",
      firmwareOnly: parsed.firmwareOnly === true,
      favoriteNotifications: parsed.favoriteNotifications === true,
      externalCovers: parsed.externalCovers === true,
    };
  } catch {
    return { favorites: [], showArchived: true, sortMode: "recent", firmwareOnly: false, favoriteNotifications: false, externalCovers: false };
  }
}

export async function savePreferences(favorites: string[], showArchived: boolean, sortMode: CatalogSort, firmwareOnly: boolean, favoriteNotifications: boolean, externalCovers: boolean) {
  await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify({ favorites, showArchived, sortMode, firmwareOnly, favoriteNotifications, externalCovers }));
}

function getGithubRepoPath(repoUrl: string) {
  const match = repoUrl.match(/^https?:\/\/(?:www\.)?github\.com\/([^/#?]+)\/([^/#?]+)/i);
  return match ? `${match[1]}/${match[2].replace(/\.git$/, "")}` : null;
}

export async function refreshGithubPopularity(items: CatalogItem[], favorites: string[] = []) {
  let cache: Record<string, GithubPopularity> = {};
  try {
    const raw = await AsyncStorage.getItem(GITHUB_POPULARITY_CACHE_KEY);
    if (raw) cache = JSON.parse(raw) as Record<string, GithubPopularity>;
  } catch {
    cache = {};
  }
  const byPath = new Map<string, CatalogItem>();
  for (const item of items) {
    const path = getGithubRepoPath(item.repoUrl);
    if (path) byPath.set(path, item);
  }
  const now = Date.now();
  const stale = Array.from(byPath.entries())
    .filter(([path]) => !cache[path] || now - new Date(cache[path].fetchedAt).getTime() > 24 * 60 * 60 * 1000)
    .sort(([pathA, itemA], [pathB, itemB]) => Number(favorites.includes(itemB.id)) - Number(favorites.includes(itemA.id)) || pathA.localeCompare(pathB));
  let requests = 0;
  for (const [path] of stale) {
    if (requests >= 45) break;
    try {
      const response = await fetch(`https://api.github.com/repos/${path}`, { headers: { Accept: "application/vnd.github+json" } });
      requests += 1;
      if (response.status === 403 || response.status === 429) break;
      if (!response.ok) continue;
      const data = await response.json() as { stargazers_count?: number; forks_count?: number; subscribers_count?: number; open_issues_count?: number };
      cache[path] = { stars: data.stargazers_count ?? 0, forks: data.forks_count ?? 0, watchers: data.subscribers_count ?? 0, openIssues: data.open_issues_count ?? 0, fetchedAt: new Date().toISOString() };
    } catch {
      requests += 1;
    }
  }
  await AsyncStorage.setItem(GITHUB_POPULARITY_CACHE_KEY, JSON.stringify(cache));
  return items.map((item) => {
    const path = getGithubRepoPath(item.repoUrl);
    return path && cache[path] ? { ...item, githubPopularity: cache[path] } : item;
  });
}

const EXTERNAL_COVERS_CACHE_KEY = "switchports.external.covers.v1";

export async function refreshExternalCovers(items: CatalogItem[]) {
  let cache: Record<string, { url: string; fetchedAt: string }> = {};
  try {
    const raw = await AsyncStorage.getItem(EXTERNAL_COVERS_CACHE_KEY);
    if (raw) cache = JSON.parse(raw) as Record<string, { url: string; fetchedAt: string }>;
  } catch {
    cache = {};
  }
  const candidates = items.filter((item) => item.source !== "BTechProjects" && !/pack|utilitário|util/i.test(`${item.category} ${item.system}`));
  const now = Date.now();
  let requests = 0;
  for (const item of candidates) {
    const key = item.name.trim().toLocaleLowerCase("pt-BR");
    if (cache[key] && now - new Date(cache[key].fetchedAt).getTime() < 30 * 24 * 60 * 60 * 1000) continue;
    if (requests >= 25) break;
    try {
      const params = new URLSearchParams({ action: "query", generator: "search", gsrsearch: `${item.name} video game`, gsrlimit: "1", prop: "pageimages", pithumbsize: "320", format: "json", origin: "*" });
      const response = await fetch(`https://en.wikipedia.org/w/api.php?${params.toString()}`);
      requests += 1;
      if (!response.ok) continue;
      const payload = await response.json() as { query?: { pages?: Record<string, { thumbnail?: { source?: string } }> } };
      const thumbnail = Object.values(payload.query?.pages ?? {})[0]?.thumbnail?.source;
      cache[key] = { url: thumbnail ?? "", fetchedAt: new Date().toISOString() };
    } catch {
      requests += 1;
    }
  }
  await AsyncStorage.setItem(EXTERNAL_COVERS_CACHE_KEY, JSON.stringify(cache));
  return items.map((item) => {
    const cover = cache[item.name.trim().toLocaleLowerCase("pt-BR")];
    return cover?.url ? { ...item, externalImageUrl: cover.url } : item;
  });
}

export async function loadChangeHistory(): Promise<CatalogChange[]> {
  try {
    const raw = await AsyncStorage.getItem("switchports.catalog.history.v1");
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((entry): entry is CatalogChange => Boolean(entry && typeof entry === "object" && "id" in entry && "name" in entry && "type" in entry && "detectedAt" in entry)).slice(0, 80) : [];
  } catch {
    return [];
  }
}

export async function saveChangeHistory(history: CatalogChange[]) {
  await AsyncStorage.setItem("switchports.catalog.history.v1", JSON.stringify(history.slice(0, 80)));
}

export function getCatalogChanges(previous: CatalogItem[], next: CatalogItem[], detectedAt = new Date().toISOString()) {
  const before = new Map(previous.map((item) => [item.id, item]));
  const after = new Map(next.map((item) => [item.id, item]));
  const changes: CatalogChange[] = [];
  for (const item of next) {
    const old = before.get(item.id);
    if (!old) changes.push({ id: item.id, name: item.name, type: "added", source: item.source ?? "SwitchPorts", detectedAt });
    else if (["version", "lastUpdated", "firmware", "repoUrl", "threadUrl"].some((key) => old[key as keyof CatalogItem] !== item[key as keyof CatalogItem])) changes.push({ id: item.id, name: item.name, type: "updated", source: item.source ?? "SwitchPorts", detectedAt });
  }
  for (const item of previous) if (!after.has(item.id)) changes.push({ id: item.id, name: item.name, type: "removed", source: item.source ?? "SwitchPorts", detectedAt });
  return changes;
}

export function formatSyncDate(value: string | null) {
  if (!value) return "Ainda não sincronizado";
  return new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export function formatPortDate(value: string) {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return value;
  return `${match[1]}/${match[2]}/${match[3]}`;
}

export function getFirmwareStatus(value: string): FirmwareStatus {
  const normalized = value.trim().toLowerCase();
  if (/^(yes|sim|21\+|21\.\d|22\.|23\.)/.test(normalized)) return "fw21";
  if (/^(no|não|20\.|19\.|18\.)/.test(normalized)) return "older";
  return "unknown";
}

export function getFirmwareLabel(value: string) {
  const status = getFirmwareStatus(value);
  return status === "fw21" ? "FW 21+" : status === "older" ? "FW ≤20" : "FW n/d";
}

export function getRepositoryPreviewUrl(repoUrl: string) {
  const match = repoUrl.match(/^https?:\/\/(?:www\.)?github\.com\/([^/#?]+)\/([^/#?]+)/i);
  if (!match) return null;
  const repository = match[2].replace(/\.git$/, "");
  return `https://opengraph.githubassets.com/1/${match[1]}/${repository}`;
}

function catalogDateValue(value: string) {
  const brazilian = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (brazilian) return Date.UTC(Number(brazilian[3]), Number(brazilian[2]) - 1, Number(brazilian[1]));
  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return Date.UTC(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  return 0;
}

export function sortCatalogItems(items: CatalogItem[], sort: CatalogSort = "recent") {
  return [...items].sort((a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name, "pt-BR") || a.category.localeCompare(b.category, "pt-BR");
    if (sort === "popularity") return (b.githubPopularity?.stars ?? -1) - (a.githubPopularity?.stars ?? -1) || a.name.localeCompare(b.name, "pt-BR");
    const aDate = catalogDateValue(a.lastUpdated);
    const bDate = catalogDateValue(b.lastUpdated);
    if (aDate === 0 && bDate !== 0) return 1;
    if (bDate === 0 && aDate !== 0) return -1;
    const dateDifference = bDate - aDate;
    if (dateDifference !== 0) return sort === "recent" ? dateDifference : -dateDifference;
    return a.name.localeCompare(b.name, "pt-BR");
  });
}

export function getCatalogSeed() {
  return CATALOG_SEED;
}
