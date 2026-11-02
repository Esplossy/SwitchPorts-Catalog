import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const FAVORITES_CHANNEL_ID = "favorite-updates";

async function configureChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(FAVORITES_CHANNEL_ID, {
    name: "Atualizações dos favoritos",
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 200, 100, 200],
    sound: "default",
  });
}

export async function requestFavoriteNotificationPermission() {
  if (Platform.OS === "web") return false;
  await configureChannel();
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function notifyFavoriteChanges(names: string[]) {
  if (Platform.OS === "web" || names.length === 0) return;
  const permission = await Notifications.getPermissionsAsync();
  if (!permission.granted) return;
  await configureChannel();
  const visibleNames = names.slice(0, 3);
  const suffix = names.length > visibleNames.length ? ` e mais ${names.length - visibleNames.length}` : "";
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Favoritos atualizados",
      body: `${visibleNames.join(", ")}${suffix} recebeu${names.length === 1 ? "" : "ram"} uma nova atualização.`,
      data: { type: "favorite-update" },
      sound: "default",
    },
    trigger: null,
  });
}
