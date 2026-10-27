import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { useColors } from "@/hooks/use-colors";

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 61 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: { paddingTop: 8, paddingBottom: bottomPadding, height: tabBarHeight, backgroundColor: colors.background, borderTopColor: colors.border, borderTopWidth: 0.5 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Catálogo", tabBarIcon: ({ color }) => <MaterialIcons size={25} name="view-list" color={color} /> }} />
      <Tabs.Screen name="favorites" options={{ title: "Favoritos", tabBarIcon: ({ color }) => <MaterialIcons size={25} name="star" color={color} /> }} />
      <Tabs.Screen name="settings" options={{ title: "Ajustes", tabBarIcon: ({ color }) => <MaterialIcons size={25} name="tune" color={color} /> }} />
    </Tabs>
  );
}
