import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import {
  fetchCatalog,
  formatSyncDate,
  getCatalogChanges,
  getCatalogSeed,
  loadCachedCatalog,
  loadChangeHistory,
  loadPreferences,
  saveCachedCatalog,
  saveChangeHistory,
  savePreferences,
  type CatalogChange,
  type CatalogItem,
  type CatalogSort,
  type SyncState,
} from "@/lib/catalog";
import { notifyFavoriteChanges } from "@/lib/notifications";
import "@/lib/background-sync";
import { registerBackgroundSync } from "@/lib/background-sync";

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
  syncNow: () => Promise<void>;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  setShowArchived: (value: boolean) => void;
  setSortMode: (value: CatalogSort) => void;
  setFirmwareOnly: (value: boolean) => void;
  setFavoriteNotifications: (value: boolean) => Promise<void>;
};

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CatalogItem[]>(getCatalogSeed());
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showArchived, setShowArchived] = useState(true);
  const [sortMode, setSortMode] = useState<CatalogSort>("recent");
  const [firmwareOnly, setFirmwareOnly] = useState(false);
  const [favoriteNotifications, setFavoriteNotificationsState] = useState(false);
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
      const freshItems = await fetchCatalog();
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
      setLastSyncedAt(syncedAt);
      setSyncState("ready");
      await saveCachedCatalog(freshItems, syncedAt);
    } catch (error) {
      setSyncState("offline");
      setErrorMessage(error instanceof Error ? error.message : "Não foi possível sincronizar agora.");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      const [cached, preferences, history] = await Promise.all([loadCachedCatalog(), loadPreferences(), loadChangeHistory()]);
      if (cancelled) return;
      if (cached) {
        setItems(cached.items);
        setLastSyncedAt(cached.syncedAt);
      }
      setFavorites(preferences.favorites);
      setShowArchived(preferences.showArchived);
      setSortMode(preferences.sortMode);
      setFirmwareOnly(preferences.firmwareOnly);
      setFavoriteNotificationsState(preferences.favoriteNotifications);
      setChangeHistory(history);
      setPreferencesReady(true);
      void registerBackgroundSync();
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
      syncNow,
      toggleFavorite,
      isFavorite,
      setShowArchived,
      setSortMode,
      setFirmwareOnly,
      setFavoriteNotifications,
    }),
    [changeHistory, errorMessage, favoriteNotifications, favorites, firmwareOnly, isFavorite, items, lastSyncedAt, setFavoriteNotifications, showArchived, sortMode, syncNow, syncState, toggleFavorite],
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) throw new Error("useCatalog precisa estar dentro de CatalogProvider");
  return context;
}
