import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FileText, Image as ImageIcon, X } from 'lucide-react-native';

import { colors, radii, spacing } from '../../constants/theme';
import { FILE_TYPES } from '../../models/files';

export default function FileCard({ file, onRemove, compact = false }) {
  if (!file) {
    return null;
  }

  const name = file.name ?? 'Selected file';
  const size =
    typeof file.size === 'number'
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      : null;
  const Icon = file.type === FILE_TYPES.IMAGE ? ImageIcon : FileText;

  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <Icon size={16} color={colors.brand} strokeWidth={2.25} />

      <View style={styles.textCol}>
        <Text numberOfLines={1} style={styles.name}>
          {name}
        </Text>
        {size ? <Text style={styles.size}>{size}</Text> : null}
      </View>

      {onRemove ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Remove attachment"
          onPress={onRemove}
          hitSlop={8}
          style={styles.removeButton}
        >
          <X size={14} color={colors.textMuted} strokeWidth={2.25} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    width: '100%',
    padding: spacing.sm + 2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.bgSubtle,
  },
  cardCompact: {
    padding: spacing.sm,
  },
  textCol: {
    flex: 1,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  size: {
    marginTop: 1,
    fontSize: 11,
    color: colors.textMuted,
  },
  removeButton: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.bg,
  },
});
