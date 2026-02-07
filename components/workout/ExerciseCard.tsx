import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ExerciseWithSets } from '@/types/workout';
import { SetRow } from './SetRow';
import { useWorkoutStore } from '@/lib/stores/workoutStore';
import { Colors, Spacing, Typography } from '@/constants';

interface ExerciseCardProps {
  exercise: ExerciseWithSets;
}

export const ExerciseCard = ({ exercise }: ExerciseCardProps) => {
  const { removeExercise, addSet } = useWorkoutStore();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
        <Pressable
          onPress={() => removeExercise(exercise.id)}
          hitSlop={8}
        >
          <Text style={styles.removeButton}>✕</Text>
        </Pressable>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.headerText, styles.setCol]}>Set</Text>
          <Text style={[styles.headerText, styles.prevCol]}>Previous</Text>
          <Text style={[styles.headerText, styles.repsCol]}>Reps</Text>
          <Text style={[styles.headerText, styles.weightCol]}>Weight</Text>
          <Text style={[styles.headerText, styles.checkCol]}></Text>
        </View>

        {exercise.sets.map((set, index) => (
          <SetRow
            key={set.id}
            set={set}
            setNumber={index + 1}
            exerciseId={exercise.id}
            exerciseName={exercise.exerciseName}
          />
        ))}
      </View>

      <Pressable style={styles.addSetButton} onPress={() => addSet(exercise.id)}>
        <Text style={styles.addSetText}>+ Add Set</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.grey50,
    borderWidth: 1,
    borderColor: Colors.grey200,
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
    color: Colors.grey900,
    flex: 1,
  },
  removeButton: {
    fontSize: 18,
    color: Colors.grey400,
    paddingLeft: Spacing.sm,
  },
  table: {
    marginTop: Spacing.sm,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey200,
  },
  headerText: {
    fontSize: Typography.fontSize.caption,
    color: Colors.grey400,
    textAlign: 'center',
  },
  setCol: { flex: 0.5 },
  prevCol: { flex: 1.5 },
  repsCol: { flex: 1 },
  weightCol: { flex: 1.2 },
  checkCol: { flex: 0.5 },
  addSetButton: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    marginTop: Spacing.sm,
  },
  addSetText: {
    fontSize: Typography.fontSize.body,
    color: Colors.grey600,
  },
});
