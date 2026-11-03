import { Directory, File, Paths } from "expo-file-system";

const cacheDirectory = new Directory(Paths.cache, "switchports-thumbnails");

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
