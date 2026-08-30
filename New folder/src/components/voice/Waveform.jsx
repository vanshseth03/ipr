import { StyleSheet, View } from 'react-native';
import { colors } from '../../constants/theme';

export default function Waveform({ active = false, bars = 9 }) {
  const safeBars = Math.max(1, bars);

  return (
    <View
      accessible
      accessibilityLabel={active ? 'Voice activity detected' : 'Voice idle'}
      style={styles.container}
    >
      {Array.from({ length: safeBars }, (_, index) => {
        const middle = (safeBars - 1) / 2;
        const distance = Math.abs(index - middle);
        const height = active ? Math.max(10, 36 - distance * 5) : 8;

        return (
          <View
            key={index}
            style={[
              styles.bar,
              {
                height,
                opacity: active ? 0.8 + (1 - distance / middle) * 0.2 : 0.3,
                backgroundColor: active ? colors.brand : colors.textMuted,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  bar: {
    width: 4,
    borderRadius: 2,
  },
});
