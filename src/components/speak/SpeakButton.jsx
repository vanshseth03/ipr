import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Volume2, Square } from 'lucide-react-native';
import { colors, radii, spacing } from '../../constants/theme';

export default function SpeakButton({
  onPress,
  isSpeaking = false,
  disabled = false,
  compact = false,
}) {
  const Icon = isSpeaking ? Square : Volume2;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={isSpeaking ? 'Stop reading' : 'Read aloud'}
      accessibilityState={{ disabled }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        isSpeaking && styles.active,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Icon
        size={14}
        strokeWidth={2.25}
        color={isSpeaking ? colors.brand : colors.textMuted}
      />
      {!compact && (
        <View style={styles.labelWrap}>
          <Text style={[styles.label, isSpeaking && styles.labelActive]}>
            {isSpeaking ? 'Stop' : 'Listen'}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    minHeight: 28,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radii.pill,
    backgroundColor: colors.bgMuted,
  },
  active: {
    backgroundColor: colors.brandSubtle,
  },
  labelWrap: { flexShrink: 1 },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  labelActive: {
    color: colors.brand,
  },
  pressed: {
    opacity: 0.65,
  },
  disabled: {
    opacity: 0.4,
  },
});
