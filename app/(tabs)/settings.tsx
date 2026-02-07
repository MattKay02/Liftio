import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '@/constants';
import { useSettingsStore } from '@/lib/stores/settingsStore';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const { settings, updateWeightUnit, updateRestTimer } = useSettingsStore();

  const restTimerOptions = [60, 90, 120, 180];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Weight Unit</Text>
          <View style={styles.optionRow}>
            <Pressable
              style={[
                styles.optionButton,
                settings.weightUnit === 'lbs' && styles.optionButtonActive,
              ]}
              onPress={() => updateWeightUnit('lbs')}
            >
              <Text
                style={[
                  styles.optionText,
                  settings.weightUnit === 'lbs' && styles.optionTextActive,
                ]}
              >
                lbs
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.optionButton,
                settings.weightUnit === 'kg' && styles.optionButtonActive,
              ]}
              onPress={() => updateWeightUnit('kg')}
            >
              <Text
                style={[
                  styles.optionText,
                  settings.weightUnit === 'kg' && styles.optionTextActive,
                ]}
              >
                kg
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Default Rest Timer</Text>
          <View style={styles.optionRow}>
            {restTimerOptions.map((seconds) => (
              <Pressable
                key={seconds}
                style={[
                  styles.optionButton,
                  settings.defaultRestTimer === seconds && styles.optionButtonActive,
                ]}
                onPress={() => updateRestTimer(seconds)}
              >
                <Text
                  style={[
                    styles.optionText,
                    settings.defaultRestTimer === seconds && styles.optionTextActive,
                  ]}
                >
                  {seconds >= 60 ? `${seconds / 60}m` : `${seconds}s`}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Liftio v1.0.0</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: Typography.fontSize.display,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.grey900,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  section: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    fontSize: Typography.fontSize.caption,
    color: Colors.grey600,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  optionButton: {
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.grey300,
    backgroundColor: Colors.white,
  },
  optionButtonActive: {
    backgroundColor: Colors.grey800,
    borderColor: Colors.grey800,
  },
  optionText: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.grey600,
  },
  optionTextActive: {
    color: Colors.white,
  },
  footer: {
    position: 'absolute',
    bottom: Spacing.xl,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  footerText: {
    fontSize: Typography.fontSize.caption,
    color: Colors.grey400,
  },
});
