import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

import { CatalogCard } from "@/components/catalog-card";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useCatalog } from "@/lib/catalog-context";
import { sortCatalogItems } from "@/lib/catalog";

export default function FavoritesScreen() {
  const router = useRouter();
  const colors = useColors();
  const { items, favorites, showArchived, externalCovers, toggleFavorite, isFavorite } = useCatalog();
  const favoriteItems = useMemo(() => sortCatalogItems(items.filter((item) => favorites.includes(item.id) && (showArchived || !item.archived))), [favorites, items, showArchived]);

  return (
    <ScreenContainer>
      <FlatList
        data={favoriteItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        renderItem={({ item }) => <CatalogCard item={item} showExternalImage={externalCovers} favorite={isFavorite(item.id)} onToggleFavorite={() => toggleFavorite(item.id)} onPress={() => router.push({ pathname: "/details/[id]", params: { id: item.id } })} />}
        ListHeaderComponent={<View style={styles.header}><Text style={[styles.eyebrow, { color: colors.primary }]}>SUA COLEÇÃO</Text><Text style={[styles.title, { color: colors.foreground }]}>Favoritos</Text><Text style={[styles.subtitle, { color: colors.muted }]}>{favoriteItems.length === 0 ? "Guarde os ports que você quer acompanhar de perto." : `${favoriteItems.length} ${favoriteItems.length === 1 ? "item salvo" : "itens salvos"}.`}</Text></View>}
        ListEmptyComponent={<View style={styles.empty}><View style={[styles.emptyIcon, { backgroundColor: `${colors.warning}18` }]}><MaterialIcons name="star-border" size={35} color={colors.warning} /></View><Text style={[styles.emptyTitle, { color: colors.foreground }]}>Sua lista está vazia</Text><Text style={[styles.emptyText, { color: colors.muted }]}>Toque na estrela de qualquer card para criar sua lista pessoal.</Text></View>}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingBottom: 28 },
  header: { paddingTop: 9, paddingBottom: 20, gap: 8 },
  eyebrow: { fontSize: 10, fontWeight: "900", letterSpacing: 1.2 },
  title: { fontSize: 31, fontWeight: "900", letterSpacing: -0.8 },
  subtitle: { fontSize: 14, lineHeight: 20, maxWidth: 340 },
  empty: { alignItems: "center", paddingHorizontal: 30, paddingVertical: 80, gap: 9 },
  emptyIcon: { width: 72, height: 72, borderRadius: 24, alignItems: "center", justifyContent: "center", marginBottom: 7 },
  emptyTitle: { fontSize: 19, fontWeight: "800" },
  emptyText: { textAlign: "center", fontSize: 13, lineHeight: 19 },
});
