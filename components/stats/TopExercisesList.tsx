import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { Colors, Spacing, Typography, Shadows } from '@/constants';
import { ExerciseFrequencyRow } from '@/lib/database/queries/exerciseStats';

interface TopExercisesListProps {
  exercises: ExerciseFrequencyRow[];
  onPressExercise: (exerciseName: string) => void;
}

export const TopExercisesList = React.memo(
  ({ exercises, onPressExercise }: TopExercisesListProps) => {
    if (exercises.length === 0) return null;

    return (
      <View style={styles.container}>
        <Text style={styles.sectionLabel}>Top Exercises</Text>
        {exercises.map((exercise, index) => (
          <AnimatedPressable
            key={exercise.exerciseName}
            scaleValue={0.98}
            style={styles.card}
            onPress={() => onPressExercise(exercise.exerciseName)}
          >
            <Text style={styles.rank}>{index + 1}</Text>
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={1}>{exercise.exerciseName}</Text>
              <Text style={styles.count}>
                {exercise.workoutCount} workout{exercise.workoutCount !== 1 ? 's' : ''}
              </Text>
            </View>
          </AnimatedPressable>
        ))}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.lg,
  },
  sectionLabel: {
    fontSize: Typography.fontSize.caption,
    color: Colors.textTertiary,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.card,
  },
  rank: {
    fontSize: Typography.fontSize.bodyLg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textTertiary,
    width: 28,
    textAlign: 'center',
  },
  info: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  name: {
    fontSize: Typography.fontSize.bodyLg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  count: {
    fontSize: Typography.fontSize.caption,
    color: Colors.textSecondary,
  },
});
