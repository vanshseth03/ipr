import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, radii } from '../../constants/theme';

export default function IngredientRow({
  ingredient,
  classification,
  confidence,
}) {
  const name =
    typeof ingredient === 'string'
      ? ingredient
      : ingredient?.name ?? ingredient?.label ?? 'Ingredient';

  const result =
    classification ??
    (typeof ingredient === 'object' ? ingredient?.classification : null);

  return (
    <View style={styles.row}>
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        {result ? <Text style={styles.result}>{result}</Text> : null}
      </View>

      {confidence !== undefined && confidence !== null ? (
        <Text style={styles.confidence}>
          {Math.round(
            typeof confidence === 'number' && confidence <= 1
              ? confidence * 100
              : confidence,
          )}
          %
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  info: {
    flex: 1,
    paddingRight: spacing.md,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  result: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textSecondary,
  },
  confidence: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.brand,
  },
});
