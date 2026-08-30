import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../../constants/theme';

export default function ConfidenceBadge({ confidence }) {
  if (confidence === undefined || confidence === null) return null;

  const value =
    typeof confidence === 'number'
      ? Math.round(confidence <= 1 ? confidence * 100 : confidence)
      : confidence;

  const numVal = typeof value === 'number' ? value : 50;

  let bgColor, textColor, label;
  if (numVal >= 80) {
    bgColor = colors.confidenceHighBg;
    textColor = colors.confidenceHigh;
    label = 'High';
  } else if (numVal >= 50) {
    bgColor = colors.confidenceMedBg;
    textColor = colors.confidenceMed;
    label = 'Medium';
  } else {
    bgColor = colors.confidenceLowBg;
    textColor = colors.confidenceLow;
    label = 'Low';
  }

  return (
    <View style={[styles.badge, { backgroundColor: bgColor }]}>
      <View style={[styles.dot, { backgroundColor: textColor }]} />
      <Text style={[styles.text, { color: textColor }]}>
        {value}% · {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.pill,
    marginLeft: spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
  },
});
