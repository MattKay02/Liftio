import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, Typography, Spacing, Shadows } from '@/constants';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { Header } from '@/components/shared/Header';
import { CalendarView } from '@/components/shared/CalendarView';
import { WorkoutDetailSlideUp } from '@/components/shared/WorkoutDetailSlideUp';
import { AllWorkoutsSlideUp } from '@/components/shared/AllWorkoutsSlideUp';
import { SettingsMenu } from '@/components/shared/SettingsMenu';
import { WorkoutWithExercises } from '@/types/workout';
import { getAllWorkouts, getCompletedWorkouts } from '@/lib/database/queries/workouts';
import { getTimeSinceString, formatDuration, formatTimeOfDay, getTotalWeight, formatWeight } from '@/lib/utils/date';
import { useSettingsStore } from '@/lib/stores/settingsStore';
import { Pencil, ChevronDown, ChevronUp } from 'lucide-react-native';
import { ExerciseStatsSection } from '@/components/stats/ExerciseStatsSection';
import { YearActivityGrid } from '@/components/shared/YearActivityGrid';

export default function LogsScreen() {
  const weightUnit = useSettingsStore((s) => s.settings.weightUnit);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [workouts, setWorkouts] = useState<(WorkoutWithExercises & { date: number })[]>([]);
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutWithExercises[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutWithExercises | null>(null);
  const [showDetailSlideUp, setShowDetailSlideUp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAllWorkouts, setShowAllWorkouts] = useState(false);
  const [allCompletedWorkouts, setAllCompletedWorkouts] = useState<WorkoutWithExercises[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadWorkouts();
    }, [])
  );

  const loadWorkouts = () => {
    try {
      const allWorkouts = getAllWorkouts();
      setWorkouts(allWorkouts);
      setRecentWorkouts(getCompletedWorkouts(6));
      setAllCompletedWorkouts(getCompletedWorkouts(1000));
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

  const handleViewWorkout = (workout: WorkoutWithExercises) => {
    router.push(`/workout/${workout.id}`);
  };

  const handleEditWorkout = (workout: WorkoutWithExercises) => {
    router.push(`/workout/${workout.id}?edit=true`);
  };

  return (
    <View style={styles.safeArea}>
      <Header showSettings={true} onSettingsPress={() => setShowSettings(true)} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        decelerationRate="fast"
      >
        <YearActivityGrid workouts={workouts} />

        <CalendarView
          workouts={workouts}
          onSelectDate={handleSelectDate}
          selectedDate={selectedDate}
        />

        {recentWorkouts.length > 0 && (
          <View style={styles.section}>
            <Pressable
              style={styles.sectionHeader}
              onPress={() => setIsExpanded(!isExpanded)}
            >
              <Text style={styles.sectionLabel}>Recent</Text>
              {recentWorkouts.length > 1 && (
                isExpanded ? (
                  <ChevronUp size={16} color={Colors.textTertiary} />
                ) : (
                  <ChevronDown size={16} color={Colors.textTertiary} />
                )
              )}
            </Pressable>
            {(isExpanded ? recentWorkouts : recentWorkouts.slice(0, 1)).map((workout, index) => (
              <Animated.View
                key={workout.id}
                entering={FadeInDown.delay(index * 60).duration(300)}
              >
                <AnimatedPressable
                  scaleValue={0.98}
                  style={styles.workoutCard}
                  onPress={() => handleViewWorkout(workout)}
                >
                  <View style={styles.workoutCardContent}>
                    <Text style={styles.workoutName}>{workout.name}</Text>
                    <Text style={styles.workoutMeta} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
                      {workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''}
                      {workout.duration ? ` \u00B7 ${formatDuration(workout.duration)}` : ''}
                      {getTotalWeight(workout.exercises) > 0 ? ` \u00B7 ${formatWeight(getTotalWeight(workout.exercises), weightUnit)}` : ''}
                    </Text>
                    <Text style={styles.workoutDate}>
                      {getTimeSinceString(workout.date)} {'\u00B7'} {formatTimeOfDay(workout.date)}
                    </Text>
                  </View>
                  <AnimatedPressable
                    scaleValue={0.9}
                    style={styles.editButton}
                    onPress={() => handleEditWorkout(workout)}
                    hitSlop={8}
                  >
                    <Pencil size={16} color={Colors.textSecondary} />
                  </AnimatedPressable>
                </AnimatedPressable>
              </Animated.View>
            ))}
            {isExpanded && allCompletedWorkouts.length > 6 && (
              <AnimatedPressable
                scaleValue={0.98}
                style={styles.viewAllButton}
                onPress={() => setShowAllWorkouts(true)}
              >
                <Text style={styles.viewAllText}>View All Workouts</Text>
              </AnimatedPressable>
            )}
          </View>
        )}

        <View style={styles.statsSection}>
          <ExerciseStatsSection />
        </View>
      </ScrollView>

      <WorkoutDetailSlideUp
        visible={showDetailSlideUp}
        workout={selectedWorkout}
        onClose={() => setShowDetailSlideUp(false)}
      />

      <AllWorkoutsSlideUp
        visible={showAllWorkouts}
        workouts={allCompletedWorkouts}
        onClose={() => setShowAllWorkouts(false)}
        onViewWorkout={handleViewWorkout}
        onEditWorkout={handleEditWorkout}
      />

      <SettingsMenu
        visible={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </View>
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
    paddingBottom: 100,
  },
  section: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionLabel: {
    fontSize: Typography.fontSize.caption,
    color: Colors.textTertiary,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    ...Shadows.card,
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
  viewAllButton: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    marginTop: Spacing.xs,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
  },
  viewAllText: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
  },
  statsSection: {
    paddingHorizontal: Spacing.md,
  },
});
