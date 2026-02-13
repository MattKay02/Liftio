import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { Colors, Spacing, Typography, Shadows } from '@/constants';
import { ExerciseFrequencyRow } from '@/lib/database/queries/exerciseStats';

interface MoreExercisesDropdownProps {
  exercises: ExerciseFrequencyRow[];
  expanded: boolean;
  onToggleExpand: () => void;
  onPressExercise: (exerciseName: string) => void;
}

export const MoreExercisesDropdown = React.memo(
  ({ exercises, expanded, onToggleExpand, onPressExercise }: MoreExercisesDropdownProps) => {
    if (exercises.length === 0) return null;

    return (
      <View style={styles.container}>
        <Pressable style={styles.header} onPress={onToggleExpand}>
          <Text style={styles.headerText}>More Exercises</Text>
          {expanded ? (
            <ChevronUp size={16} color={Colors.textTertiary} />
          ) : (
            <ChevronDown size={16} color={Colors.textTertiary} />
          )}
        </Pressable>

        {expanded && exercises.map((exercise) => (
          <AnimatedPressable
            key={exercise.exerciseName}
            scaleValue={0.98}
            style={styles.card}
            onPress={() => onPressExercise(exercise.exerciseName)}
          >
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
    marginTop: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  headerText: {
    fontSize: Typography.fontSize.caption,
    color: Colors.textTertiary,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  info: {
    flex: 1,
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
