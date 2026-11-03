import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Linking, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { StatusPill } from "@/components/status-pill";
import { useColors } from "@/hooks/use-colors";
import { COMPLEMENTARY_SOURCES, REPOSITORY_URL } from "@/lib/catalog";
import { useCatalog } from "@/lib/catalog-context";

export default function SettingsScreen() {
  const colors = useColors();
  const { showArchived, setShowArchived, sortMode, favoriteNotifications, setFavoriteNotifications, changeHistory, syncNow, syncState, lastSyncedLabel, errorMessage, items } = useCatalog();
  const isSyncing = syncState === "syncing";

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>CONTROLE DO ÍNDICE</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>Ajustes</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>Controle a fonte, o cache local e o que aparece no catálogo.</Text>

        <View style={[styles.syncCard, { backgroundColor: colors.foreground }]}>
          <View style={styles.syncCardTop}><View><Text style={styles.darkLabel}>STATUS DA FONTE</Text><Text style={styles.darkTitle}>{syncState === "offline" ? "Disponível offline" : isSyncing ? "Sincronizando…" : "Fonte conectada"}</Text></View><StatusPill label={syncState === "offline" ? "OFFLINE" : isSyncing ? "ATUALIZANDO" : "ONLINE"} tone={syncState === "offline" ? "warning" : "success"} /></View>
          <Text style={styles.darkMeta}>Última sincronização: {lastSyncedLabel}</Text>
          <Pressable disabled={isSyncing} onPress={() => void syncNow()} style={({ pressed }) => [styles.syncButton, { backgroundColor: colors.primary }, pressed && styles.pressed, isSyncing && styles.disabled]}><MaterialIcons name={isSyncing ? "sync" : "refresh"} size={19} color="#07131F" /><Text style={styles.syncButtonText}>{isSyncing ? "Sincronizando" : "Sincronizar agora"}</Text></Pressable>
          {errorMessage && <Text style={styles.darkError}>{errorMessage}</Text>}
        </View>

        <Text style={[styles.sectionLabel, { color: colors.muted }]}>EXIBIÇÃO</Text>
        <View style={[styles.preferenceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.preferenceCopy}><Text style={[styles.preferenceTitle, { color: colors.foreground }]}>Mostrar arquivados</Text><Text style={[styles.preferenceDescription, { color: colors.muted }]}>Inclui projetos movidos para DEAD.md no catálogo e nos filtros.</Text></View>
          <Switch value={showArchived} onValueChange={setShowArchived} trackColor={{ false: colors.border, true: `${colors.primary}88` }} thumbColor={showArchived ? colors.primary : colors.muted} />
        </View>
        <View style={[styles.preferenceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.preferenceCopy}><Text style={[styles.preferenceTitle, { color: colors.foreground }]}>Notificar favoritos</Text><Text style={[styles.preferenceDescription, { color: colors.muted }]}>Avisa somente quando um port salvo nos favoritos receber nova versão, data ou compatibilidade atualizada.</Text></View>
          <Switch value={favoriteNotifications} onValueChange={(value) => void setFavoriteNotifications(value)} trackColor={{ false: colors.border, true: `${colors.primary}88` }} thumbColor={favoriteNotifications ? colors.primary : colors.muted} />
        </View>
        <View style={[styles.preferenceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.preferenceCopy}><Text style={[styles.preferenceTitle, { color: colors.foreground }]}>Ordem do catálogo</Text><Text style={[styles.preferenceDescription, { color: colors.muted }]}>A escolha feita em “Ordenar por” fica salva entre as sessões.</Text></View><Text style={[styles.preferenceValue, { color: colors.primary }]}>{sortMode === "oldest" ? "Mais antigos" : sortMode === "name" ? "A–Z" : "Mais recentes"}</Text>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.muted }]}>FONTE E CRÉDITOS</Text>
        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.infoRow}><MaterialIcons name="inventory-2" size={20} color={colors.primary} /><View style={styles.infoCopy}><Text style={[styles.infoTitle, { color: colors.foreground }]}>Catálogo agregado</Text><Text style={[styles.infoText, { color: colors.muted }]}>{items.length} itens indexados de SwitchPorts, Preservia e BTech Games, com tipo e plataforma declarados.</Text></View></View>
          <Pressable onPress={() => void Linking.openURL(REPOSITORY_URL)} style={({ pressed }) => [styles.sourceButton, { borderColor: colors.border }, pressed && styles.pressed]}><Text style={[styles.sourceButtonText, { color: colors.primary }]}>Abrir repositório original</Text><MaterialIcons name="open-in-new" size={17} color={colors.primary} /></Pressable>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.muted }]}>FONTES COMPLEMENTARES</Text>
        <View style={styles.sources}>
          {COMPLEMENTARY_SOURCES.map((source) => <Pressable key={source.name} onPress={() => void Linking.openURL(source.url)} style={({ pressed }) => [styles.sourceCard, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}><View style={[styles.sourceIcon, { backgroundColor: `${colors.primary}18` }]}><MaterialIcons name="travel-explore" size={19} color={colors.primary} /></View><View style={styles.infoCopy}><Text style={[styles.sourceTitle, { color: colors.foreground }]}>{source.name}</Text><Text style={[styles.sourceDescription, { color: colors.muted }]}>{source.description}</Text></View><MaterialIcons name="open-in-new" size={17} color={colors.primary} /></Pressable>)}
        </View>

        <Text style={[styles.sectionLabel, { color: colors.muted }]}>HISTÓRICO RECENTE</Text>
        <View style={[styles.historyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {changeHistory.length === 0 ? <Text style={[styles.historyEmpty, { color: colors.muted }]}>As alterações aparecerão após a próxima sincronização.</Text> : changeHistory.slice(0, 8).map((change) => <View key={`${change.detectedAt}-${change.id}-${change.type}`} style={styles.historyRow}><View style={[styles.historyDot, { backgroundColor: change.type === "added" ? colors.success : change.type === "removed" ? colors.warning : colors.primary }]} /><View style={styles.historyCopy}><Text numberOfLines={1} style={[styles.historyName, { color: colors.foreground }]}>{change.name}</Text><Text style={[styles.historyMeta, { color: colors.muted }]}>{change.type === "added" ? "Adicionado" : change.type === "removed" ? "Removido" : "Atualizado"} · {change.source} · {new Date(change.detectedAt).toLocaleDateString("pt-BR")}</Text></View></View>)}
        </View>

        <View style={[styles.notice, { backgroundColor: `${colors.warning}12`, borderColor: `${colors.warning}45` }]}><MaterialIcons name="info-outline" size={19} color={colors.warning} /><Text style={[styles.noticeText, { color: colors.muted }]}>Este app é apenas um catálogo de links e metadados. Ele não baixa nem distribui jogos, ROMs, executáveis ou arquivos protegidos.</Text></View>
        <Text style={[styles.footer, { color: colors.muted }]}>Fonte pública: github.com/robzilla10001/SwitchPorts{`\n`}Os links pertencem aos autores de cada projeto.</Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingTop: 9, paddingBottom: 34, gap: 12 },
  eyebrow: { fontSize: 10, fontWeight: "900", letterSpacing: 1.2 },
  title: { fontSize: 31, fontWeight: "900", letterSpacing: -0.8 },
  subtitle: { fontSize: 14, lineHeight: 20, marginBottom: 8 },
  syncCard: { borderRadius: 20, padding: 17, gap: 13, marginBottom: 12 },
  syncCardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 10 },
  darkLabel: { color: "#8EA7AE", fontSize: 9, fontWeight: "900", letterSpacing: 1.1 },
  darkTitle: { color: "#E8F4F5", fontSize: 19, fontWeight: "800", marginTop: 4 },
  darkMeta: { color: "#8EA7AE", fontSize: 12 },
  syncButton: { height: 45, borderRadius: 13, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  syncButtonText: { color: "#07131F", fontSize: 13, fontWeight: "900" },
  darkError: { color: "#F1B55E", fontSize: 12, lineHeight: 17 },
  pressed: { opacity: 0.76 },
  disabled: { opacity: 0.55 },
  sectionLabel: { fontSize: 10, fontWeight: "900", letterSpacing: 1.1, marginTop: 8 },
  preferenceCard: { borderWidth: 1, borderRadius: 17, padding: 15, flexDirection: "row", alignItems: "center", gap: 12 },
  preferenceCopy: { flex: 1, gap: 5 },
  preferenceTitle: { fontSize: 15, fontWeight: "800" },
  preferenceDescription: { fontSize: 12, lineHeight: 17 },
  preferenceValue: { fontSize: 12, fontWeight: "900", textAlign: "right", maxWidth: 88 },
  infoCard: { borderWidth: 1, borderRadius: 17, padding: 15, gap: 15 },
  infoRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  infoCopy: { flex: 1, gap: 4 },
  infoTitle: { fontSize: 15, fontWeight: "800" },
  infoText: { fontSize: 12, lineHeight: 17 },
  sourceButton: { borderTopWidth: 1, paddingTop: 13, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sourceButtonText: { fontSize: 13, fontWeight: "800" },
  sources: { gap: 8 },
  sourceCard: { borderWidth: 1, borderRadius: 17, padding: 12, flexDirection: "row", alignItems: "center", gap: 10 },
  sourceIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  sourceTitle: { fontSize: 13, fontWeight: "800" },
  sourceDescription: { fontSize: 11, lineHeight: 16, marginTop: 3 },
  historyCard: { borderWidth: 1, borderRadius: 17, padding: 14, gap: 12 },
  historyEmpty: { fontSize: 12, lineHeight: 18 },
  historyRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  historyDot: { width: 8, height: 8, borderRadius: 8 },
  historyCopy: { flex: 1, gap: 3 },
  historyName: { fontSize: 13, fontWeight: "800" },
  historyMeta: { fontSize: 11 },
  notice: { borderWidth: 1, borderRadius: 15, padding: 13, flexDirection: "row", gap: 9, alignItems: "flex-start" },
  noticeText: { flex: 1, fontSize: 12, lineHeight: 18 },
  footer: { fontSize: 11, lineHeight: 17, textAlign: "center", marginTop: 5 },
});
