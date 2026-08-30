import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radii, spacing } from '../../constants/theme';

export default function FileUploadButton({
  onPress,
  label = 'Upload File',
  icon: Icon,
  disabled = false,
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      {Icon ? <Icon size={16} color={colors.textOnBrand} strokeWidth={2.25} /> : null}
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 3,
    borderRadius: radii.md,
    backgroundColor: colors.brand,
  },
  text: {
    color: colors.textOnBrand,
    fontSize: 14,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.45,
  },
});
