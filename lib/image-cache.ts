import { Directory, File, Paths } from "expo-file-system";

import type { CatalogItem } from "@/lib/catalog";

// Use document storage instead of the OS cache: downloaded artwork must remain
// available after Android reclaims temporary files or the app is used offline.
const cacheDirectory = new Directory(Paths.document, "switchports-thumbnails");

function cacheName(url: string) {
  return `${encodeURIComponent(url).replace(/%/g, "_").slice(0, 180)}.img`;
}

export async function cacheImage(url: string) {
  try {
    if (!cacheDirectory.exists) cacheDirectory.create({ idempotent: true, intermediates: true });
    const file = new File(cacheDirectory, cacheName(url));
    if (!file.exists) await File.downloadFileAsync(url, file);
    return file.uri;
  } catch {
    return url;
  }
}

export type ImageDownloadProgress = {
  current: number;
  total: number;
  downloaded: number;
  failed: number;
  currentName: string;
};

export async function downloadCatalogImages(
  items: CatalogItem[],
  resolveUrl: (item: CatalogItem) => string | null,
  onProgress: (progress: ImageDownloadProgress) => void,
) {
  const unique = new Map<string, CatalogItem>();
  for (const item of items) {
    const url = resolveUrl(item);
    if (url && !unique.has(url)) unique.set(url, item);
  }

  const entries = Array.from(unique.entries());
  let downloaded = 0;
  let failed = 0;
  onProgress({ current: 0, total: items.length, downloaded, failed, currentName: "Preparando imagens…" });

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    const url = resolveUrl(item);
    if (!url) {
      failed += 1;
      onProgress({ current: index + 1, total: items.length, downloaded, failed, currentName: item.name });
      continue;
    }
    try {
      const localUri = await cacheImage(url);
      if (localUri === url) failed += 1;
      else downloaded += 1;
    } catch {
      failed += 1;
    }
    onProgress({ current: index + 1, total: items.length, downloaded, failed, currentName: item.name });
  }

  return { total: items.length, downloaded, failed };
}
