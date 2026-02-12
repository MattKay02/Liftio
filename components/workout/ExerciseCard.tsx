import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useMemo, useState } from 'react';
import { ExerciseWithSets, CardioMode, CARDIO_MODE_LABELS } from '@/types/workout';
import { SetRow } from './SetRow';
import { CardioSetRow } from './CardioSetRow';
import { CardioModePicker } from './CardioModePicker';
import { useWorkoutStore } from '@/lib/stores/workoutStore';
import { useSettingsStore } from '@/lib/stores/settingsStore';
import { Colors, Spacing, Typography, Shadows } from '@/constants';
import { MAX_SETS_PER_EXERCISE } from '@/lib/utils/validation';
import { isCardioExercise } from '@/lib/database/queries/exerciseLibrary';

interface ExerciseCardProps {
  exercise: ExerciseWithSets;
  readonly?: boolean;
  onLongPress?: () => void;
  isBeingDragged?: boolean;
}

export const ExerciseCard = ({ exercise, readonly = false, onLongPress, isBeingDragged }: ExerciseCardProps) => {
  const { removeExercise, addSet, updateCardioMode } = useWorkoutStore();
  const distanceUnit = useSettingsStore((s) => s.settings.distanceUnit);
  const isCardio = useMemo(() => isCardioExercise(exercise.exerciseName), [exercise.exerciseName]);
  const [pickerVisible, setPickerVisible] = useState(false);

  // For cardio exercises, default to 'time' if cardioMode is null (backward compat)
  const cardioMode: CardioMode = exercise.cardioMode ?? 'time';

  const showTime = cardioMode === 'time' || cardioMode === 'time_distance' || cardioMode === 'time_reps';
  const showDistance = cardioMode === 'distance' || cardioMode === 'time_distance';
  const showReps = cardioMode === 'reps' || cardioMode === 'time_reps';

  // Build dynamic header columns for cardio
  const cardioHeaders: { label: string; flex: number }[] = [];
  if (isCardio) {
    const fieldCount = [showTime, showDistance, showReps].filter(Boolean).length;
    const fieldFlex = fieldCount === 1 ? 2 : 1.2;
    if (showTime) cardioHeaders.push({ label: 'Duration', flex: fieldFlex });
    if (showDistance) cardioHeaders.push({ label: `Dist (${distanceUnit})`, flex: fieldFlex });
    if (showReps) cardioHeaders.push({ label: 'Reps', flex: fieldFlex });
  }

  return (
    <Pressable
      onLongPress={onLongPress}
      style={[styles.card, isBeingDragged && styles.cardDragging]}
    >
      <View style={styles.header}>
        <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
        {!readonly && (
          <Pressable
            onPress={() => removeExercise(exercise.id)}
            hitSlop={8}
          >
            <Text style={styles.removeButton}>✕</Text>
          </Pressable>
        )}
      </View>

      {/* Edit Units button for cardio exercises in active (non-readonly) mode */}
      {isCardio && !readonly && (
        <Pressable style={styles.editUnitsButton} onPress={() => setPickerVisible(true)}>
          <Text style={styles.editUnitsText}>
            {CARDIO_MODE_LABELS[cardioMode]}
          </Text>
          <Text style={styles.editUnitsChevron}>Edit Units</Text>
        </Pressable>
      )}

      {/* Mode picker bottom sheet */}
      {isCardio && !readonly && (
        <CardioModePicker
          visible={pickerVisible}
          currentMode={cardioMode}
          onSelect={(mode) => updateCardioMode(exercise.id, mode)}
          onClose={() => setPickerVisible(false)}
        />
      )}

      <View style={styles.table}>
        {isCardio ? (
          <>
            <View style={styles.tableHeader}>
              <Text style={[styles.headerText, styles.setCol]}>Set</Text>
              <Text style={[styles.headerText, styles.prevCol]}>Previous</Text>
              {cardioHeaders.map((h) => (
                <Text key={h.label} style={[styles.headerText, { flex: h.flex }]}>{h.label}</Text>
              ))}
              <Text style={[styles.headerText, styles.checkCol]}></Text>
            </View>

            {exercise.sets.map((set, index) => (
              <CardioSetRow
                key={set.id}
                set={set}
                setNumber={index + 1}
                exerciseId={exercise.id}
                exerciseName={exercise.exerciseName}
                cardioMode={cardioMode}
                distanceUnit={distanceUnit}
                readonly={readonly}
              />
            ))}
          </>
        ) : (
          <>
            <View style={styles.tableHeader}>
              <Text style={[styles.headerText, styles.setCol]}>Set</Text>
              <Text style={[styles.headerText, styles.prevCol]}>Previous</Text>
              <Text style={[styles.headerText, styles.weightCol]}>Weight</Text>
              <Text style={[styles.headerText, styles.repsCol]}>Reps</Text>
              <Text style={[styles.headerText, styles.checkCol]}></Text>
            </View>

            {exercise.sets.map((set, index) => (
              <SetRow
                key={set.id}
                set={set}
                setNumber={index + 1}
                exerciseId={exercise.id}
                exerciseName={exercise.exerciseName}
                readonly={readonly}
              />
            ))}
          </>
        )}
      </View>

      {!readonly && exercise.sets.length < MAX_SETS_PER_EXERCISE && (
        <Pressable style={styles.addSetButton} onPress={() => addSet(exercise.id)}>
          <Text style={styles.addSetText}>+ Add Set</Text>
        </Pressable>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  cardDragging: {
    opacity: 0.9,
    borderColor: Colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  exerciseName: {
    fontSize: Typography.fontSize.title,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    flex: 1,
  },
  removeButton: {
    fontSize: 18,
    color: Colors.textSecondary,
    paddingLeft: Spacing.sm,
  },
  editUnitsButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.xs + 2,
    marginBottom: Spacing.sm,
  },
  editUnitsText: {
    fontSize: Typography.fontSize.caption,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeight.semibold,
  },
  editUnitsChevron: {
    fontSize: Typography.fontSize.caption,
    color: Colors.textTertiary,
  },
  table: {
    marginTop: Spacing.sm,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerText: {
    fontSize: Typography.fontSize.caption,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  setCol: { flex: 0.5 },
  prevCol: { flex: 1.5 },
  repsCol: { flex: 1 },
  weightCol: { flex: 1.2 },
  checkCol: { flex: 0.6 },
  addSetButton: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    marginTop: Spacing.sm,
  },
  addSetText: {
    fontSize: Typography.fontSize.body,
    color: Colors.textSecondary,
  },
});
