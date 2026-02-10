import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useMemo } from 'react';
import { ExerciseWithSets } from '@/types/workout';
import { SetRow } from './SetRow';
import { CardioSetRow } from './CardioSetRow';
import { useWorkoutStore } from '@/lib/stores/workoutStore';
import { Colors, Spacing, Typography } from '@/constants';
import { MAX_SETS_PER_EXERCISE } from '@/lib/utils/validation';
import { isCardioExercise } from '@/lib/database/queries/exerciseLibrary';

interface ExerciseCardProps {
  exercise: ExerciseWithSets;
  readonly?: boolean;
}

export const ExerciseCard = ({ exercise, readonly = false }: ExerciseCardProps) => {
  const { removeExercise, addSet } = useWorkoutStore();
  const isCardio = useMemo(() => isCardioExercise(exercise.exerciseName), [exercise.exerciseName]);

  return (
    <View style={styles.card}>
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

      <View style={styles.table}>
        {isCardio ? (
          <>
            <View style={styles.tableHeader}>
              <Text style={[styles.headerText, styles.setCol]}>Set</Text>
              <Text style={[styles.headerText, styles.prevCol]}>Previous</Text>
              <Text style={[styles.headerText, styles.durationCol]}>Duration</Text>
              <Text style={[styles.headerText, styles.checkCol]}></Text>
              <Text style={[styles.headerText, styles.removeHeaderCol]}>✕</Text>
            </View>

            {exercise.sets.map((set, index) => (
              <CardioSetRow
                key={set.id}
                set={set}
                setNumber={index + 1}
                exerciseId={exercise.id}
                exerciseName={exercise.exerciseName}
                readonly={readonly}
              />
            ))}
          </>
        ) : (
          <>
            <View style={styles.tableHeader}>
              <Text style={[styles.headerText, styles.setCol]}>Set</Text>
              <Text style={[styles.headerText, styles.prevCol]}>Previous</Text>
              <Text style={[styles.headerText, styles.repsCol]}>Reps</Text>
              <Text style={[styles.headerText, styles.weightCol]}>Weight</Text>
              <Text style={[styles.headerText, styles.checkCol]}></Text>
              <Text style={[styles.headerText, styles.removeHeaderCol]}>✕</Text>
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
    </View>
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
  durationCol: { flex: 2 },
  checkCol: { flex: 0.5 },
  removeHeaderCol: { flex: 0.4, textAlign: 'center' },
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
