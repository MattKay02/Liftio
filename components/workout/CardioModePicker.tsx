import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { X } from 'lucide-react-native';
import { CardioMode, CARDIO_MODE_LABELS } from '@/types/workout';
import { Colors, Spacing, Typography } from '@/constants';

const CARDIO_MODES: CardioMode[] = ['time', 'time_distance', 'time_reps', 'distance', 'reps'];

const MODE_DESCRIPTIONS: Record<CardioMode, string> = {
  time: 'Duration only (e.g. StairMaster, Elliptical)',
  time_distance: 'Duration + Distance (e.g. Running, Cycling)',
  time_reps: 'Duration + Reps (e.g. Jump Rope, Battle Ropes)',
  distance: 'Distance only (e.g. Walking, Swimming)',
  reps: 'Reps only (e.g. Box Jumps, Burpees)',
};

interface CardioModePickerProps {
  visible: boolean;
  currentMode: CardioMode;
  onSelect: (mode: CardioMode) => void;
  onClose: () => void;
}

export const CardioModePicker = ({ visible, currentMode, onSelect, onClose }: CardioModePickerProps) => {
  const handleSelect = (mode: CardioMode) => {
    onSelect(mode);
    onClose();
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
          style={styles.container}
          onStartShouldSetResponder={() => true}
          onTouchEndCapture={() => {}}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Tracking Mode</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <X size={24} color={Colors.textSecondary} />
            </Pressable>
          </View>

          {/* Options */}
          <View style={styles.content}>
            {CARDIO_MODES.map((mode) => (
              <Pressable
                key={mode}
                style={[styles.optionButton, currentMode === mode && styles.optionButtonActive]}
                onPress={() => handleSelect(mode)}
              >
                <View style={styles.optionTextContainer}>
                  <Text style={[styles.optionLabel, currentMode === mode && styles.optionLabelActive]}>
                    {CARDIO_MODE_LABELS[mode]}
                  </Text>
                  <Text style={styles.optionDescription}>
                    {MODE_DESCRIPTIONS[mode]}
                  </Text>
                </View>
                {currentMode === mode && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </View>
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
  container: {
    backgroundColor: Colors.bgCard,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
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
    paddingVertical: Spacing.sm + 2,
  },
  optionButtonActive: {
    backgroundColor: Colors.highlight,
    borderColor: Colors.highlight,
  },
  optionTextContainer: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  optionLabel: {
    fontSize: Typography.fontSize.body,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.semibold,
  },
  optionLabelActive: {
    color: Colors.textPrimary,
  },
  optionDescription: {
    fontSize: Typography.fontSize.caption,
    color: Colors.textTertiary,
    marginTop: 2,
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
});
