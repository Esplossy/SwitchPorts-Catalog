import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/use-colors";

export function StatusPill({ label, tone = "neutral" }: { label: string; tone?: "success" | "warning" | "neutral" | "info" }) {
  const colors = useColors();
  const toneColors = {
    success: { backgroundColor: `${colors.success}22`, color: colors.success },
    warning: { backgroundColor: `${colors.warning}22`, color: colors.warning },
    info: { backgroundColor: `${colors.primary}22`, color: colors.primary },
    neutral: { backgroundColor: `${colors.muted}20`, color: colors.muted },
  }[tone];

  return (
    <View style={[styles.pill, { backgroundColor: toneColors.backgroundColor }]}>
      <Text style={[styles.label, { color: toneColors.color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 },
  label: { fontSize: 10, fontWeight: "800", letterSpacing: 0.7 },
});
