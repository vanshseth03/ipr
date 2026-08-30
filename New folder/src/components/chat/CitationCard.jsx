import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Scale, ChevronDown, ChevronUp } from 'lucide-react-native';

import { colors, radii, spacing, typography } from '../../constants/theme';

export default function CitationCard({ citation }) {
  const [expanded, setExpanded] = useState(false);

  if (!citation) return null;

  const title = citation.title ?? citation.name ?? citation.source ?? 'Source';
  const details = citation.details ?? citation.description ?? citation.url ?? '';

  return (
    <Pressable
      onPress={() => setExpanded(!expanded)}
      accessibilityRole="button"
      accessibilityLabel={`Citation: ${title}`}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.accentBorder} />
      <View style={styles.cardContent}>
        <View style={styles.headerRow}>
          <View style={styles.labelRow}>
            <Scale size={12} color={colors.accent} strokeWidth={2.25} />
            <Text style={styles.label}>LEGAL SOURCE</Text>
          </View>
          {details ? (
            expanded ? (
              <ChevronUp size={14} color={colors.textMuted} strokeWidth={2} />
            ) : (
              <ChevronDown size={14} color={colors.textMuted} strokeWidth={2} />
            )
          ) : null}
        </View>
        <Text style={styles.title}>{title}</Text>
        {expanded && details ? (
          <Text style={styles.details}>{details}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSunken,
    overflow: 'hidden',
  },
  cardPressed: {
    opacity: 0.8,
  },
  accentBorder: {
    width: 3,
    backgroundColor: colors.accent,
  },
  cardContent: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  label: {
    ...typography.label,
    fontSize: 10,
    color: colors.accent,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  details: {
    ...typography.bodySmall,
    marginTop: spacing.xs,
    color: colors.textSecondary,
  },
});
