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
import ReanimatedSwipeable, { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import { SharedValue } from 'react-native-reanimated';

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
    if (set.isCompleted) {
      completeSet(exerciseId, set.id);
      return;
    }
    if (timeDigitsToSeconds(timeDigits) > 0) {
      completeSet(exerciseId, set.id);
    }
  };

  const renderLeftActions = (
    _progress: SharedValue<number>,
    _translation: SharedValue<number>,
    swipeableMethods: SwipeableMethods
  ) => (
    <Pressable
      style={styles.deleteButton}
      onPress={() => {
        swipeableMethods.close();
        removeSet(exerciseId, set.id);
      }}
    >
      <Text style={styles.deleteText}>Delete</Text>
    </Pressable>
  );

  const rowContent = (
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
          disabled={readonly}
        />
      </View>
    </View>
  );

  if (readonly) {
    return rowContent;
  }

  return (
    <ReanimatedSwipeable
      renderLeftActions={renderLeftActions}
      overshootLeft={false}
      leftThreshold={40}
      friction={2}
      dragOffsetFromLeftEdge={20}
    >
      {rowContent}
    </ReanimatedSwipeable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bgElevated,
    backgroundColor: Colors.bgCard,
  },
  completedRow: {
    backgroundColor: 'rgba(22, 163, 74, 0.08)',
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
  checkCol: { flex: 0.6, alignItems: 'center' },
  deleteButton: {
    backgroundColor: Colors.red600,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 8,
  },
  deleteText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.semibold,
  },
});
