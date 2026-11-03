import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";
import { Platform } from "react-native";

import { fetchCatalog, getCatalogChanges, loadCachedCatalog, loadPreferences, saveCachedCatalog, saveChangeHistory } from "@/lib/catalog";
import { notifyFavoriteChanges } from "@/lib/notifications";

export const BACKGROUND_SYNC_TASK = "switchports-catalog-background-sync";

TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
  try {
    const [cached, preferences] = await Promise.all([loadCachedCatalog(), loadPreferences()]);
    const fresh = await fetchCatalog();
    const syncedAt = new Date().toISOString();
    const changes = getCatalogChanges(cached?.items ?? [], fresh, syncedAt);
    if (changes.length > 0) {
      const previousHistory = await import("@/lib/catalog").then(({ loadChangeHistory }) => loadChangeHistory());
      await saveChangeHistory([...changes, ...previousHistory]);
    }
    await saveCachedCatalog(fresh, syncedAt);
    if (preferences.favoriteNotifications && preferences.favorites.length > 0) {
      const favoriteIds = new Set(preferences.favorites);
      await notifyFavoriteChanges(changes.filter((change) => favoriteIds.has(change.id) && change.type !== "removed").map((change) => change.name));
    }
    return BackgroundTask.BackgroundTaskResult.Success;
  } catch {
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

export async function registerBackgroundSync() {
  if (Platform.OS === "web") return false;
  try {
    const status = await BackgroundTask.getStatusAsync();
    if (status !== BackgroundTask.BackgroundTaskStatus.Available) return false;
    if (!(await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK))) {
      await BackgroundTask.registerTaskAsync(BACKGROUND_SYNC_TASK, { minimumInterval: 6 * 60 });
    }
    return true;
  } catch {
    return false;
  }
}
