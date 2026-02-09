import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, SafeAreaView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, Typography, Spacing } from '@/constants';
import { Header } from '@/components/shared/Header';
import { CalendarView } from '@/components/shared/CalendarView';
import { WorkoutDetailSlideUp } from '@/components/shared/WorkoutDetailSlideUp';
import { SettingsMenu } from '@/components/shared/SettingsMenu';
import { WorkoutWithExercises } from '@/types/workout';
import { getAllWorkouts, getCompletedWorkouts } from '@/lib/database/queries/workouts';
import { getTimeSinceString, formatDuration } from '@/lib/utils/date';
import { Pencil } from 'lucide-react-native';

export default function LogsScreen() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [workouts, setWorkouts] = useState<(WorkoutWithExercises & { date: number })[]>([]);
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutWithExercises[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutWithExercises | null>(null);
  const [showDetailSlideUp, setShowDetailSlideUp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadWorkouts();
    }, [])
  );

  const loadWorkouts = () => {
    try {
      const allWorkouts = getAllWorkouts();
      setWorkouts(allWorkouts);
      setRecentWorkouts(getCompletedWorkouts(20));
    } catch (error) {
      console.error('Failed to load workouts:', error);
    }
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    const dateKey = date.toDateString();
    const workoutsForDate = workouts.filter(
      (w) => new Date(w.date).toDateString() === dateKey
    );

    if (workoutsForDate.length > 0) {
      setSelectedWorkout(workoutsForDate[0]);
      setShowDetailSlideUp(true);
    }
  };

  const handleStartFromWorkout = (workout: WorkoutWithExercises) => {
    router.push({
      pathname: '/workout/active',
      params: { templateId: workout.id },
    });
  };

  const handleEditWorkout = (workout: WorkoutWithExercises) => {
    router.push(`/workout/${workout.id}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header showSettings={true} onSettingsPress={() => setShowSettings(true)} />

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <CalendarView
          workouts={workouts}
          onSelectDate={handleSelectDate}
          selectedDate={selectedDate}
        />

        {recentWorkouts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Recent</Text>
            {recentWorkouts.map((workout) => (
              <Pressable
                key={workout.id}
                style={({ pressed }) => [
                  styles.workoutCard,
                  pressed && styles.workoutCardPressed,
                ]}
                onPress={() => handleStartFromWorkout(workout)}
              >
                <View style={styles.workoutCardContent}>
                  <Text style={styles.workoutName}>{workout.name}</Text>
                  <Text style={styles.workoutMeta}>
                    {workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''}
                    {workout.duration ? ` \u00B7 ${formatDuration(workout.duration)}` : ''}
                  </Text>
                  <Text style={styles.workoutDate}>
                    {getTimeSinceString(workout.date)}
                  </Text>
                </View>
                <Pressable
                  style={({ pressed }) => [
                    styles.editButton,
                    pressed && styles.editButtonPressed,
                  ]}
                  onPress={() => handleEditWorkout(workout)}
                  hitSlop={8}
                >
                  <Pencil size={16} color={Colors.textSecondary} />
                </Pressable>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      <WorkoutDetailSlideUp
        visible={showDetailSlideUp}
        workout={selectedWorkout}
        onClose={() => setShowDetailSlideUp(false)}
      />

      <SettingsMenu
        visible={showSettings}
        onClose={() => setShowSettings(false)}
      />
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
  content: {
    paddingBottom: Spacing.xl,
  },
  section: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  sectionLabel: {
    fontSize: Typography.fontSize.caption,
    color: Colors.textTertiary,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  workoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  workoutCardPressed: {
    opacity: 0.7,
  },
  workoutCardContent: {
    flex: 1,
  },
  workoutName: {
    fontSize: Typography.fontSize.bodyLg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  workoutMeta: {
    fontSize: Typography.fontSize.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  workoutDate: {
    fontSize: Typography.fontSize.caption,
    color: Colors.textTertiary,
  },
  editButton: {
    padding: Spacing.sm,
    borderRadius: 8,
    backgroundColor: Colors.bgElevated,
  },
  editButtonPressed: {
    opacity: 0.6,
  },
});
