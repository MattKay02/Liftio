import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, Typography, Spacing } from '@/constants';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/shared/Header';
import { WorkoutWithExercises } from '@/types/workout';
import { getCustomTemplates, getCompletedWorkouts } from '@/lib/database/queries/workouts';
import { useWorkoutStore } from '@/lib/stores/workoutStore';
import { getTimeSinceString, formatDuration } from '@/lib/utils/date';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pencil, Plus } from 'lucide-react-native';

export default function HomeScreen() {
  const [templates, setTemplates] = useState<WorkoutWithExercises[]>([]);
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutWithExercises[]>([]);
  const { isWorkoutActive } = useWorkoutStore();

  useFocusEffect(
    useCallback(() => {
      setTemplates(getCustomTemplates());
      setRecentWorkouts(getCompletedWorkouts(20));
    }, [])
  );

  const handleResumeWorkout = () => {
    router.push('/workout/active');
  };

  const handleStartFromTemplate = (template: WorkoutWithExercises) => {
    router.push({
      pathname: '/workout/active',
      params: { templateId: template.id },
    });
  };

  const handleEditWorkout = (workout: WorkoutWithExercises) => {
    router.push(`/workout/${workout.id}`);
  };

  const handleCreateTemplate = () => {
    router.push('/workout/create-template');
  };

  const hasWorkouts = templates.length > 0 || recentWorkouts.length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header showSettings={false} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {isWorkoutActive && (
          <Button
            title="RESUME WORKOUT"
            onPress={handleResumeWorkout}
            style={styles.resumeButton}
          />
        )}

        {/* My Workouts - Custom Templates */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>My Workouts</Text>
          {templates.length > 0 ? (
            templates.map((template) => (
              <Pressable
                key={template.id}
                style={({ pressed }) => [
                  styles.workoutCard,
                  pressed && styles.workoutCardPressed,
                ]}
                onPress={() => handleStartFromTemplate(template)}
              >
                <View style={styles.workoutCardContent}>
                  <Text style={styles.workoutName}>{template.name}</Text>
                  <Text style={styles.workoutMeta}>
                    {template.exercises.length} exercise{template.exercises.length !== 1 ? 's' : ''}
                  </Text>
                  <View style={styles.exercisePreview}>
                    {template.exercises.slice(0, 4).map((ex, i) => (
                      <Text key={`${ex.id}-${i}`} style={styles.exercisePreviewText}>
                        {ex.exerciseName}{i < Math.min(template.exercises.length, 4) - 1 ? '  \u00B7  ' : ''}
                      </Text>
                    ))}
                    {template.exercises.length > 4 && (
                      <Text style={styles.exercisePreviewMore}>
                        +{template.exercises.length - 4} more
                      </Text>
                    )}
                  </View>
                </View>
                <Pressable
                  style={({ pressed }) => [
                    styles.editButton,
                    pressed && styles.editButtonPressed,
                  ]}
                  onPress={() => handleEditWorkout(template)}
                  hitSlop={8}
                >
                  <Pencil size={16} color={Colors.textSecondary} />
                </Pressable>
              </Pressable>
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No custom workouts yet</Text>
              <Text style={styles.emptySubtext}>
                Create one to get started quickly
              </Text>
            </View>
          )}
        </View>

        {/* Create Custom Workout */}
        <Pressable
          style={({ pressed }) => [
            styles.createButton,
            pressed && styles.createButtonPressed,
          ]}
          onPress={handleCreateTemplate}
        >
          <View style={styles.createButtonIcon}>
            <Plus size={20} color={Colors.textPrimary} />
          </View>
          <View style={styles.createButtonContent}>
            <Text style={styles.createButtonTitle}>Create Custom Workout</Text>
            <Text style={styles.createButtonSubtitle}>
              Build a workout framework with your exercises
            </Text>
          </View>
        </Pressable>

        {/* Recent Workouts */}
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
                onPress={() => handleStartFromTemplate(workout)}
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
  resumeButton: {
    marginTop: Spacing.lg,
    height: 56,
    backgroundColor: Colors.accent,
  },
  section: {
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
  exercisePreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  exercisePreviewText: {
    fontSize: Typography.fontSize.caption,
    color: Colors.textTertiary,
  },
  exercisePreviewMore: {
    fontSize: Typography.fontSize.caption,
    color: Colors.textTertiary,
    marginLeft: 4,
  },
  editButton: {
    padding: Spacing.sm,
    borderRadius: 8,
    backgroundColor: Colors.bgElevated,
  },
  editButtonPressed: {
    opacity: 0.6,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    borderStyle: 'dashed',
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  createButtonPressed: {
    opacity: 0.7,
  },
  createButtonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  createButtonContent: {
    flex: 1,
  },
  createButtonTitle: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  createButtonSubtitle: {
    fontSize: Typography.fontSize.caption,
    color: Colors.textTertiary,
  },
  emptyCard: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: Typography.fontSize.body,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    fontSize: Typography.fontSize.caption,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
});
