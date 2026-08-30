import { Pressable, StyleSheet, Text } from 'react-native';
import { UserRound } from 'lucide-react-native';

import { colors, radii, spacing } from '../../constants/theme';

export default function EscalateButton({ onPress, disabled = false }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Escalate to IP facilitator"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <UserRound size={13} color={colors.accent} strokeWidth={2.25} />
      <Text style={styles.text}>Talk to an IP expert</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    backgroundColor: colors.surfaceSunken,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.4,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent,
  },
});
