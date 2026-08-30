import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, typography } from '../../constants/theme';

export default function Disclaimer({
  text = 'Information provided by this assistant is for educational purposes and is not legal advice. Always consult a registered patent attorney.',
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>⚖️ Disclaimer</Text>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceSunken,
    borderWidth: 1,
    borderColor: colors.borderAccent,
  },
  label: {
    marginBottom: spacing.xs,
    fontSize: 12,
    fontWeight: '700',
    color: colors.accent,
  },
  text: {
    fontSize: 12,
    lineHeight: 17,
    color: colors.textSecondary,
  },
});
