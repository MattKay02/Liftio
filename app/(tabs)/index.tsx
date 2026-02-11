import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, Typography, Spacing } from '@/constants';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/shared/Header';
import { WorkoutWithExercises } from '@/types/workout';
import { getCustomTemplates, deleteWorkout, reorderTemplates } from '@/lib/database/queries/workouts';
import { useWorkoutStore } from '@/lib/stores/workoutStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import { MAX_CUSTOM_WORKOUTS } from '@/lib/utils/validation';

export default function HomeScreen() {
  const [templates, setTemplates] = useState<WorkoutWithExercises[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const { isWorkoutActive } = useWorkoutStore();

  useFocusEffect(
    useCallback(() => {
      setTemplates(getCustomTemplates());
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

  const handleViewWorkout = (workout: WorkoutWithExercises) => {
    router.push(`/workout/${workout.id}`);
  };

  const handleCreateTemplate = () => {
    if (templates.length >= MAX_CUSTOM_WORKOUTS) {
      Alert.alert(
        'Workout Limit Reached',
        `You can have up to ${MAX_CUSTOM_WORKOUTS} custom workouts. Delete one to create a new one.`
      );
      return;
    }
    router.push('/workout/create-template');
  };

  const handleDeleteTemplate = (template: WorkoutWithExercises) => {
    Alert.alert(
      'Delete Workout',
      `Delete "${template.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteWorkout(template.id);
            setTemplates((prev) => prev.filter((t) => t.id !== template.id));
          },
        },
      ]
    );
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...templates];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    setTemplates(updated);
    reorderTemplates(updated.map((t) => t.id));
  };

  const handleMoveDown = (index: number) => {
    if (index === templates.length - 1) return;
    const updated = [...templates];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    setTemplates(updated);
    reorderTemplates(updated.map((t) => t.id));
  };

  const toggleEdit = () => {
    setIsEditing((prev) => !prev);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
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
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>My Workouts</Text>
            {templates.length > 0 && (
              <Pressable onPress={toggleEdit} hitSlop={8}>
                <Text style={styles.editButtonText}>
                  {isEditing ? 'Done' : 'Edit'}
                </Text>
              </Pressable>
            )}
          </View>

          {templates.length > 0 ? (
            templates.map((template, index) => (
              <View key={template.id} style={styles.workoutCard}>
                {isEditing && (
                  <View style={styles.editControls}>
                    <Pressable
                      onPress={() => handleMoveUp(index)}
                      style={[styles.reorderButton, index === 0 && styles.reorderButtonDisabled]}
                      hitSlop={4}
                      disabled={index === 0}
                    >
                      <Text style={[styles.reorderArrow, index === 0 && styles.reorderArrowDisabled]}>▲</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handleMoveDown(index)}
                      style={[styles.reorderButton, index === templates.length - 1 && styles.reorderButtonDisabled]}
                      hitSlop={4}
                      disabled={index === templates.length - 1}
                    >
                      <Text style={[styles.reorderArrow, index === templates.length - 1 && styles.reorderArrowDisabled]}>▼</Text>
                    </Pressable>
                  </View>
                )}

                <Pressable
                  style={({ pressed }) => [
                    styles.workoutCardContent,
                    pressed && !isEditing && styles.workoutCardPressed,
                  ]}
                  onPress={() => !isEditing && handleViewWorkout(template)}
                  disabled={isEditing}
                >
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
                </Pressable>

                {isEditing ? (
                  <Pressable
                    style={styles.deleteButton}
                    onPress={() => handleDeleteTemplate(template)}
                    hitSlop={8}
                  >
                    <Text style={styles.deleteButtonText}>✕</Text>
                  </Pressable>
                ) : (
                  <Pressable
                    style={({ pressed }) => [
                      styles.startButton,
                      pressed && styles.startButtonPressed,
                    ]}
                    onPress={() => handleStartFromTemplate(template)}
                    hitSlop={8}
                  >
                    <Text style={styles.startButtonText}>Start Workout</Text>
                  </Pressable>
                )}
              </View>
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
        {!isEditing && (
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
            <View style={styles.createButtonTextContainer}>
              <Text style={styles.createButtonTitle}>Create Custom Workout</Text>
              <Text style={styles.createButtonSubtitle}>
                Build a workout framework with your exercises
              </Text>
            </View>
          </Pressable>
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
    paddingBottom: 100,
  },
  resumeButton: {
    marginTop: Spacing.lg,
    height: 56,
    backgroundColor: Colors.accent,
  },
  section: {
    marginTop: Spacing.lg,
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
  editButtonText: {
    fontSize: Typography.fontSize.body,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.semibold,
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
  editControls: {
    marginRight: Spacing.sm,
    gap: 6,
  },
  reorderButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: Colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reorderButtonDisabled: {
    opacity: 0.3,
  },
  reorderArrow: {
    fontSize: 12,
    color: Colors.textPrimary,
  },
  reorderArrowDisabled: {
    color: Colors.textTertiary,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.red600,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  startButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    backgroundColor: Colors.bgElevated,
  },
  startButtonPressed: {
    opacity: 0.7,
  },
  startButtonText: {
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
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
  createButtonTextContainer: {
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
