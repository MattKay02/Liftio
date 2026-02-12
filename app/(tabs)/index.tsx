import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import DraggableFlatList, { ScaleDecorator, RenderItemParams } from 'react-native-draggable-flatlist';
import { Colors, Typography, Spacing, Shadows } from '@/constants';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/shared/Header';
import { WorkoutWithExercises } from '@/types/workout';
import { getCustomTemplates, deleteWorkout, reorderTemplates } from '@/lib/database/queries/workouts';
import { useWorkoutStore } from '@/lib/stores/workoutStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Layers } from 'lucide-react-native';
import { MAX_CUSTOM_WORKOUTS } from '@/lib/utils/validation';
import { PremadeWorkoutsSlideUp } from '@/components/shared/PremadeWorkoutsSlideUp';

export default function HomeScreen() {
  const [templates, setTemplates] = useState<WorkoutWithExercises[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showPremadeSlideUp, setShowPremadeSlideUp] = useState(false);
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

  const handleDragEnd = ({ data }: { data: WorkoutWithExercises[] }) => {
    setTemplates(data);
    reorderTemplates(data.map((t) => t.id));
  };

  const toggleEdit = () => {
    setIsEditing((prev) => !prev);
  };

  const renderTemplateItem = useCallback(
    ({ item: template, drag, isActive }: RenderItemParams<WorkoutWithExercises>) => (
      <ScaleDecorator>
        <View style={[styles.workoutCard, isActive && styles.workoutCardDragging]}>
          <Pressable
            style={styles.workoutCardContent}
            onPress={() => !isEditing && handleViewWorkout(template)}
            onLongPress={drag}
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
            <AnimatedPressable
              scaleValue={0.9}
              style={styles.deleteButton}
              onPress={() => handleDeleteTemplate(template)}
              hitSlop={8}
            >
              <Text style={styles.deleteButtonText}>✕</Text>
            </AnimatedPressable>
          ) : (
            <AnimatedPressable
              scaleValue={0.96}
              style={styles.startButton}
              onPress={() => handleStartFromTemplate(template)}
              hitSlop={8}
            >
              <Text style={styles.startButtonText}>Start Workout</Text>
            </AnimatedPressable>
          )}
        </View>
      </ScaleDecorator>
    ),
    [isEditing, templates]
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header showSettings={false} />
      {templates.length > 0 ? (
        <DraggableFlatList
          data={templates}
          keyExtractor={(item) => item.id}
          renderItem={renderTemplateItem}
          onDragEnd={handleDragEnd}
          containerStyle={styles.container}
          contentContainerStyle={styles.content}
          ListHeaderComponent={
            <View>
              {isWorkoutActive && (
                <Button
                  title="RESUME WORKOUT"
                  onPress={handleResumeWorkout}
                  style={styles.resumeButton}
                />
              )}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>My Workouts</Text>
                <Pressable onPress={toggleEdit} hitSlop={8}>
                  <Text style={styles.editButtonText}>
                    {isEditing ? 'Done' : 'Edit'}
                  </Text>
                </Pressable>
              </View>
            </View>
          }
          ListFooterComponent={
            !isEditing ? (
              <View>
                <AnimatedPressable
                  scaleValue={0.98}
                  style={styles.createButton}
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
                </AnimatedPressable>
                <AnimatedPressable
                  scaleValue={0.98}
                  style={styles.createButton}
                  onPress={() => setShowPremadeSlideUp(true)}
                >
                  <View style={styles.createButtonIcon}>
                    <Layers size={20} color={Colors.textPrimary} />
                  </View>
                  <View style={styles.createButtonTextContainer}>
                    <Text style={styles.createButtonTitle}>Browse Premade Workouts</Text>
                    <Text style={styles.createButtonSubtitle}>
                      Push, Pull, Legs & more
                    </Text>
                  </View>
                </AnimatedPressable>
              </View>
            ) : null
          }
        />
      ) : (
        <View style={[styles.container, styles.content]}>
          {isWorkoutActive && (
            <Button
              title="RESUME WORKOUT"
              onPress={handleResumeWorkout}
              style={styles.resumeButton}
            />
          )}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>My Workouts</Text>
            </View>
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No custom workouts yet</Text>
              <Text style={styles.emptySubtext}>
                Create one to get started quickly
              </Text>
            </View>
          </View>
          <AnimatedPressable
            scaleValue={0.98}
            style={styles.createButton}
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
          </AnimatedPressable>
          <AnimatedPressable
            scaleValue={0.98}
            style={styles.createButton}
            onPress={() => setShowPremadeSlideUp(true)}
          >
            <View style={styles.createButtonIcon}>
              <Layers size={20} color={Colors.textPrimary} />
            </View>
            <View style={styles.createButtonTextContainer}>
              <Text style={styles.createButtonTitle}>Browse Premade Workouts</Text>
              <Text style={styles.createButtonSubtitle}>
                Push, Pull, Legs & more
              </Text>
            </View>
          </AnimatedPressable>
        </View>
      )}
      <PremadeWorkoutsSlideUp
        visible={showPremadeSlideUp}
        onClose={() => setShowPremadeSlideUp(false)}
        onWorkoutAdded={() => setTemplates(getCustomTemplates())}
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
    marginTop: Spacing.lg,
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
    ...Shadows.card,
  },
  workoutCardDragging: {
    opacity: 0.9,
    borderColor: Colors.textSecondary,
  },
  workoutCardContent: {
    flex: 1,
  },
  workoutName: {
    fontSize: Typography.fontSize.title,
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
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md + 4,
    borderRadius: 12,
    backgroundColor: Colors.accent,
  },
  startButtonText: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.accentText,
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
