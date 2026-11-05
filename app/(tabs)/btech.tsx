import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { CatalogCard } from "@/components/catalog-card";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { sortCatalogItems, type CatalogItem } from "@/lib/catalog";
import { useCatalog } from "@/lib/catalog-context";

function FilterChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const colors = useColors();
  return <Pressable onPress={onPress} style={[styles.chip, { borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? `${colors.primary}20` : colors.surface }]}><Text style={[styles.chipLabel, { color: selected ? colors.primary : colors.muted }]}>{label}</Text></Pressable>;
}

export default function BtechScreen() {
  const router = useRouter();
  const colors = useColors();
  const { items, showArchived, externalCovers, sortMode, setSortMode, syncState, lastSyncedLabel, toggleFavorite, isFavorite, syncNow } = useCatalog();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("Todos");
  const [platformFilter, setPlatformFilter] = useState("Todas");
  const [recentOnly, setRecentOnly] = useState(false);
  const [popularOnly, setPopularOnly] = useState(false);

  const btechItems = useMemo(() => items.filter((item) => item.source === "BTechProjects"), [items]);
  const types = useMemo(() => ["Todos", ...Array.from(new Set(btechItems.map((item) => item.catalogType ?? "Outro"))).sort()], [btechItems]);
  const platforms = useMemo(() => ["Todas", ...Array.from(new Set(btechItems.map((item) => item.system))).sort((a, b) => a.localeCompare(b))], [btechItems]);
  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("pt-BR");
    return sortCatalogItems(btechItems
      .filter((item) => showArchived || !item.archived)
      .filter((item) => typeFilter === "Todos" || (item.catalogType ?? "Outro") === typeFilter)
      .filter((item) => platformFilter === "Todas" || item.system === platformFilter)
      .filter((item) => !recentOnly || item.recent)
      .filter((item) => !popularOnly || (item.githubPopularity?.stars ?? 0) >= 100)
      .filter((item) => !normalized || [item.name, item.system, item.category, item.version].some((value) => value.toLocaleLowerCase("pt-BR").includes(normalized))), sortMode);
  }, [btechItems, platformFilter, popularOnly, query, recentOnly, showArchived, sortMode, typeFilter]);

  return <ScreenContainer edges={["top", "left", "right"]}>
    <FlatList
      data={filteredItems}
      keyExtractor={(item) => item.id}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.listContent}
      renderItem={({ item }: { item: CatalogItem }) => <CatalogCard item={item} showExternalImage={externalCovers} favorite={isFavorite(item.id)} onToggleFavorite={() => toggleFavorite(item.id)} onPress={() => router.push({ pathname: "/details/[id]", params: { id: item.id } })} />}
      refreshControl={<RefreshControl refreshing={syncState === "syncing"} onRefresh={() => void syncNow()} tintColor={colors.primary} colors={[colors.primary]} />}
      ListHeaderComponent={<View style={styles.header}>
        <View style={styles.brandRow}><View style={styles.brandLockup}><View style={[styles.brandMark, { backgroundColor: colors.primary }]}><MaterialIcons name="bolt" size={18} color="#07131F" /></View><Text style={[styles.eyebrow, { color: colors.primary }]}>BTECH GAMES / PROJETOS</Text></View><Text numberOfLines={1} style={[styles.syncText, { color: colors.muted }]}>{lastSyncedLabel}</Text></View>
        <Text style={[styles.title, { color: colors.foreground }]}>Projetos BTech, separados.</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>Packs, utilitários e ferramentas monitorados pela BTech. Os ports de jogos ficam no Catálogo.</Text>
        <View style={styles.resultMeta}><Text style={[styles.resultMetaText, { color: colors.muted }]}>{filteredItems.length} resultados</Text><Text style={[styles.resultMetaText, { color: colors.muted }]}>· {btechItems.length} projetos</Text></View>
        <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}><MaterialIcons name="search" size={22} color={colors.muted} /><TextInput value={query} onChangeText={setQuery} placeholder="Buscar projeto ou plataforma" placeholderTextColor={colors.muted} style={[styles.searchInput, { color: colors.foreground }]} />{query.length > 0 && <Pressable onPress={() => setQuery("")} hitSlop={8}><MaterialIcons name="close" size={19} color={colors.muted} /></Pressable>}</View>
        <Text style={[styles.sectionLabel, { color: colors.muted }]}>TIPO</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>{types.map((type) => <FilterChip key={type} label={type} selected={typeFilter === type} onPress={() => setTypeFilter(type)} />)}<FilterChip label="Recentes" selected={recentOnly} onPress={() => setRecentOnly(!recentOnly)} /><FilterChip label="100+ estrelas" selected={popularOnly} onPress={() => setPopularOnly(!popularOnly)} /></ScrollView>
        <Text style={[styles.sectionLabel, { color: colors.muted }]}>PLATAFORMA DE ORIGEM</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>{platforms.map((platform) => <FilterChip key={platform} label={platform} selected={platformFilter === platform} onPress={() => setPlatformFilter(platform)} />)}</ScrollView>
        <Text style={[styles.sectionLabel, { color: colors.muted }]}>ORDENAR</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}><FilterChip label="Mais recentes" selected={sortMode === "recent"} onPress={() => setSortMode("recent")} /><FilterChip label="Mais antigos" selected={sortMode === "oldest"} onPress={() => setSortMode("oldest")} /><FilterChip label="A–Z" selected={sortMode === "name"} onPress={() => setSortMode("name")} /><FilterChip label="Mais populares" selected={sortMode === "popularity"} onPress={() => setSortMode("popularity")} /></ScrollView>
      </View>}
      ListEmptyComponent={<View style={styles.empty}><MaterialIcons name="manage-search" size={42} color={colors.muted} /><Text style={[styles.emptyTitle, { color: colors.foreground }]}>Nenhum projeto BTech encontrado</Text><Text style={[styles.emptyText, { color: colors.muted }]}>Tente limpar a busca ou trocar os filtros.</Text></View>}
    />
  </ScreenContainer>;
}

const styles = StyleSheet.create({
  listContent: { paddingHorizontal: 16, paddingBottom: 28 },
  header: { paddingTop: 9, paddingBottom: 13, gap: 12 },
  brandRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  brandLockup: { flexDirection: "row", alignItems: "center", gap: 8 },
  brandMark: { width: 27, height: 27, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  eyebrow: { fontSize: 10, fontWeight: "900", letterSpacing: 1.1 },
  syncText: { fontSize: 10, maxWidth: 132 },
  title: { fontSize: 29, lineHeight: 33, fontWeight: "900", letterSpacing: -0.8, maxWidth: 340, marginTop: 5 },
  subtitle: { fontSize: 14, lineHeight: 20, maxWidth: 350 },
  resultMeta: { flexDirection: "row", alignItems: "center", gap: 7 },
  resultMetaText: { fontSize: 11, fontWeight: "700" },
  searchBox: { height: 52, borderRadius: 16, borderWidth: 1, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 10, marginTop: 3 },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 0 },
  sectionLabel: { fontSize: 10, fontWeight: "900", letterSpacing: 1.1, marginTop: 3 },
  chipRow: { gap: 7, paddingRight: 6 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  chipLabel: { fontSize: 12, fontWeight: "700" },
  empty: { alignItems: "center", paddingHorizontal: 28, paddingVertical: 62, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: "800", marginTop: 5 },
  emptyText: { fontSize: 13, textAlign: "center", lineHeight: 19 },
});
