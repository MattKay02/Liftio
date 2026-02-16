import { useState, useRef } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView, Alert, ActivityIndicator, Linking, Animated } from 'react-native';
import { X } from 'lucide-react-native';
import { Colors, Spacing, Typography, Shadows } from '@/constants';
import { useSettingsStore } from '@/lib/stores/settingsStore';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import { exportWorkoutData } from '@/lib/utils/csvExportImport';

interface SettingsMenuProps {
  visible: boolean;
  onClose: () => void;
}

export const SettingsMenu = ({ visible, onClose }: SettingsMenuProps) => {
  const settings = useSettingsStore((s) => s.settings);
  const updateWeightUnit = useSettingsStore((s) => s.updateWeightUnit);
  const updateDistanceUnit = useSettingsStore((s) => s.updateDistanceUnit);
  const updateRestTimer = useSettingsStore((s) => s.updateRestTimer);
  const weightUnit = settings.weightUnit;
  const distanceUnit = settings.distanceUnit;
  const defaultRestTimer = settings.defaultRestTimer;
  const [isExporting, setIsExporting] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const aboutTranslateY = useRef(new Animated.Value(400)).current;

  const openAbout = () => {
    setShowAbout(true);
    Animated.spring(aboutTranslateY, {
      toValue: 0,
      useNativeDriver: true,
      damping: 25,
      stiffness: 200,
    }).start();
  };

  const closeAbout = () => {
    Animated.timing(aboutTranslateY, {
      toValue: 400,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setShowAbout(false));
  };

  const restTimerOptions = [60, 90, 120, 180];

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportWorkoutData();
    } catch (e: any) {
      Alert.alert('Export Failed', e.message || 'Something went wrong.');
    } finally {
      setIsExporting(false);
    }
  };


  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View
          style={styles.menuContainer}
          onStartShouldSetResponder={() => true}
          onTouchEndCapture={() => {}}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Settings</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <X size={24} color={Colors.textSecondary} />
            </Pressable>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Weight Unit */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Weight Unit</Text>
              <View style={styles.optionGroup}>
                <Pressable
                  style={[styles.optionButton, weightUnit === 'lbs' && styles.optionButtonActive]}
                  onPress={() => updateWeightUnit('lbs')}
                >
                  <Text
                    style={[
                      styles.optionText,
                      weightUnit === 'lbs' && styles.optionTextActive,
                    ]}
                  >
                    Pounds (lbs)
                  </Text>
                  {weightUnit === 'lbs' && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </Pressable>
                <Pressable
                  style={[styles.optionButton, weightUnit === 'kg' && styles.optionButtonActive]}
                  onPress={() => updateWeightUnit('kg')}
                >
                  <Text
                    style={[
                      styles.optionText,
                      weightUnit === 'kg' && styles.optionTextActive,
                    ]}
                  >
                    Kilograms (kg)
                  </Text>
                  {weightUnit === 'kg' && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </Pressable>
              </View>
            </View>

            {/* Distance Unit */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Distance Unit</Text>
              <View style={styles.optionGroup}>
                <Pressable
                  style={[styles.optionButton, distanceUnit === 'km' && styles.optionButtonActive]}
                  onPress={() => updateDistanceUnit('km')}
                >
                  <Text
                    style={[
                      styles.optionText,
                      distanceUnit === 'km' && styles.optionTextActive,
                    ]}
                  >
                    Kilometers (km)
                  </Text>
                  {distanceUnit === 'km' && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </Pressable>
                <Pressable
                  style={[styles.optionButton, distanceUnit === 'mi' && styles.optionButtonActive]}
                  onPress={() => updateDistanceUnit('mi')}
                >
                  <Text
                    style={[
                      styles.optionText,
                      distanceUnit === 'mi' && styles.optionTextActive,
                    ]}
                  >
                    Miles (mi)
                  </Text>
                  {distanceUnit === 'mi' && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </Pressable>
              </View>
            </View>

            {/* Rest Timer */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Default Rest Timer</Text>
              <View style={styles.timerGrid}>
                {restTimerOptions.map((seconds) => (
                  <Pressable
                    key={seconds}
                    style={[
                      styles.timerButton,
                      defaultRestTimer === seconds && styles.timerButtonActive,
                    ]}
                    onPress={() => updateRestTimer(seconds)}
                  >
                    <Text
                      style={[
                        styles.timerButtonText,
                        defaultRestTimer === seconds && styles.timerButtonTextActive,
                      ]}
                    >
                      {seconds}s
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Data */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Data</Text>
              <View style={styles.optionGroup}>
                <Pressable
                  style={styles.optionButton}
                  onPress={handleExport}
                  disabled={isExporting}
                >
                  <Text style={styles.optionText}>Export Data</Text>
                  {isExporting && <ActivityIndicator size="small" color={Colors.textSecondary} />}
                </Pressable>
              </View>
            </View>

            {/* About */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <View style={styles.optionGroup}>
                <Pressable style={styles.optionButton} onPress={openAbout}>
                  <Text style={styles.optionText}>About Liftio</Text>
                </Pressable>
              </View>
            </View>

            {/* Version */}
            <View style={styles.section}>
              <Text style={styles.versionLabel}>Version 1.0.0</Text>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <Button
              title="Close"
              onPress={onClose}
              style={styles.closeButtonFull}
            />
          </View>
        </View>

        {/* About slide-up panel */}
        {showAbout && (
          <>
            <Pressable style={styles.aboutBackdrop} onPress={closeAbout} />
            <Animated.View
              style={[styles.aboutPanel, { transform: [{ translateY: aboutTranslateY }] }]}
            >
              <View style={styles.aboutHandleContainer}>
                <View style={styles.aboutHandle} />
              </View>
              <View style={styles.aboutPanelHeader}>
                <Text style={styles.aboutPanelTitle}>About</Text>
                <Pressable onPress={closeAbout} hitSlop={8}>
                  <X size={22} color={Colors.textSecondary} />
                </Pressable>
              </View>
              <View style={styles.aboutPanelContent}>
                <Text style={styles.aboutSectionLabel}>Exercise Illustrations</Text>
                <Text style={styles.aboutBodyText}>Images © Everkinetic</Text>
                <Pressable onPress={() => Linking.openURL('https://github.com/everkinetic/data')}>
                  <Text style={styles.aboutLinkText}>github.com/everkinetic/data</Text>
                </Pressable>
                <View style={styles.aboutDivider} />
                <Text style={styles.aboutBodyText}>Licensed under CC BY-SA 3.0</Text>
                <Pressable onPress={() => Linking.openURL('https://creativecommons.org/licenses/by-sa/3.0/')}>
                  <Text style={styles.aboutLinkText}>creativecommons.org/licenses/by-sa/3.0</Text>
                </Pressable>
              </View>
            </Animated.View>
          </>
        )}
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: Colors.bgCard,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
    ...Shadows.elevated,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: Typography.fontSize.title,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  closeButton: {
    padding: Spacing.sm,
  },
  content: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  optionGroup: {
    gap: Spacing.sm,
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  optionButtonActive: {
    backgroundColor: Colors.highlight,
    borderColor: Colors.highlight,
  },
  optionText: {
    fontSize: Typography.fontSize.body,
    color: Colors.textSecondary,
  },
  optionTextActive: {
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeight.semibold,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: Colors.accentText,
    fontSize: 14,
    fontWeight: '600',
  },
  timerGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  timerButton: {
    flex: 1,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  timerButtonActive: {
    backgroundColor: Colors.highlight,
    borderColor: Colors.highlight,
  },
  timerButtonText: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
  },
  timerButtonTextActive: {
    color: Colors.textPrimary,
  },
  aboutBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  aboutPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.bgCard,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    ...Shadows.elevated,
  },
  aboutHandleContainer: {
    alignItems: 'center',
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  aboutHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.textTertiary,
  },
  aboutPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  aboutPanelTitle: {
    fontSize: Typography.fontSize.title,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  aboutPanelContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    gap: Spacing.xs,
  },
  aboutSectionLabel: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  aboutBodyText: {
    fontSize: Typography.fontSize.body,
    color: Colors.textSecondary,
  },
  aboutLinkText: {
    fontSize: Typography.fontSize.body,
    color: Colors.textSecondary,
    textDecorationLine: 'underline',
  },
  aboutDivider: {
    height: Spacing.sm,
  },
  versionLabel: {
    fontSize: Typography.fontSize.caption,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
  footer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  closeButtonFull: {
    width: '100%',
  },
});
