import AsyncStorage from "@react-native-async-storage/async-storage";

import { CATALOG_SEED } from "@/data/catalog-seed";

export const REPOSITORY_URL = "https://github.com/robzilla10001/SwitchPorts";
export const README_URL = "https://raw.githubusercontent.com/robzilla10001/SwitchPorts/main/README.md";
export const DEAD_URL = "https://raw.githubusercontent.com/robzilla10001/SwitchPorts/main/DEAD.md";
export const PRESERVIA_MANIFEST_URL = "https://raw.githubusercontent.com/preservia/ports/main/ports.json";
export const PRESERVIA_RAW_BASE_URL = "https://raw.githubusercontent.com/preservia/ports/main/";
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
  imageUrl?: string;
};

export type SyncState = "loading" | "ready" | "syncing" | "offline" | "error";

export type CatalogSort = "recent" | "oldest" | "name";

export type CachedCatalog = {
  items: CatalogItem[];
  syncedAt: string;
};

const CATALOG_CACHE_KEY = "switchports.catalog.cache.v1";
const PREFERENCES_KEY = "switchports.preferences.v2";

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
    imageUrl: icon ? `https://preservia.github.io/ports/${icon}` : undefined,
  };
}

export function parsePreserviaRecords(manifest: unknown, records: Array<{ key: string; record: PreserviaRecord }>) {
  const keys = Array.isArray(manifest) ? manifest.map(String) : Object.values((manifest ?? {}) as Record<string, unknown>).map(String);
  const byKey = new Map(records.map((entry) => [entry.key, entry.record]));
  return keys.map((key) => parsePreserviaRecord(byKey.get(key) ?? {}, key)).filter((item): item is CatalogItem => Boolean(item));
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
    });
  }

  return items;
}

export async function fetchCatalog(): Promise<CatalogItem[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
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
    const seenNames = new Set<string>();
    const unique = [...primaryItems, ...complementaryItems].filter((item) => {
      const key = item.name.trim().toLocaleLowerCase("pt-BR");
      if (seenNames.has(key)) return false;
      seenNames.add(key);
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

export async function loadPreferences(): Promise<{ favorites: string[]; showArchived: boolean; sortMode: CatalogSort; firmwareOnly: boolean; favoriteNotifications: boolean }> {
  try {
    const raw = await AsyncStorage.getItem(PREFERENCES_KEY);
    if (!raw) return { favorites: [], showArchived: true, sortMode: "recent", firmwareOnly: false, favoriteNotifications: false };
    const parsed = JSON.parse(raw) as { favorites?: unknown; showArchived?: unknown; sortMode?: unknown; firmwareOnly?: unknown; favoriteNotifications?: unknown };
    return {
      favorites: Array.isArray(parsed.favorites) ? parsed.favorites.filter((value): value is string => typeof value === "string") : [],
      showArchived: parsed.showArchived !== false,
      sortMode: parsed.sortMode === "oldest" || parsed.sortMode === "name" ? parsed.sortMode : "recent",
      firmwareOnly: parsed.firmwareOnly === true,
      favoriteNotifications: parsed.favoriteNotifications === true,
    };
  } catch {
    return { favorites: [], showArchived: true, sortMode: "recent", firmwareOnly: false, favoriteNotifications: false };
  }
}

export async function savePreferences(favorites: string[], showArchived: boolean, sortMode: CatalogSort, firmwareOnly: boolean, favoriteNotifications: boolean) {
  await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify({ favorites, showArchived, sortMode, firmwareOnly, favoriteNotifications }));
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
