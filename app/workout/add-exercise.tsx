import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useState, useMemo } from 'react';
import { Colors, Typography, Spacing } from '@/constants';
import { Input } from '@/components/ui/Input';
import { useWorkoutStore } from '@/lib/stores/workoutStore';
import { getAllExercises, getCategories } from '@/lib/database/queries/exerciseLibrary';
import { ExerciseLibraryItem } from '@/types/workout';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddExerciseScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const addExercise = useWorkoutStore((s) => s.addExercise);

  const allExercises = useMemo(() => getAllExercises(), []);
  const categories = useMemo(() => getCategories(), []);

  const filteredExercises = useMemo(() => {
    let results = allExercises;

    if (selectedCategory) {
      results = results.filter((e) => e.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter((e) => e.name.toLowerCase().includes(query));
    }

    return results;
  }, [allExercises, searchQuery, selectedCategory]);

  const handleSelect = (exercise: ExerciseLibraryItem) => {
    addExercise(exercise.name);
    router.back();
  };

  const renderExercise = ({ item }: { item: ExerciseLibraryItem }) => (
    <Pressable style={styles.exerciseRow} onPress={() => handleSelect(item)}>
      <Text style={styles.exerciseName}>{item.name}</Text>
      <Text style={styles.exerciseMeta}>
        {item.muscleGroup} \u00B7 {item.category}
      </Text>
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

        <View style={styles.categoryRow}>
          <Pressable
            style={[
              styles.categoryChip,
              !selectedCategory && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text
              style={[
                styles.categoryText,
                !selectedCategory && styles.categoryTextActive,
              ]}
            >
              All
            </Text>
          </Pressable>
          {categories.map((cat) => (
            <Pressable
              key={cat}
              style={[
                styles.categoryChip,
                selectedCategory === cat && styles.categoryChipActive,
              ]}
              onPress={() =>
                setSelectedCategory(selectedCategory === cat ? null : cat)
              }
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === cat && styles.categoryTextActive,
                ]}
              >
                {cat}
              </Text>
            </Pressable>
          ))}
        </View>

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
  categoryRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  categoryChip: {
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.sm + 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bg,
  },
  categoryChipActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  categoryText: {
    fontSize: Typography.fontSize.caption,
    color: Colors.textSecondary,
  },
  categoryTextActive: {
    color: Colors.accentText,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  exerciseRow: {
    paddingVertical: Spacing.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
});
