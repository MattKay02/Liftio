import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { Colors, Typography, Spacing } from '@/constants';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useWorkoutStore } from '@/lib/stores/workoutStore';
import { formatDuration } from '@/lib/utils/date';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FinishWorkoutScreen() {
  const [notes, setNotes] = useState('');
  const { activeWorkout, workoutStartTime, finishWorkout } = useWorkoutStore();

  if (!activeWorkout || !workoutStartTime) {
    return null;
  }

  const elapsed = Math.floor((Date.now() - workoutStartTime) / 1000);
  const totalSets = activeWorkout.exercises.reduce(
    (sum, e) => sum + e.sets.filter((s) => s.isCompleted).length,
    0
  );

  const handleFinish = () => {
    finishWorkout(notes);
    router.dismissAll();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backButton}>Back</Text>
          </Pressable>
          <Text style={styles.title}>Finish Workout</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{formatDuration(elapsed)}</Text>
              <Text style={styles.summaryLabel}>Duration</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{activeWorkout.exercises.length}</Text>
              <Text style={styles.summaryLabel}>Exercises</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{totalSets}</Text>
              <Text style={styles.summaryLabel}>Sets</Text>
            </View>
          </View>

          <Text style={styles.inputLabel}>Notes (optional)</Text>
          <Input
            placeholder="How was your workout?"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            style={styles.notesInput}
          />

          <Button
            title="SAVE WORKOUT"
            onPress={handleFinish}
            style={styles.saveButton}
          />

          <Button
            title="Discard"
            onPress={() => router.back()}
            variant="destructive"
          />
        </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey200,
  },
  backButton: {
    fontSize: Typography.fontSize.body,
    color: Colors.grey600,
  },
  title: {
    fontSize: Typography.fontSize.bodyLg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.grey900,
  },
  content: {
    padding: Spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.xl,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.grey50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.grey200,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: Typography.fontSize.title,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.grey900,
    marginBottom: Spacing.xs,
  },
  summaryLabel: {
    fontSize: Typography.fontSize.caption,
    color: Colors.grey400,
  },
  inputLabel: {
    fontSize: Typography.fontSize.caption,
    color: Colors.grey600,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: Spacing.lg,
  },
  saveButton: {
    marginBottom: Spacing.md,
  },
});
