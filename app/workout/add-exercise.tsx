import { View, Text, FlatList, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useMemo, useCallback } from 'react';
import { Colors, Typography, Spacing } from '@/constants';
import { Input } from '@/components/ui/Input';
import { useWorkoutStore } from '@/lib/stores/workoutStore';
import { useTemplateStore } from '@/lib/stores/templateStore';
import { getAllExercises, getMuscleGroups, getCategories, addCustomExercise, exerciseNameExists } from '@/lib/database/queries/exerciseLibrary';
import { ExerciseLibraryItem } from '@/types/workout';
import { ExerciseImage } from '@/components/shared/ExerciseImage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MAX_EXERCISES_PER_WORKOUT, MAX_EXERCISE_NAME_LENGTH, validateExerciseName } from '@/lib/utils/validation';
import { setPendingExercise } from '@/lib/utils/pendingExercise';

export default function AddExerciseScreen() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const isTemplateMode = params.mode === 'template';
  const isEditMode = params.mode === 'edit';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customMuscleGroup, setCustomMuscleGroup] = useState<string | null>(null);
  const [customCategory, setCustomCategory] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const addWorkoutExercise = useWorkoutStore((s) => s.addExercise);
  const addTemplateExercise = useTemplateStore((s) => s.addExercise);

  const allExercises = useMemo(() => getAllExercises(), [refreshKey]);
  const muscleGroups = useMemo(() => getMuscleGroups(), [refreshKey]);
  const allCategories = useMemo(() => getCategories(), [refreshKey]);

  // Categories available given the current muscle group filter
  const availableCategories = useMemo(() => {
    if (!selectedMuscleGroup) return allCategories;
    const cats = new Set(
      allExercises
        .filter((e) => e.muscleGroup === selectedMuscleGroup)
        .map((e) => e.category)
    );
    return allCategories.filter((c) => cats.has(c as never));
  }, [allExercises, allCategories, selectedMuscleGroup]);

  const filteredExercises = useMemo(() => {
    let results = allExercises;

    if (selectedMuscleGroup) {
      results = results.filter((e) => e.muscleGroup === selectedMuscleGroup);
    }

    if (selectedCategory) {
      results = results.filter((e) => e.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter((e) => e.name.toLowerCase().includes(query));
    }

    return results;
  }, [allExercises, searchQuery, selectedMuscleGroup, selectedCategory]);

  const templateExercises = useTemplateStore((s) => s.exercises);
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);

  const handleSelect = useCallback((exercise: ExerciseLibraryItem) => {
    if (isEditMode) {
      setPendingExercise({ name: exercise.name });
      router.back();
      return;
    }

    const currentCount = isTemplateMode
      ? templateExercises.length
      : (activeWorkout?.exercises.length ?? 0);

    if (currentCount >= MAX_EXERCISES_PER_WORKOUT) {
      Alert.alert(
        'Exercise Limit',
        `Maximum ${MAX_EXERCISES_PER_WORKOUT} exercises per workout.`
      );
      return;
    }

    if (isTemplateMode) {
      addTemplateExercise(exercise.name, exercise.muscleGroup, exercise.category);
    } else {
      addWorkoutExercise(exercise.name);
    }
    router.back();
  }, [isEditMode, isTemplateMode, templateExercises.length, activeWorkout?.exercises.length, addTemplateExercise, addWorkoutExercise]);

  const handleMuscleGroupPress = (mg: string) => {
    if (selectedMuscleGroup === mg) {
      setSelectedMuscleGroup(null);
    } else {
      setSelectedMuscleGroup(mg);
      // Reset category if it's no longer available for this muscle group
      if (selectedCategory) {
        const cats = new Set(
          allExercises.filter((e) => e.muscleGroup === mg).map((e) => e.category)
        );
        if (!cats.has(selectedCategory as never)) {
          setSelectedCategory(null);
        }
      }
    }
  };

  const handleCategoryPress = (cat: string) => {
    setSelectedCategory(selectedCategory === cat ? null : cat);
  };

  const handleCreateCustom = useCallback(() => {
    const nameError = validateExerciseName(customName);
    if (nameError) {
      Alert.alert('Invalid Name', nameError);
      return;
    }
    if (!customMuscleGroup) {
      Alert.alert('Missing Field', 'Please select a muscle group.');
      return;
    }
    if (!customCategory) {
      Alert.alert('Missing Field', 'Please select a category.');
      return;
    }
    if (exerciseNameExists(customName)) {
      Alert.alert('Duplicate', 'An exercise with this name already exists.');
      return;
    }

    const newExercise = addCustomExercise(customName.trim(), customCategory, customMuscleGroup);
    setRefreshKey((k) => k + 1);
    setShowCreateForm(false);
    setCustomName('');
    setCustomMuscleGroup(null);
    setCustomCategory(null);
    handleSelect(newExercise);
  }, [customName, customMuscleGroup, customCategory, handleSelect]);

  const renderExercise = ({ item }: { item: ExerciseLibraryItem }) => (
    <Pressable style={styles.exerciseRow} onPress={() => handleSelect(item)}>
      <ExerciseImage imageKey={item.imageKey} size={40} style={styles.exerciseThumb} />
      <View style={styles.exerciseInfo}>
        <Text style={styles.exerciseName}>{item.name}</Text>
        <Text style={styles.exerciseMeta}>
          {item.muscleGroup} {'\u00B7'} {item.category}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Add Exercise</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.closeButton}>Done</Text>
          </Pressable>
        </View>

        <View style={styles.searchContainer}>
          <Input
            placeholder="Search exercises..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
        </View>

        {/* Create Custom Exercise */}
        {!showCreateForm ? (
          <Pressable
            style={styles.createButton}
            onPress={() => setShowCreateForm(true)}
          >
            <Text style={styles.createButtonText}>+ Create Custom Exercise</Text>
          </Pressable>
        ) : (
          <View style={styles.createForm}>
            <View style={styles.nameInputRow}>
              <Input
                placeholder="Exercise name"
                value={customName}
                onChangeText={setCustomName}
                maxLength={MAX_EXERCISE_NAME_LENGTH}
              />
              <Text style={styles.charCounter}>
                {customName.length}/{MAX_EXERCISE_NAME_LENGTH}
              </Text>
            </View>

            <Text style={styles.formLabel}>Muscle Group</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
            >
              {muscleGroups.map((mg) => (
                <Pressable
                  key={mg}
                  style={[
                    styles.chip,
                    customMuscleGroup === mg && styles.chipActive,
                  ]}
                  onPress={() => setCustomMuscleGroup(customMuscleGroup === mg ? null : mg)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      customMuscleGroup === mg && styles.chipTextActive,
                    ]}
                  >
                    {mg}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={styles.formLabel}>Category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
            >
              {allCategories.map((cat) => (
                <Pressable
                  key={cat}
                  style={[
                    styles.chip,
                    customCategory === cat && styles.chipActive,
                  ]}
                  onPress={() => setCustomCategory(customCategory === cat ? null : cat)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      customCategory === cat && styles.chipTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={styles.formActions}>
              <Pressable onPress={() => {
                setShowCreateForm(false);
                setCustomName('');
                setCustomMuscleGroup(null);
                setCustomCategory(null);
              }}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.saveButton} onPress={handleCreateCustom}>
                <Text style={styles.saveButtonText}>Save Exercise</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Muscle Group Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Muscle Group</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            <Pressable
              style={[
                styles.chip,
                !selectedMuscleGroup && styles.chipActive,
              ]}
              onPress={() => {
                setSelectedMuscleGroup(null);
                setSelectedCategory(null);
              }}
            >
              <Text
                style={[
                  styles.chipText,
                  !selectedMuscleGroup && styles.chipTextActive,
                ]}
              >
                All
              </Text>
            </Pressable>
            {muscleGroups.map((mg) => (
              <Pressable
                key={mg}
                style={[
                  styles.chip,
                  selectedMuscleGroup === mg && styles.chipActive,
                ]}
                onPress={() => handleMuscleGroupPress(mg)}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedMuscleGroup === mg && styles.chipTextActive,
                  ]}
                >
                  {mg}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Category Filter */}
        {availableCategories.length > 1 && (
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Equipment</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
            >
              <Pressable
                style={[
                  styles.chip,
                  !selectedCategory && styles.chipActive,
                ]}
                onPress={() => setSelectedCategory(null)}
              >
                <Text
                  style={[
                    styles.chipText,
                    !selectedCategory && styles.chipTextActive,
                  ]}
                >
                  All
                </Text>
              </Pressable>
              {availableCategories.map((cat) => (
                <Pressable
                  key={cat}
                  style={[
                    styles.chip,
                    selectedCategory === cat && styles.chipActive,
                  ]}
                  onPress={() => handleCategoryPress(cat)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedCategory === cat && styles.chipTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        <FlatList
          data={filteredExercises}
          keyExtractor={(item) => item.id}
          renderItem={renderExercise}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSize.title,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  closeButton: {
    fontSize: Typography.fontSize.body,
    color: Colors.textSecondary,
  },
  searchContainer: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  filterSection: {
    marginBottom: Spacing.sm,
  },
  filterLabel: {
    fontSize: Typography.fontSize.caption,
    color: Colors.textTertiary,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
  },
  chipRow: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
  },
  chip: {
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.sm + 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bg,
  },
  chipActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  chipText: {
    fontSize: Typography.fontSize.caption,
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.accentText,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  exerciseThumb: {
    borderRadius: 6,
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
  createButton: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    paddingVertical: Spacing.sm + 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: Typography.fontSize.body,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.semibold,
  },
  createForm: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    padding: Spacing.md,
    borderRadius: 12,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  nameInputRow: {
    gap: Spacing.xs,
  },
  charCounter: {
    fontSize: Typography.fontSize.caption,
    color: Colors.textTertiary,
    textAlign: 'right',
  },
  formLabel: {
    fontSize: Typography.fontSize.caption,
    color: Colors.textTertiary,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  cancelText: {
    fontSize: Typography.fontSize.body,
    color: Colors.textSecondary,
  },
  saveButton: {
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: 12,
  },
  saveButtonText: {
    color: Colors.accentText,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
  },
});
