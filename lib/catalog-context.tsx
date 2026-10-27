import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import {
  fetchCatalog,
  formatSyncDate,
  getCatalogSeed,
  loadCachedCatalog,
  loadPreferences,
  saveCachedCatalog,
  savePreferences,
  type CatalogItem,
  type SyncState,
} from "@/lib/catalog";

type CatalogContextValue = {
  items: CatalogItem[];
  favorites: string[];
  showArchived: boolean;
  syncState: SyncState;
  errorMessage: string | null;
  lastSyncedAt: string | null;
  lastSyncedLabel: string;
  syncNow: () => Promise<void>;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  setShowArchived: (value: boolean) => void;
};

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CatalogItem[]>(getCatalogSeed());
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showArchived, setShowArchived] = useState(true);
  const [syncState, setSyncState] = useState<SyncState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [preferencesReady, setPreferencesReady] = useState(false);

  const syncNow = useCallback(async () => {
    setSyncState("syncing");
    setErrorMessage(null);
    try {
      const freshItems = await fetchCatalog();
      const syncedAt = new Date().toISOString();
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
      const [cached, preferences] = await Promise.all([loadCachedCatalog(), loadPreferences()]);
      if (cancelled) return;
      if (cached) {
        setItems(cached.items);
        setLastSyncedAt(cached.syncedAt);
      }
      setFavorites(preferences.favorites);
      setShowArchived(preferences.showArchived);
      setPreferencesReady(true);
      if (!cancelled) await syncNow();
    }
    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [syncNow]);

  useEffect(() => {
    if (preferencesReady) void savePreferences(favorites, showArchived);
  }, [favorites, preferencesReady, showArchived]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((current) => (current.includes(id) ? current.filter((favorite) => favorite !== id) : [...current, id]));
  }, []);

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

  const value = useMemo<CatalogContextValue>(
    () => ({
      items,
      favorites,
      showArchived,
      syncState,
      errorMessage,
      lastSyncedAt,
      lastSyncedLabel: formatSyncDate(lastSyncedAt),
      syncNow,
      toggleFavorite,
      isFavorite,
      setShowArchived,
    }),
    [errorMessage, favorites, isFavorite, items, lastSyncedAt, showArchived, syncNow, syncState, toggleFavorite],
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) throw new Error("useCatalog precisa estar dentro de CatalogProvider");
  return context;
}
