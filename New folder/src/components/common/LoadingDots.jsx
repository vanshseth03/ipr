import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/theme';

export default function LoadingDots({ label = 'Loading' }) {
  return (
    <View accessible accessibilityLabel={label} style={styles.container}>
      <Text style={styles.text}>{label}</Text>
      <View style={styles.dots}>
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  text: { fontSize: 13, color: colors.textMuted },
  dots: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.brandLight },
});
