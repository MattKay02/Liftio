import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import { useWorkoutStore } from '@/lib/stores/workoutStore';
import { getWorkoutById } from '@/lib/database/queries/workouts';
import { ExerciseCard } from '@/components/workout/ExerciseCard';
import { Button } from '@/components/ui/Button';
import { Colors, Spacing, Typography } from '@/constants';
import { formatDuration } from '@/lib/utils/date';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ActiveWorkoutScreen() {
  const params = useLocalSearchParams<{ templateId?: string }>();
  const {
    activeWorkout,
    isWorkoutActive,
    workoutStartTime,
    startWorkout,
    cancelWorkout,
  } = useWorkoutStore();

  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
    router.push('/workout/add-exercise');
  };

  if (!activeWorkout) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Button title="Cancel" onPress={handleCancel} variant="text" />
          <View style={styles.headerCenter}>
            <Text style={styles.workoutName}>{activeWorkout.name}</Text>
            <Text style={styles.timer}>{formatDuration(elapsed)}</Text>
          </View>
          <Button title="Finish" onPress={handleFinish} variant="text" />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          {activeWorkout.exercises.map((exercise) => (
            <ExerciseCard key={exercise.id} exercise={exercise} />
          ))}

          <Button
            title="+ Add Exercise"
            onPress={handleAddExercise}
            variant="secondary"
            style={styles.addButton}
          />
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
  headerCenter: {
    alignItems: 'center',
  },
  workoutName: {
    fontSize: Typography.fontSize.bodyLg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  timer: {
    fontSize: Typography.fontSize.caption,
    color: Colors.textSecondary,
    marginTop: 2,
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
});
