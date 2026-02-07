import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, Typography, Spacing } from '@/constants';
import { Button } from '@/components/ui/Button';
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
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>Liftio</Text>
          <Text style={styles.tagline}>Track your lifts</Text>
        </View>

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
            <Text style={styles.sectionLabel}>Recent Workouts</Text>
            {recentWorkouts.map((workout) => (
              <Pressable
                key={workout.id}
                style={styles.templateCard}
                onPress={() => handleStartFromTemplate(workout)}
              >
                <Text style={styles.templateName}>{workout.name}</Text>
                <Text style={styles.templateMeta}>
                  {workout.exercises.length} exercises
                  {workout.duration ? ` \u00B7 ${formatDuration(workout.duration)}` : ''}
                </Text>
                <Text style={styles.templateDate}>
                  {getTimeSinceString(workout.date)}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {recentWorkouts.length === 0 && (
          <View style={styles.emptySection}>
            <Text style={styles.emptyText}>
              No workouts yet. Start your first one!
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
    backgroundColor: Colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    paddingBottom: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  logo: {
    fontSize: Typography.fontSize.display,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.grey900,
  },
  tagline: {
    fontSize: Typography.fontSize.body,
    color: Colors.grey400,
    marginTop: Spacing.xs,
  },
  startButton: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.md,
  },
  templatesSection: {
    marginTop: Spacing.xl,
    marginHorizontal: Spacing.md,
  },
  sectionLabel: {
    fontSize: Typography.fontSize.caption,
    color: Colors.grey600,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  templateCard: {
    backgroundColor: Colors.grey50,
    borderWidth: 1,
    borderColor: Colors.grey200,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  templateName: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.grey900,
    marginBottom: Spacing.xs,
  },
  templateMeta: {
    fontSize: Typography.fontSize.caption,
    color: Colors.grey600,
    marginBottom: Spacing.xs,
  },
  templateDate: {
    fontSize: Typography.fontSize.caption,
    color: Colors.grey400,
  },
  emptySection: {
    alignItems: 'center',
    marginTop: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
  },
  emptyText: {
    fontSize: Typography.fontSize.body,
    color: Colors.grey400,
    textAlign: 'center',
  },
});
