import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { CatalogCard } from "@/components/catalog-card";
import { ScreenContainer } from "@/components/screen-container";
import { useCatalog } from "@/lib/catalog-context";
import { useColors } from "@/hooks/use-colors";
import { getFirmwareStatus, sortCatalogItems, type CatalogItem } from "@/lib/catalog";

type StatusFilter = "all" | "recent" | "active" | "archived";
type SourceFilter = "all" | "SwitchPorts" | "Preservia";

function FilterChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const colors = useColors();
  return (
    <Pressable onPress={onPress} style={[styles.chip, { borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? `${colors.primary}20` : colors.surface }]}>
      <Text style={[styles.chipLabel, { color: selected ? colors.primary : colors.muted }]}>{label}</Text>
    </Pressable>
  );
}

export default function CatalogScreen() {
  const router = useRouter();
  const colors = useColors();
  const { items, showArchived, firmwareOnly, setFirmwareOnly, sortMode, setSortMode, syncState, lastSyncedLabel, toggleFavorite, isFavorite, syncNow } = useCatalog();
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");

  const categories = useMemo(() => {
    const values = new Set(items.filter((item) => showArchived || !item.archived).map((item) => item.category));
    return ["Todos", ...Array.from(values).sort((a, b) => a.localeCompare(b))];
  }, [items, showArchived]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
    const matchingItems = items
      .filter((item) => item.source !== "BTechProjects")
      .filter((item) => showArchived || !item.archived)
      .filter((item) => categoryFilter === "Todos" || item.category === categoryFilter)
      .filter((item) => {
        if (statusFilter === "recent") return item.recent;
        if (statusFilter === "active") return !item.archived;
        if (statusFilter === "archived") return item.archived;
        return true;
      })
      .filter((item) => sourceFilter === "all" || (item.source ?? "SwitchPorts") === sourceFilter)
      .filter((item) => !firmwareOnly || getFirmwareStatus(item.firmware) === "fw21")
      .filter((item) => {
        if (!normalizedQuery) return true;
        return [item.name, item.system, item.category, item.version, item.repoUrl].some((value) => value.toLocaleLowerCase("pt-BR").includes(normalizedQuery));
      });
    return sortCatalogItems(matchingItems, sortMode);
  }, [categoryFilter, firmwareOnly, items, query, showArchived, sortMode, sourceFilter, statusFilter]);

  const renderItem = ({ item }: { item: CatalogItem }) => (
    <CatalogCard
      item={item}
      favorite={isFavorite(item.id)}
      onToggleFavorite={() => toggleFavorite(item.id)}
      onPress={() => router.push({ pathname: "/details/[id]", params: { id: item.id } })}
    />
  );

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={syncState === "syncing"} onRefresh={() => void syncNow()} tintColor={colors.primary} colors={[colors.primary]} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.brandRow}>
              <View style={styles.brandLockup}>
                <View style={[styles.brandMark, { backgroundColor: colors.primary }]}><View style={styles.brandCut} /><View style={styles.brandCut} /></View>
                <Text style={[styles.eyebrow, { color: colors.primary }]}>SWITCHPORTS / ÍNDICE VIVO</Text>
              </View>
              <View style={styles.syncMini}>
                <View style={[styles.syncDot, { backgroundColor: syncState === "offline" ? colors.warning : colors.success }]} />
                <Text numberOfLines={1} style={[styles.syncText, { color: colors.muted }]}>{lastSyncedLabel}</Text>
              </View>
            </View>
            <Text style={[styles.title, { color: colors.foreground }]}>Encontre um port em segundos.</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>Links oficiais, versões e estados organizados em um só lugar.</Text>
            <View style={styles.resultMeta}><Text style={[styles.resultMetaText, { color: colors.muted }]}>{filteredItems.length} {filteredItems.length === 1 ? "resultado" : "resultados"}</Text><Text style={[styles.resultMetaText, { color: colors.muted }]}>· {items.length} no catálogo</Text></View>
            <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <MaterialIcons name="search" size={22} color={colors.muted} />
              <TextInput value={query} onChangeText={setQuery} placeholder="Buscar título, sistema ou repositório" placeholderTextColor={colors.muted} style={[styles.searchInput, { color: colors.foreground }]} returnKeyType="search" />
              {query.length > 0 && <Pressable onPress={() => setQuery("")} hitSlop={8}><MaterialIcons name="close" size={19} color={colors.muted} /></Pressable>}
            </View>
            <Text style={[styles.sectionLabel, { color: colors.muted }]}>STATUS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              <FilterChip label="Todos" selected={statusFilter === "all"} onPress={() => setStatusFilter("all")} />
              <FilterChip label="Atualizados" selected={statusFilter === "recent"} onPress={() => setStatusFilter("recent")} />
              <FilterChip label="Ativos" selected={statusFilter === "active"} onPress={() => setStatusFilter("active")} />
              {showArchived && <FilterChip label="Arquivados" selected={statusFilter === "archived"} onPress={() => setStatusFilter("archived")} />}
              <FilterChip label="FW 21+" selected={firmwareOnly} onPress={() => setFirmwareOnly(!firmwareOnly)} />
            </ScrollView>
            <Text style={[styles.sectionLabel, { color: colors.muted }]}>FONTE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              <FilterChip label="Todas" selected={sourceFilter === "all"} onPress={() => setSourceFilter("all")} />
              <FilterChip label="SwitchPorts" selected={sourceFilter === "SwitchPorts"} onPress={() => setSourceFilter("SwitchPorts")} />
              <FilterChip label="Preservia" selected={sourceFilter === "Preservia"} onPress={() => setSourceFilter("Preservia")} />
            </ScrollView>
            <Text style={[styles.sectionLabel, { color: colors.muted }]}>CATEGORIA</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {categories.map((category) => <FilterChip key={category} label={category} selected={categoryFilter === category} onPress={() => setCategoryFilter(category)} />)}
            </ScrollView>
            <Text style={[styles.sectionLabel, { color: colors.muted }]}>ORDENAR POR</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              <FilterChip label="Mais recentes" selected={sortMode === "recent"} onPress={() => setSortMode("recent")} />
              <FilterChip label="Mais antigos" selected={sortMode === "oldest"} onPress={() => setSortMode("oldest")} />
              <FilterChip label="A–Z" selected={sortMode === "name"} onPress={() => setSortMode("name")} />
            </ScrollView>
            {syncState === "offline" && <View style={[styles.offlineBanner, { backgroundColor: `${colors.warning}18`, borderColor: `${colors.warning}55` }]}><MaterialIcons name="cloud-off" size={17} color={colors.warning} /><Text style={[styles.offlineText, { color: colors.warning }]}>Modo offline: mostrando a última cópia disponível.</Text></View>}
          </View>
        }
        ListEmptyComponent={<View style={styles.empty}><MaterialIcons name="manage-search" size={42} color={colors.muted} /><Text style={[styles.emptyTitle, { color: colors.foreground }]}>Nenhum port encontrado</Text><Text style={[styles.emptyText, { color: colors.muted }]}>Tente limpar a busca ou trocar os filtros.</Text></View>}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContent: { paddingHorizontal: 16, paddingBottom: 28 },
  header: { paddingTop: 9, paddingBottom: 13, gap: 12 },
  brandRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  brandLockup: { flexDirection: "row", alignItems: "center", gap: 8 },
  brandMark: { width: 25, height: 25, borderRadius: 8, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 3, transform: [{ rotate: "-8deg" }] },
  brandCut: { width: 4, height: 12, borderRadius: 3, backgroundColor: "#07131F", transform: [{ rotate: "28deg" }] },
  eyebrow: { fontSize: 10, fontWeight: "900", letterSpacing: 1.1 },
  syncMini: { flexDirection: "row", alignItems: "center", gap: 5, maxWidth: 142 },
  syncDot: { width: 7, height: 7, borderRadius: 7 },
  syncText: { fontSize: 10 },
  title: { fontSize: 29, lineHeight: 33, fontWeight: "900", letterSpacing: -0.8, maxWidth: 330, marginTop: 5 },
  subtitle: { fontSize: 14, lineHeight: 20, maxWidth: 340 },
  resultMeta: { flexDirection: "row", alignItems: "center", gap: 7, marginTop: 1 },
  resultMetaText: { fontSize: 11, fontWeight: "700" },
  searchBox: { height: 52, borderRadius: 16, borderWidth: 1, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 10, marginTop: 3 },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 0 },
  sectionLabel: { fontSize: 10, fontWeight: "900", letterSpacing: 1.1, marginTop: 3 },
  chipRow: { gap: 7, paddingRight: 6 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  chipLabel: { fontSize: 12, fontWeight: "700" },
  offlineBanner: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderRadius: 12, padding: 11 },
  offlineText: { flex: 1, fontSize: 12, fontWeight: "600" },
  empty: { alignItems: "center", paddingHorizontal: 28, paddingVertical: 62, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: "800", marginTop: 5 },
  emptyText: { fontSize: 13, textAlign: "center", lineHeight: 19 },
});
