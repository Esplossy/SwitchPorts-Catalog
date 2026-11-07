import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import {
  fetchCatalog,
  formatSyncDate,
  getRepositoryPreviewUrl,
  getCatalogChanges,
  getCatalogSeed,
  loadCachedCatalog,
  loadChangeHistory,
  loadPreferences,
  saveCachedCatalog,
  saveChangeHistory,
  savePreferences,
  refreshGithubPopularity,
  type CatalogChange,
  type CatalogItem,
  type CatalogSort,
  type SyncState,
} from "@/lib/catalog";
import { downloadCatalogImages, type ImageDownloadProgress } from "@/lib/image-cache";
import { notifyFavoriteChanges } from "@/lib/notifications";

type CatalogContextValue = {
  items: CatalogItem[];
  favorites: string[];
  showArchived: boolean;
  sortMode: CatalogSort;
  firmwareOnly: boolean;
  favoriteNotifications: boolean;
  changeHistory: CatalogChange[];
  syncState: SyncState;
  errorMessage: string | null;
  lastSyncedAt: string | null;
  lastSyncedLabel: string;
  sourceSummary: SourceSummary[];
  syncNow: () => Promise<CatalogItem[]>;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  setShowArchived: (value: boolean) => void;
  setSortMode: (value: CatalogSort) => void;
  setFirmwareOnly: (value: boolean) => void;
  setFavoriteNotifications: (value: boolean) => Promise<void>;
  imageDownload: (ImageDownloadProgress & { active: boolean; completed: boolean }) | null;
  downloadAllImages: () => Promise<void>;
  dismissImageDownload: () => void;
};

export type SourceSummary = { source: string; label: string; count: number };

