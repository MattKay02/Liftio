import { View, Text, StyleSheet, Alert } from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import DraggableFlatList, { ScaleDecorator, RenderItemParams } from 'react-native-draggable-flatlist';
import { useWorkoutStore } from '@/lib/stores/workoutStore';
import { useSettingsStore } from '@/lib/stores/settingsStore';
import { getWorkoutById } from '@/lib/database/queries/workouts';
import { ExerciseCard } from '@/components/workout/ExerciseCard';
import { Button } from '@/components/ui/Button';
import { Colors, Spacing, Typography } from '@/constants';
import { formatDurationWithSeconds, formatWeight } from '@/lib/utils/date';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MAX_EXERCISES_PER_WORKOUT } from '@/lib/utils/validation';
import { ExerciseWithSets } from '@/types/workout';

export default function ActiveWorkoutScreen() {
  const params = useLocalSearchParams<{ templateId?: string }>();
  const {
    activeWorkout,
    isWorkoutActive,
    workoutStartTime,
    startWorkout,
    cancelWorkout,
    reorderExercises,
  } = useWorkoutStore();

  const { settings } = useSettingsStore();

  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { totalSets, totalReps, totalWeight } = useMemo(() => {
    if (!activeWorkout) return { totalSets: 0, totalReps: 0, totalWeight: 0 };
    let sets = 0;
    let reps = 0;
    let weight = 0;
    for (const exercise of activeWorkout.exercises) {
      for (const set of exercise.sets) {
        if (!set.isCompleted) continue;
        sets += 1;
        reps += set.reps;
        weight += set.reps * set.weight;
      }
    }
    return { totalSets: sets, totalReps: reps, totalWeight: weight };
  }, [activeWorkout]);

  useEffect(() => {
    if (!isWorkoutActive) {
      const templateId = params.templateId;
      if (templateId) {
        const template = getWorkoutById(templateId);
        if (template) {
          startWorkout(template.name, template);
        } else {
          startWorkout('Workout');
        }
      } else {
        startWorkout('Workout');
      }
    }
  }, []);

  useEffect(() => {
    if (workoutStartTime) {
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - workoutStartTime) / 1000));
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [workoutStartTime]);

  const hasBeenActiveRef = useRef(false);
  useEffect(() => {
    if (isWorkoutActive) hasBeenActiveRef.current = true;
  }, [isWorkoutActive]);

  useFocusEffect(
    useCallback(() => {
      if (!isWorkoutActive && hasBeenActiveRef.current) {
        router.back();
      }
    }, [isWorkoutActive])
  );

  const handleCancel = () => {
    Alert.alert('Cancel Workout?', 'Are you sure you want to cancel this workout?', [
      { text: 'Keep Going', style: 'cancel' },
      {
        text: 'Cancel Workout',
        style: 'destructive',
        onPress: () => {
          cancelWorkout();
          router.back();
        },
      },
    ]);
  };

  const handleFinish = () => {
    router.push('/workout/finish');
  };

  const handleAddExercise = () => {
    if (activeWorkout && activeWorkout.exercises.length >= MAX_EXERCISES_PER_WORKOUT) {
      Alert.alert(
        'Exercise Limit',
        `Maximum ${MAX_EXERCISES_PER_WORKOUT} exercises per workout.`
      );
      return;
    }
    router.push('/workout/add-exercise');
  };

  const renderExerciseItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<ExerciseWithSets>) => (
      <ScaleDecorator>
        <ExerciseCard exercise={item} onLongPress={drag} isBeingDragged={isActive} />
      </ScaleDecorator>
    ),
    []
  );

  if (!activeWorkout) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Button title="Back" onPress={() => router.back()} variant="text" />
          <Text style={styles.workoutName}>{activeWorkout.name}</Text>
          <Button title="Finish" onPress={handleFinish} variant="text" />
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatDurationWithSeconds(elapsed)}</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalSets}</Text>
            <Text style={styles.statLabel}>Sets</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalReps}</Text>
            <Text style={styles.statLabel}>Reps</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>{formatWeight(totalWeight, settings.weightUnit)}</Text>
            <Text style={styles.statLabel}>Volume</Text>
          </View>
        </View>

        <DraggableFlatList
          data={activeWorkout.exercises}
          keyExtractor={(item) => item.id}
          renderItem={renderExerciseItem}
          onDragEnd={({ from, to }) => reorderExercises(from, to)}
          containerStyle={styles.content}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
          ListFooterComponent={
            <View>
              <Button
                title="+ Add Exercise"
                onPress={handleAddExercise}
                variant="secondary"
                style={styles.addButton}
              />
              <Button
                title="Cancel Workout"
                onPress={handleCancel}
                variant="destructive"
                style={styles.cancelButton}
              />
            </View>
          }
        />
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  workoutName: {
    fontSize: Typography.fontSize.bodyLg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: Typography.fontSize.bodyLg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: Typography.fontSize.caption,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    height: 24,
    backgroundColor: Colors.border,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  addButton: {
    marginTop: Spacing.sm,
  },
  cancelButton: {
    marginTop: Spacing.xl,
  },
});
