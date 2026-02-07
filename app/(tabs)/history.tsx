import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, Typography, Spacing } from '@/constants';
import { WorkoutWithExercises } from '@/types/workout';
import { getRecentWorkouts } from '@/lib/database/queries/workouts';
import { formatDate, formatDuration } from '@/lib/utils/date';
import { EmptyState } from '@/components/shared/EmptyState';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HistoryScreen() {
  const [workouts, setWorkouts] = useState<WorkoutWithExercises[]>([]);

  useFocusEffect(
    useCallback(() => {
      const data = getRecentWorkouts(50);
      setWorkouts(data);
    }, [])
  );

  const handleWorkoutPress = (workout: WorkoutWithExercises) => {
    router.push({
      pathname: '/workout/[id]',
      params: { id: workout.id },
    });
  };

  const renderWorkout = ({ item }: { item: WorkoutWithExercises }) => (
    <Pressable style={styles.card} onPress={() => handleWorkoutPress(item)}>
      <View style={styles.cardHeader}>
        <Text style={styles.workoutName}>{item.name}</Text>
        <Text style={styles.workoutDate}>{formatDate(item.date)}</Text>
      </View>
      <Text style={styles.workoutMeta}>
        {item.exercises.length} exercises
        {item.duration ? ` \u00B7 ${formatDuration(item.duration)}` : ''}
      </Text>
      <Text style={styles.exerciseList} numberOfLines={2}>
        {item.exercises.map((e) => e.exerciseName).join(', ')}
      </Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>History</Text>

        {workouts.length === 0 ? (
          <EmptyState
            title="No workouts yet"
            message="Complete your first workout to see it here."
          />
        ) : (
          <FlatList
            data={workouts}
            keyExtractor={(item) => item.id}
            renderItem={renderWorkout}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
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
  title: {
    fontSize: Typography.fontSize.display,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.grey900,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  card: {
    backgroundColor: Colors.grey50,
    borderWidth: 1,
    borderColor: Colors.grey200,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  workoutName: {
    fontSize: Typography.fontSize.bodyLg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.grey900,
    flex: 1,
  },
  workoutDate: {
    fontSize: Typography.fontSize.caption,
    color: Colors.grey400,
  },
  workoutMeta: {
    fontSize: Typography.fontSize.caption,
    color: Colors.grey600,
    marginBottom: Spacing.xs,
  },
  exerciseList: {
    fontSize: Typography.fontSize.caption,
    color: Colors.grey400,
    lineHeight: Typography.lineHeight.caption,
  },
});