function summarizeSources(items: CatalogItem[]): SourceSummary[] {
  const definitions = [
    ["SwitchPorts", "SwitchPorts"],
    ["Preservia", "Preservia"],
    ["BTech", "BTech Games"],
    ["BTechProjects", "BTech Projetos"],
  ] as const;
  return definitions.map(([source, label]) => ({ source, label, count: items.filter((item) => item.source === source).length }));
}

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CatalogItem[]>(getCatalogSeed());
  const [sourceSummary, setSourceSummary] = useState<SourceSummary[]>(() => summarizeSources(getCatalogSeed()));
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showArchived, setShowArchived] = useState(true);
  const [sortMode, setSortMode] = useState<CatalogSort>("recent");
  const [firmwareOnly, setFirmwareOnly] = useState(false);
  const [favoriteNotifications, setFavoriteNotificationsState] = useState(false);
  const [imageDownload, setImageDownload] = useState<(ImageDownloadProgress & { active: boolean; completed: boolean }) | null>(null);
  const [changeHistory, setChangeHistory] = useState<CatalogChange[]>([]);
  const [syncState, setSyncState] = useState<SyncState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [preferencesReady, setPreferencesReady] = useState(false);
  const itemsRef = useRef(items);
  const favoritesRef = useRef(favorites);
  const lastSyncedAtRef = useRef(lastSyncedAt);
  const favoriteNotificationsRef = useRef(favoriteNotifications);
  const changeHistoryRef = useRef(changeHistory);
  itemsRef.current = items;
  favoritesRef.current = favorites;
  lastSyncedAtRef.current = lastSyncedAt;
  favoriteNotificationsRef.current = favoriteNotifications;
  changeHistoryRef.current = changeHistory;

  const syncNow = useCallback(async () => {
    setSyncState("syncing");
    setErrorMessage(null);
    try {
      const freshItems = await refreshGithubPopularity(await fetchCatalog(), favoritesRef.current);
      const syncedAt = new Date().toISOString();
      const changes = getCatalogChanges(itemsRef.current, freshItems, syncedAt);
      if (changes.length > 0) {
        const mergedHistory = [...changes, ...changeHistoryRef.current].slice(0, 80);
        setChangeHistory(mergedHistory);
        await saveChangeHistory(mergedHistory);
      }
      if (lastSyncedAtRef.current && favoriteNotificationsRef.current) {
        const previousById = new Map(itemsRef.current.map((item) => [item.id, item]));
        const changedFavoriteNames = freshItems
          .filter((item) => favoritesRef.current.includes(item.id))
          .filter((item) => {
            const previous = previousById.get(item.id);
            return previous && ["version", "lastUpdated", "firmware", "repoUrl", "threadUrl"].some((key) => previous[key as keyof CatalogItem] !== item[key as keyof CatalogItem]);
          })
          .map((item) => item.name);
        await notifyFavoriteChanges(changedFavoriteNames);
      }
      setItems(freshItems);
      setSourceSummary(summarizeSources(freshItems));
      setLastSyncedAt(syncedAt);
      setSyncState("ready");
      await saveCachedCatalog(freshItems, syncedAt);
      return freshItems;
    } catch (error) {
      setSyncState("offline");
      setErrorMessage(error instanceof Error ? error.message : "Não foi possível sincronizar agora.");
      return itemsRef.current;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      const [cached, preferences, history] = await Promise.all([loadCachedCatalog(), loadPreferences(), loadChangeHistory()]);
      if (cancelled) return;
      if (cached) {
        setItems(cached.items);
        setSourceSummary(summarizeSources(cached.items));
        setLastSyncedAt(cached.syncedAt);
      }
      setFavorites(preferences.favorites);
      setShowArchived(preferences.showArchived);
      setSortMode(preferences.sortMode);
      setFirmwareOnly(preferences.firmwareOnly);
      setFavoriteNotificationsState(preferences.favoriteNotifications);
      setChangeHistory(history);
      setPreferencesReady(true);
      const { registerBackgroundSync } = await import("@/lib/background-sync");
      await registerBackgroundSync();
      if (!cancelled) await syncNow();
    }
    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [syncNow]);

  useEffect(() => {
    if (preferencesReady) void savePreferences(favorites, showArchived, sortMode, firmwareOnly, favoriteNotifications);
  }, [favoriteNotifications, favorites, firmwareOnly, preferencesReady, showArchived, sortMode]);

  const setFavoriteNotifications = useCallback(async (value: boolean) => {
    if (!value) {
      setFavoriteNotificationsState(false);
      return;
    }
    const { requestFavoriteNotificationPermission } = await import("@/lib/notifications");
    const granted = await requestFavoriteNotificationPermission();
    setFavoriteNotificationsState(granted);
  }, []);

  const downloadAllImages = useCallback(async () => {
    if (imageDownload?.active || itemsRef.current.length === 0) return;
    setImageDownload({ current: 0, total: itemsRef.current.length, downloaded: 0, failed: 0, currentName: "Atualizando lista…", active: true, completed: false });
    try {
      const freshItems = await syncNow();
      setImageDownload({ current: 0, total: freshItems.length, downloaded: 0, failed: 0, currentName: "Preparando imagens…", active: true, completed: false });
      const result = await downloadCatalogImages(
        freshItems,
        (item) => item.imageUrl ?? getRepositoryPreviewUrl(item.repoUrl),
        (progress) => setImageDownload({ ...progress, active: true, completed: false }),
      );
      setImageDownload({ current: result.total, total: result.total, downloaded: result.downloaded, failed: result.failed, currentName: "Concluído", active: false, completed: true });
    } catch {
      setImageDownload((current) => current ? { ...current, active: false, completed: true, currentName: "Concluído com alguns erros" } : current);
    }
  }, [imageDownload?.active, syncNow]);

  const dismissImageDownload = useCallback(() => {
    setImageDownload((current) => current?.active ? current : null);
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((current) => (current.includes(id) ? current.filter((favorite) => favorite !== id) : [...current, id]));
  }, []);

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

  const value = useMemo<CatalogContextValue>(
    () => ({
      items,
      favorites,
      showArchived,
      sortMode,
      firmwareOnly,
      favoriteNotifications,
      changeHistory,
      syncState,
      errorMessage,
      lastSyncedAt,
      lastSyncedLabel: formatSyncDate(lastSyncedAt),
      sourceSummary,
      syncNow,
      toggleFavorite,
      isFavorite,
      setShowArchived,
      setSortMode,
      setFirmwareOnly,
      setFavoriteNotifications,
      imageDownload,
      downloadAllImages,
      dismissImageDownload,
    }),
    [changeHistory, dismissImageDownload, downloadAllImages, errorMessage, favoriteNotifications, favorites, firmwareOnly, imageDownload, isFavorite, items, lastSyncedAt, setFavoriteNotifications, showArchived, sortMode, sourceSummary, syncNow, syncState, toggleFavorite],
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) throw new Error("useCatalog precisa estar dentro de CatalogProvider");
  return context;
}
