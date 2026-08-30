import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, typography, shadow } from '../../constants/theme';

export default function ClassifyWizardStep({
  step,
  title,
  description,
  children,
}) {
  return (
    <View style={styles.container}>
      {step !== undefined ? (
        <Text style={styles.step}>Step {step}</Text>
      ) : null}

      <Text style={styles.title}>{title}</Text>

      {description ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}

      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
  },
  step: {
    ...typography.label,
    marginBottom: spacing.xs,
    color: colors.accent,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  description: {
    marginTop: spacing.xs,
    ...typography.bodySmall,
  },
  content: {
    marginTop: spacing.lg,
  },
});
