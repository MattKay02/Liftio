import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import { WorkoutSet, CardioMode } from '@/types/workout';
import { useWorkoutStore } from '@/lib/stores/workoutStore';
import { Checkbox } from '@/components/ui/Checkbox';
import { Colors, Spacing, Typography } from '@/constants';
import {
  sanitizeTimeInput,
  formatTimeDisplay,
  timeDigitsToSeconds,
  secondsToTimeDigits,
  secondsToTimeDisplay,
  sanitizeDistance,
  sanitizeReps,
} from '@/lib/utils/validation';
import ReanimatedSwipeable, { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import { SharedValue } from 'react-native-reanimated';

interface CardioSetRowProps {
  set: WorkoutSet;
  setNumber: number;
  exerciseId: string;
  exerciseName: string;
  cardioMode: CardioMode;
  distanceUnit: 'km' | 'mi';
  readonly?: boolean;
}

export const CardioSetRow = ({ set, setNumber, exerciseId, exerciseName, cardioMode, distanceUnit, readonly = false }: CardioSetRowProps) => {
  const { updateSet, completeSet, removeSet, getPreviousSetData } = useWorkoutStore();
  const [previousData, setPreviousData] = useState('');
  const [timeDigits, setTimeDigits] = useState(secondsToTimeDigits(set.duration));
  const [distanceValue, setDistanceValue] = useState(set.distance > 0 ? set.distance.toString() : '');
  const [repsValue, setRepsValue] = useState(set.reps > 0 ? set.reps.toString() : '');

  const showTime = cardioMode === 'time' || cardioMode === 'time_distance' || cardioMode === 'time_reps';
  const showDistance = cardioMode === 'distance' || cardioMode === 'time_distance';
  const showReps = cardioMode === 'reps' || cardioMode === 'time_reps';

  useEffect(() => {
    const prevSets = getPreviousSetData(exerciseName);
    if (prevSets && prevSets[setNumber - 1]) {
      const prev = prevSets[setNumber - 1];
      const parts: string[] = [];
      if (showTime && prev.duration > 0) parts.push(secondsToTimeDisplay(prev.duration));
      if (showDistance && prev.distance > 0) parts.push(`${prev.distance}${distanceUnit}`);
      if (showReps && prev.reps > 0) parts.push(`${prev.reps}`);
      setPreviousData(parts.join(' / ') || '-');
    }
  }, []);

  const handleTimeChange = (value: string) => {
    if (readonly) return;
    const sanitized = sanitizeTimeInput(value);
    setTimeDigits(sanitized);
    const seconds = timeDigitsToSeconds(sanitized);
    updateSet(exerciseId, set.id, { duration: seconds });
  };

  const handleDistanceChange = (value: string) => {
    if (readonly) return;
    const sanitized = sanitizeDistance(value);
    setDistanceValue(sanitized);
    updateSet(exerciseId, set.id, { distance: parseFloat(sanitized) || 0 });
  };

  const handleRepsChange = (value: string) => {
    if (readonly) return;
    const sanitized = sanitizeReps(value);
    setRepsValue(sanitized);
    updateSet(exerciseId, set.id, { reps: parseInt(sanitized) || 0 });
  };

  const handleComplete = () => {
    if (readonly) return;
    if (set.isCompleted) {
      completeSet(exerciseId, set.id);
      return;
    }
    // Allow completion if any tracked field has data
    const hasData =
      (showTime && timeDigitsToSeconds(timeDigits) > 0) ||
      (showDistance && (parseFloat(distanceValue) || 0) > 0) ||
      (showReps && (parseInt(repsValue) || 0) > 0);
    if (hasData) {
      completeSet(exerciseId, set.id);
    }
  };

  // Count visible fields to determine flex proportions
  const fieldCount = [showTime, showDistance, showReps].filter(Boolean).length;
  const fieldFlex = fieldCount === 1 ? 2 : 1.2;

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
      {showTime && (
        <TextInput
          style={[styles.input, { flex: fieldFlex, marginHorizontal: 4 }]}
          value={timeDigits ? formatTimeDisplay(timeDigits) : ''}
          onChangeText={handleTimeChange}
          keyboardType="numeric"
          maxLength={9}
          placeholder="00:00"
          placeholderTextColor={Colors.textTertiary}
          editable={!set.isCompleted && !readonly}
        />
      )}
      {showDistance && (
        <TextInput
          style={[styles.input, { flex: fieldFlex, marginHorizontal: 4 }]}
          value={distanceValue}
          onChangeText={handleDistanceChange}
          keyboardType="decimal-pad"
          maxLength={6}
          placeholder={`0 ${distanceUnit}`}
          placeholderTextColor={Colors.textTertiary}
          editable={!set.isCompleted && !readonly}
        />
      )}
      {showReps && (
        <TextInput
          style={[styles.input, { flex: fieldFlex, marginHorizontal: 4 }]}
          value={repsValue}
          onChangeText={handleRepsChange}
          keyboardType="numeric"
          maxLength={3}
          placeholder="0"
          placeholderTextColor={Colors.textTertiary}
          editable={!set.isCompleted && !readonly}
        />
      )}
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
