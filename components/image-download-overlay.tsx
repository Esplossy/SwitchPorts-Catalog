import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/use-colors";
import { useCatalog } from "@/lib/catalog-context";

export function ImageDownloadOverlay() {
  const colors = useColors();
  const { imageDownload, dismissImageDownload } = useCatalog();
  if (!imageDownload) return null;

  const percent = imageDownload.total > 0 ? Math.min(100, Math.round((imageDownload.current / imageDownload.total) * 100)) : 0;
  const active = imageDownload.active;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={() => undefined}>
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.icon, { backgroundColor: `${colors.primary}18` }]}>
            <MaterialIcons name={active ? "cloud-download" : "check-circle"} size={30} color={active ? colors.primary : colors.success} />
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>{active ? "Preparando catálogo offline" : "Download concluído"}</Text>
          <Text style={[styles.description, { color: colors.muted }]}>
            {active ? "O app ficará bloqueado até todas as publicações serem processadas." : "As imagens disponíveis foram salvas no armazenamento do aparelho."}
          </Text>
          <Text style={[styles.percent, { color: colors.primary }]}>{percent}%</Text>
          <View style={[styles.track, { backgroundColor: colors.border }]}>
            <View style={[styles.fill, { width: `${percent}%`, backgroundColor: colors.primary }]} />
          </View>
          <Text numberOfLines={1} style={[styles.current, { color: colors.foreground }]}>{imageDownload.currentName}</Text>
          <Text style={[styles.counter, { color: colors.muted }]}>{imageDownload.current} de {imageDownload.total} · {imageDownload.downloaded} salvas{imageDownload.failed > 0 ? ` · ${imageDownload.failed} sem imagem` : ""}</Text>
          {active ? <Text style={[styles.lockNotice, { color: colors.warning }]}>Não feche o app durante o processamento.</Text> : <Pressable onPress={dismissImageDownload} style={[styles.doneButton, { backgroundColor: colors.primary }]}><Text style={styles.doneText}>Continuar</Text></Pressable>}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.72)", alignItems: "center", justifyContent: "center", padding: 24 },
  card: { width: "100%", maxWidth: 390, borderWidth: 1, borderRadius: 24, padding: 22, alignItems: "center", gap: 11 },
  icon: { width: 62, height: 62, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: 2 },
  title: { fontSize: 20, fontWeight: "900", textAlign: "center" },
  description: { fontSize: 13, lineHeight: 19, textAlign: "center" },
  percent: { fontSize: 45, lineHeight: 52, fontWeight: "900", marginTop: 8 },
  track: { width: "100%", height: 11, borderRadius: 99, overflow: "hidden", marginTop: 2 },
  fill: { height: "100%", borderRadius: 99 },
  current: { width: "100%", fontSize: 12, fontWeight: "800", textAlign: "center", marginTop: 3 },
  counter: { fontSize: 11, textAlign: "center" },
  lockNotice: { fontSize: 11, fontWeight: "800", textAlign: "center", marginTop: 5 },
  doneButton: { minWidth: 150, borderRadius: 13, paddingHorizontal: 20, paddingVertical: 12, marginTop: 6, alignItems: "center" },
  doneText: { color: "#07131F", fontSize: 13, fontWeight: "900" },
});
