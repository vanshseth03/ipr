import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../../constants/theme';

const OPTIONS = [
  { value: 'IN', label: 'India' },
  { value: 'GLOBAL', label: 'International' },
];

export default function JurisdictionToggle({
  value = 'IN',
  onChange,
  disabled = false,
}) {
  return (
    <View style={styles.container}>
      {OPTIONS.map((option) => {
        const selected = value === option.value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected, disabled }}
            onPress={() => onChange?.(option.value)}
            disabled={disabled}
            style={({ pressed }) => [
              styles.option,
              selected && styles.selected,
              pressed && !disabled && styles.pressed,
              disabled && styles.disabled,
            ]}
          >
            <Text style={[styles.text, selected && styles.selectedText]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    padding: 3,
    borderRadius: radii.md,
    backgroundColor: colors.bgMuted,
    gap: 3,
  },
  option: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 3,
    borderRadius: radii.sm,
  },
  selected: {
    backgroundColor: colors.surfaceRaised,
  },
  text: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  selectedText: {
    fontWeight: '700',
    color: colors.brand,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.45,
  },
});
