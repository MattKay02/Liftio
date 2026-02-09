import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Colors, Typography, Spacing } from '@/constants';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useTemplateStore } from '@/lib/stores/templateStore';
import { saveTemplate } from '@/lib/database/queries/workouts';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import {
  MAX_WORKOUT_NAME_LENGTH,
  MAX_EXERCISES_PER_WORKOUT,
  MAX_CUSTOM_WORKOUTS,
  validateWorkoutName,
  getCustomTemplateCount,
} from '@/lib/utils/validation';

export default function CreateTemplateScreen() {
  const { name, exercises, setName, removeExercise, reset } = useTemplateStore();

  useEffect(() => {
    reset();
  }, []);

  const handleAddExercise = () => {
    if (exercises.length >= MAX_EXERCISES_PER_WORKOUT) {
      Alert.alert(
        'Exercise Limit',
        `Maximum ${MAX_EXERCISES_PER_WORKOUT} exercises per workout.`
      );
      return;
    }
    router.push({
      pathname: '/workout/add-exercise',
      params: { mode: 'template' },
    });
  };

  const handleSave = () => {
    const nameError = validateWorkoutName(name);
    if (nameError) {
      Alert.alert('Name Required', nameError);
      return;
    }

    if (exercises.length === 0) {
      Alert.alert('Add Exercises', 'Add at least one exercise to your workout.');
      return;
    }

    if (getCustomTemplateCount() >= MAX_CUSTOM_WORKOUTS) {
      Alert.alert(
        'Workout Limit Reached',
        `You can have up to ${MAX_CUSTOM_WORKOUTS} custom workouts. Delete one to create a new one.`
      );
      return;
    }

    saveTemplate(
      name.trim(),
      exercises.map((e) => e.name)
    );

    reset();
    router.back();
  };

  const handleCancel = () => {
    if (name.trim() || exercises.length > 0) {
      Alert.alert('Discard Workout?', 'Your changes will be lost.', [
        { text: 'Keep Editing', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            reset();
            router.back();
          },
        },
      ]);
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
          <Text style={styles.headerTitle}>New Workout</Text>
          <Pressable onPress={handleSave}>
            <Text style={styles.saveText}>Save</Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Name Input */}
          <View style={styles.labelRow}>
            <Text style={styles.label}>Workout Name</Text>
            <Text style={styles.charCounter}>{name.length}/{MAX_WORKOUT_NAME_LENGTH}</Text>
          </View>
          <Input
            placeholder="e.g. Push Day, Leg Day, Upper Body"
            value={name}
            onChangeText={setName}
            maxLength={MAX_WORKOUT_NAME_LENGTH}
            style={styles.nameInput}
          />

          {/* Exercises */}
          <View style={styles.exercisesHeader}>
            <Text style={styles.label}>Exercises</Text>
            <Text style={styles.exerciseCount}>
              {exercises.length}/{MAX_EXERCISES_PER_WORKOUT}
            </Text>
          </View>

          {exercises.length > 0 ? (
            <View style={styles.exerciseList}>
              {exercises.map((exercise, index) => (
                <View key={`${exercise.name}-${index}`} style={styles.exerciseRow}>
                  <View style={styles.exerciseIndex}>
                    <Text style={styles.exerciseIndexText}>{index + 1}</Text>
                  </View>
                  <View style={styles.exerciseInfo}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <Text style={styles.exerciseMeta}>
                      {exercise.muscleGroup} {'\u00B7'} {exercise.category}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => removeExercise(index)}
                    hitSlop={8}
                    style={styles.removeButton}
                  >
                    <X size={16} color={Colors.red600} />
                  </Pressable>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyExercises}>
              <Text style={styles.emptyText}>No exercises added yet</Text>
            </View>
          )}

          <Button
            title="+ Add Exercise"
            onPress={handleAddExercise}
            variant="secondary"
            style={styles.addButton}
          />

          {/* Info */}
          <Text style={styles.infoText}>
            Previous weights will be auto-filled when you start this workout.
          </Text>
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
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: Typography.fontSize.bodyLg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  cancelText: {
    fontSize: Typography.fontSize.body,
    color: Colors.textSecondary,
  },
  saveText: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: Typography.fontSize.caption,
    color: Colors.textTertiary,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  charCounter: {
    fontSize: Typography.fontSize.caption,
    color: Colors.textTertiary,
  },
  nameInput: {
    marginBottom: Spacing.lg,
  },
  exercisesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  exerciseCount: {
    fontSize: Typography.fontSize.caption,
    color: Colors.textTertiary,
  },
  exerciseList: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    overflow: 'hidden',
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  exerciseIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  exerciseIndexText: {
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  exerciseMeta: {
    fontSize: Typography.fontSize.caption,
    color: Colors.textTertiary,
  },
  removeButton: {
    padding: Spacing.sm,
  },
  emptyExercises: {
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
  },
  addButton: {
    marginTop: Spacing.md,
  },
  infoText: {
    fontSize: Typography.fontSize.caption,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.lg,
    lineHeight: Typography.lineHeight.caption,
  },
});
