import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import { WorkoutSet } from '@/types/workout';
import { useWorkoutStore } from '@/lib/stores/workoutStore';
import { Checkbox } from '@/components/ui/Checkbox';
import { Colors, Spacing, Typography } from '@/constants';
import {
  sanitizeTimeInput,
  formatTimeDisplay,
  timeDigitsToSeconds,
  secondsToTimeDigits,
  secondsToTimeDisplay,
} from '@/lib/utils/validation';

interface CardioSetRowProps {
  set: WorkoutSet;
  setNumber: number;
  exerciseId: string;
  exerciseName: string;
  readonly?: boolean;
}

export const CardioSetRow = ({ set, setNumber, exerciseId, exerciseName, readonly = false }: CardioSetRowProps) => {
  const { updateSet, completeSet, removeSet, getPreviousSetData } = useWorkoutStore();
  const [previousData, setPreviousData] = useState('');
  const [timeDigits, setTimeDigits] = useState(secondsToTimeDigits(set.duration));

  useEffect(() => {
    const prevSets = getPreviousSetData(exerciseName);
    if (prevSets && prevSets[setNumber - 1]) {
      const prev = prevSets[setNumber - 1];
      setPreviousData(secondsToTimeDisplay(prev.duration));
    }
  }, []);

  const handleTimeChange = (value: string) => {
    if (readonly) return;
    const sanitized = sanitizeTimeInput(value);
    setTimeDigits(sanitized);
    const seconds = timeDigitsToSeconds(sanitized);
    updateSet(exerciseId, set.id, { duration: seconds });
  };

  const handleComplete = () => {
    if (readonly) return;
    if (timeDigitsToSeconds(timeDigits) > 0) {
      completeSet(exerciseId, set.id);
    }
  };

  const handleRemove = () => {
    removeSet(exerciseId, set.id);
  };

  return (
    <View style={[styles.row, set.isCompleted && styles.completedRow]}>
      <Text style={[styles.text, styles.setCol]}>{setNumber}</Text>
      <Text style={[styles.text, styles.prevCol, styles.prevText]}>
        {previousData || '-'}
      </Text>
      <TextInput
        style={[styles.input, styles.durationCol]}
        value={timeDigits ? formatTimeDisplay(timeDigits) : ''}
        onChangeText={handleTimeChange}
        keyboardType="numeric"
        maxLength={9}
        placeholder="00:00"
        placeholderTextColor={Colors.textTertiary}
        editable={!set.isCompleted && !readonly}
      />
      <View style={styles.checkCol}>
        <Checkbox
          checked={set.isCompleted}
          onPress={handleComplete}
          disabled={set.isCompleted || readonly}
        />
      </View>
      {!readonly && !set.isCompleted ? (
        <Pressable style={styles.removeCol} onPress={handleRemove} hitSlop={8}>
          <Text style={styles.removeText}>✕</Text>
        </Pressable>
      ) : (
        <View style={styles.removeCol} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bgElevated,
  },
  completedRow: {
    opacity: 0.6,
  },
  text: {
    fontSize: Typography.fontSize.body,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  prevText: {
    color: Colors.textTertiary,
    fontSize: Typography.fontSize.caption,
  },
  input: {
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 4,
    fontSize: Typography.fontSize.body,
    textAlign: 'center',
    color: Colors.textPrimary,
  },
  setCol: { flex: 0.5 },
  prevCol: { flex: 1.5 },
  durationCol: { flex: 2, marginHorizontal: 4 },
  checkCol: { flex: 0.5, alignItems: 'center' },
  removeCol: { flex: 0.4, alignItems: 'center' },
  removeText: {
    fontSize: Typography.fontSize.caption,
    color: Colors.textTertiary,
  },
});
