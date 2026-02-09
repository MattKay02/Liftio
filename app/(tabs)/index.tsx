import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, Typography, Spacing } from '@/constants';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/shared/Header';
import { WorkoutWithExercises } from '@/types/workout';
import { getRecentTemplates } from '@/lib/database/queries/workouts';
import { useWorkoutStore } from '@/lib/stores/workoutStore';
import { getTimeSinceString, formatDuration } from '@/lib/utils/date';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutWithExercises[]>([]);
  const { isWorkoutActive } = useWorkoutStore();

  useFocusEffect(
    useCallback(() => {
      const templates = getRecentTemplates(5);
      setRecentWorkouts(templates);
    }, [])
  );

  const handleStartWorkout = () => {
    router.push('/workout/active');
  };

  const handleResumeWorkout = () => {
    router.push('/workout/active');
  };

  const handleStartFromTemplate = (template: WorkoutWithExercises) => {
    router.push({
      pathname: '/workout/active',
      params: { templateId: template.id },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header showSettings={false} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {isWorkoutActive ? (
          <Button
            title="RESUME WORKOUT"
            onPress={handleResumeWorkout}
            style={styles.startButton}
          />
        ) : (
          <Button
            title="START WORKOUT"
            onPress={handleStartWorkout}
            style={styles.startButton}
          />
        )}

        {recentWorkouts.length > 0 && (
          <View style={styles.templatesSection}>
            <Text style={styles.sectionLabel}>My Workouts</Text>
            {recentWorkouts.map((workout) => (
              <View key={workout.id} style={styles.templateCardContainer}>
                <View style={styles.templateCardContent}>
                  <Text style={styles.templateName}>{workout.name}</Text>
                  <Text style={styles.templateMeta}>
                    {workout.exercises.length} exercises
                    {workout.duration ? ` \u00B7 ${formatDuration(workout.duration)}` : ''}
                  </Text>
                  <Text style={styles.templateDate}>
                    Last: {getTimeSinceString(workout.date)}
                  </Text>
                </View>
                <Pressable
                  style={styles.startButton2}
                  onPress={() => handleStartFromTemplate(workout)}
                >
                  <Text style={styles.startButtonText}>Start</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {recentWorkouts.length === 0 && (
          <View style={styles.emptySection}>
            <Text style={styles.emptyText}>
              No templates yet
            </Text>
            <Text style={styles.emptySubtext}>
              Create one by saving a workout
            </Text>
          </View>
        )}
      </ScrollView>
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
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  startButton: {
    marginTop: Spacing.lg,
    marginHorizontal: 0,
    height: 56,
    backgroundColor: Colors.accent,
  },
  templatesSection: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    fontSize: Typography.fontSize.caption,
    color: Colors.textTertiary,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  templateCardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  templateCardContent: {
    flex: 1,
  },
  templateName: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  templateMeta: {
    fontSize: Typography.fontSize.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  templateDate: {
    fontSize: Typography.fontSize.caption,
    color: Colors.textTertiary,
  },
  startButton2: {
    backgroundColor: Colors.bgElevated,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    height: 36,
    minWidth: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  emptySection: {
    alignItems: 'center',
    marginTop: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
  },
  emptyText: {
    fontSize: Typography.fontSize.body,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    fontSize: Typography.fontSize.body,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
});
