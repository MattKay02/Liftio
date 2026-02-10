import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { Colors, Typography, Spacing } from '@/constants';
import { Button } from '@/components/ui/Button';
import { WorkoutWithExercises } from '@/types/workout';
import { getWorkoutById, deleteWorkout } from '@/lib/database/queries/workouts';
import { useSettingsStore } from '@/lib/stores/settingsStore';
import { formatDate, formatDuration } from '@/lib/utils/date';
import { secondsToTimeDisplay } from '@/lib/utils/validation';
import { isCardioExercise } from '@/lib/database/queries/exerciseLibrary';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [workout, setWorkout] = useState<WorkoutWithExercises | null>(null);
  const weightUnit = useSettingsStore((s) => s.settings.weightUnit);

  useEffect(() => {
    if (id) {
      const data = getWorkoutById(id);
      setWorkout(data);
    }
  }, [id]);

  const handleDelete = () => {
    Alert.alert('Delete Workout?', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          if (id) {
            deleteWorkout(id);
            router.back();
          }
        },
      },
    ]);
  };

  if (!workout) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Button title="Back" onPress={() => router.back()} variant="text" />
          <Text style={styles.headerTitle}>{formatDate(workout.date)}</Text>
          <Button title="Delete" onPress={handleDelete} variant="destructive" />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
        >
          <Text style={styles.workoutName}>{workout.name}</Text>

          <View style={styles.metaRow}>
            {workout.duration && (
              <Text style={styles.metaText}>{formatDuration(workout.duration)}</Text>
            )}
            <Text style={styles.metaText}>
              {workout.exercises.length} exercises
            </Text>
          </View>

          {workout.notes && (
            <Text style={styles.notes}>{workout.notes}</Text>
          )}

          {workout.exercises.map((exercise) => {
            const isCardio = isCardioExercise(exercise.exerciseName);
            return (
              <View key={exercise.id} style={styles.exerciseSection}>
                <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
                <View style={styles.setsTable}>
                  <View style={styles.setsHeaderRow}>
                    <Text style={[styles.setsHeaderText, styles.setNumCol]}>Set</Text>
                    {isCardio ? (
                      <Text style={[styles.setsHeaderText, styles.durationCol]}>Duration</Text>
                    ) : (
                      <>
                        <Text style={[styles.setsHeaderText, styles.repsCol]}>Reps</Text>
                        <Text style={[styles.setsHeaderText, styles.weightCol]}>
                          Weight ({weightUnit})
                        </Text>
                      </>
                    )}
                  </View>
                  {exercise.sets.map((set, i) => (
                    <View key={set.id} style={styles.setRow}>
                      <Text style={[styles.setText, styles.setNumCol]}>{i + 1}</Text>
                      {isCardio ? (
                        <Text style={[styles.setText, styles.durationCol]}>
                          {secondsToTimeDisplay(set.duration)}
                        </Text>
                      ) : (
                        <>
                          <Text style={[styles.setText, styles.repsCol]}>{set.reps}</Text>
                          <Text style={[styles.setText, styles.weightCol]}>{set.weight}</Text>
                        </>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: Typography.fontSize.body,
    color: Colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  loadingText: {
    fontSize: Typography.fontSize.body,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.xxl,
  },
  workoutName: {
    fontSize: Typography.fontSize.display,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  metaText: {
    fontSize: Typography.fontSize.body,
    color: Colors.textTertiary,
  },
  notes: {
    fontSize: Typography.fontSize.body,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeight.body,
    marginBottom: Spacing.lg,
    fontStyle: 'italic',
  },
  exerciseSection: {
    marginBottom: Spacing.lg,
  },
  exerciseName: {
    fontSize: Typography.fontSize.bodyLg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  setsTable: {},
  setsHeaderRow: {
    flexDirection: 'row',
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  setsHeaderText: {
    fontSize: Typography.fontSize.caption,
    color: Colors.textTertiary,
    fontWeight: Typography.fontWeight.semibold,
  },
  setRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  setText: {
    fontSize: Typography.fontSize.body,
    color: Colors.textPrimary,
  },
  setNumCol: {
    flex: 0.5,
    textAlign: 'center',
  },
  repsCol: {
    flex: 1,
    textAlign: 'center',
  },
  weightCol: {
    flex: 1,
    textAlign: 'center',
  },
  durationCol: {
    flex: 2,
    textAlign: 'center',
  },
});
