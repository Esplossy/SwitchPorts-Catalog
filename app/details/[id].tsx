import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Linking, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { StatusPill } from "@/components/status-pill";
import { useColors } from "@/hooks/use-colors";
import { formatPortDate } from "@/lib/catalog";
import { useCatalog } from "@/lib/catalog-context";

export default function DetailScreen() {
  const router = useRouter();
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { items, isFavorite, toggleFavorite } = useCatalog();
  const item = items.find((entry) => entry.id === id);

  if (!item) {
    return <ScreenContainer><View style={styles.notFound}><MaterialIcons name="search-off" size={42} color={colors.muted} /><Text style={[styles.notFoundTitle, { color: colors.foreground }]}>Port não encontrado</Text><Text style={[styles.notFoundText, { color: colors.muted }]}>Ele pode ter sido removido da fonte ou ainda não foi sincronizado.</Text><Pressable onPress={() => router.back()} style={[styles.backButton, { backgroundColor: colors.primary }]}><Text style={styles.backButtonText}>Voltar ao catálogo</Text></Pressable></View></ScreenContainer>;
  }

  const favorite = isFavorite(item.id);
  const open = (url: string) => void Linking.openURL(url);

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topBar}><Pressable onPress={() => router.back()} hitSlop={10} style={[styles.iconButton, { backgroundColor: colors.surface, borderColor: colors.border }]}><MaterialIcons name="arrow-back" size={21} color={colors.foreground} /></Pressable><View style={styles.topActions}><Pressable onPress={() => void Share.share({ title: item.name, message: `${item.name}\n${item.repoUrl}` })} hitSlop={10} style={[styles.iconButton, { backgroundColor: colors.surface, borderColor: colors.border }]}><MaterialIcons name="share" size={21} color={colors.foreground} /></Pressable><Pressable onPress={() => toggleFavorite(item.id)} hitSlop={10} style={[styles.iconButton, { backgroundColor: colors.surface, borderColor: colors.border }]}><MaterialIcons name={favorite ? "star" : "star-border"} size={22} color={favorite ? colors.warning : colors.foreground} /></Pressable></View></View>
        <View style={styles.hero}><View style={[styles.heroMark, { backgroundColor: item.archived ? `${colors.warning}20` : `${colors.primary}20` }]}><MaterialIcons name={item.archived ? "inventory-2" : "extension"} size={30} color={item.archived ? colors.warning : colors.primary} /></View><View style={styles.badgeRow}>{item.archived && <StatusPill label="ARQUIVADO" tone="warning" />}{item.recent && <StatusPill label="ATUALIZADO" tone="success" />}</View><Text style={[styles.title, { color: colors.foreground }]}>{item.name}</Text><Text style={[styles.subtitle, { color: colors.muted }]}>{item.system === item.category ? item.system : `${item.system} · ${item.category}`}</Text></View>

        <View style={[styles.metaCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.metaRow}><Text style={[styles.metaLabel, { color: colors.muted }]}>VERSÃO</Text><Text style={[styles.metaValue, { color: colors.foreground }]}>{item.version}</Text></View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.metaRow}><Text style={[styles.metaLabel, { color: colors.muted }]}>ÚLTIMA ATUALIZAÇÃO</Text><Text style={[styles.metaValue, { color: colors.foreground }]}>{formatPortDate(item.lastUpdated)}</Text></View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.metaRow}><Text style={[styles.metaLabel, { color: colors.muted }]}>FIRMWARE 21+</Text><Text style={[styles.metaValue, { color: item.firmware === "Yes" ? colors.success : item.firmware === "No" ? colors.error : colors.warning }]}>{item.firmware}</Text></View>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.muted }]}>LINKS DA FONTE</Text>
        <View style={styles.links}>
          {item.repoUrl && <Pressable onPress={() => open(item.repoUrl)} style={({ pressed }) => [styles.linkCard, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}><View style={[styles.linkIcon, { backgroundColor: `${colors.primary}1A` }]}><MaterialIcons name="code" size={20} color={colors.primary} /></View><View style={styles.linkCopy}><Text style={[styles.linkTitle, { color: colors.foreground }]}>Repositório oficial</Text><Text numberOfLines={1} style={[styles.linkSubtitle, { color: colors.muted }]}>{item.repoUrl.replace(/^https?:\/\/(www\.)?/, "")}</Text></View><MaterialIcons name="open-in-new" size={18} color={colors.primary} /></Pressable>}
          {item.threadUrl && <Pressable onPress={() => open(item.threadUrl)} style={({ pressed }) => [styles.linkCard, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}><View style={[styles.linkIcon, { backgroundColor: `${colors.warning}1A` }]}><MaterialIcons name="forum" size={20} color={colors.warning} /></View><View style={styles.linkCopy}><Text style={[styles.linkTitle, { color: colors.foreground }]}>Discussão no GBATemp</Text><Text numberOfLines={1} style={[styles.linkSubtitle, { color: colors.muted }]}>Tópico e instruções da comunidade</Text></View><MaterialIcons name="open-in-new" size={18} color={colors.warning} /></Pressable>}
        </View>
        <Text style={[styles.disclaimer, { color: colors.muted }]}>Os links são mantidos pela fonte pública e levam aos autores originais. Este catálogo não hospeda arquivos do port.</Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingTop: 9, paddingBottom: 36, gap: 13 },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  topActions: { flexDirection: "row", gap: 8 },
  iconButton: { width: 42, height: 42, borderWidth: 1, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  hero: { paddingTop: 17, gap: 8 },
  heroMark: { width: 64, height: 64, borderRadius: 21, alignItems: "center", justifyContent: "center", marginBottom: 3 },
  badgeRow: { flexDirection: "row", gap: 6, minHeight: 22 },
  title: { fontSize: 31, lineHeight: 35, fontWeight: "900", letterSpacing: -0.8 },
  subtitle: { fontSize: 14, lineHeight: 20 },
  metaCard: { borderWidth: 1, borderRadius: 18, padding: 16, gap: 13, marginTop: 7 },
  metaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
  metaLabel: { fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  metaValue: { fontSize: 13, fontWeight: "800", fontFamily: "monospace" },
  divider: { height: 1 },
  sectionLabel: { fontSize: 10, fontWeight: "900", letterSpacing: 1.1, marginTop: 7 },
  links: { gap: 9 },
  linkCard: { flexDirection: "row", alignItems: "center", gap: 11, borderWidth: 1, borderRadius: 16, padding: 12 },
  linkIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  linkCopy: { flex: 1, gap: 3 },
  linkTitle: { fontSize: 14, fontWeight: "800" },
  linkSubtitle: { fontSize: 11 },
  pressed: { opacity: 0.75 },
  disclaimer: { fontSize: 11, lineHeight: 17, textAlign: "center", marginTop: 7 },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center", padding: 30, gap: 10 },
  notFoundTitle: { fontSize: 20, fontWeight: "800" },
  notFoundText: { textAlign: "center", fontSize: 13, lineHeight: 19 },
  backButton: { paddingHorizontal: 17, paddingVertical: 12, borderRadius: 13, marginTop: 8 },
  backButtonText: { color: "#07131F", fontWeight: "900" },
});
