import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/use-colors";
import { formatPortDate, type CatalogItem } from "@/lib/catalog";
import { StatusPill } from "@/components/status-pill";

export function CatalogCard({ item, favorite, onPress, onToggleFavorite }: { item: CatalogItem; favorite: boolean; onPress: () => void; onToggleFavorite: () => void }) {
  const colors = useColors();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}>
      <View style={[styles.marker, { backgroundColor: item.archived ? colors.warning : item.recent ? colors.success : colors.primary }]} />
      <View style={styles.content}>
        <View style={styles.topLine}>
          <View style={styles.titleWrap}>
            <Text numberOfLines={1} style={[styles.title, { color: colors.foreground }]}>{item.name}</Text>
            <Text numberOfLines={1} style={[styles.system, { color: colors.muted }]}>{item.system === item.category ? item.system : `${item.system} · ${item.category}`}</Text>
          </View>
          <Pressable accessibilityLabel={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"} hitSlop={10} onPress={onToggleFavorite} style={styles.favoriteButton}>
            <MaterialIcons name={favorite ? "star" : "star-border"} size={23} color={favorite ? colors.warning : colors.muted} />
          </Pressable>
        </View>
        <View style={styles.bottomLine}>
          <View style={styles.metaGroup}>
            <Text style={[styles.version, { color: colors.foreground }]}>{item.version}</Text>
            <Text style={[styles.date, { color: colors.muted }]}>{formatPortDate(item.lastUpdated)}</Text>
          </View>
          <View style={styles.badges}>
            {item.recent && <StatusPill label="NOVO" tone="success" />}
            {item.archived && <StatusPill label="ARQUIVADO" tone="warning" />}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: "row", minHeight: 104, borderWidth: 1, borderRadius: 18, overflow: "hidden", marginBottom: 10 },
  marker: { width: 4 },
  content: { flex: 1, paddingHorizontal: 15, paddingVertical: 14, gap: 14 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.995 }] },
  topLine: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  titleWrap: { flex: 1, gap: 5 },
  title: { fontSize: 16, fontWeight: "800", letterSpacing: -0.2 },
  system: { fontSize: 12 },
  favoriteButton: { padding: 1 },
  bottomLine: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  metaGroup: { flexDirection: "row", alignItems: "center", gap: 10 },
  version: { fontFamily: "monospace", fontSize: 12, fontWeight: "700" },
  date: { fontSize: 11 },
  badges: { flexDirection: "row", gap: 5 },
});
