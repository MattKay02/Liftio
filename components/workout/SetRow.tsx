import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import { WorkoutSet } from '@/types/workout';
import { useWorkoutStore } from '@/lib/stores/workoutStore';
import { useSettingsStore } from '@/lib/stores/settingsStore';
import { Checkbox } from '@/components/ui/Checkbox';
import { Colors, Spacing, Typography } from '@/constants';
import { sanitizeReps, sanitizeWeight } from '@/lib/utils/validation';
import ReanimatedSwipeable, { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import { SharedValue } from 'react-native-reanimated';

interface SetRowProps {
  set: WorkoutSet;
  setNumber: number;
  exerciseId: string;
  exerciseName: string;
  readonly?: boolean;
}

export const SetRow = ({ set, setNumber, exerciseId, exerciseName, readonly = false }: SetRowProps) => {
  const { updateSet, completeSet, removeSet, getPreviousSetData } = useWorkoutStore();
  const { settings } = useSettingsStore();
  const [previousData, setPreviousData] = useState('');
  const [reps, setReps] = useState(set.reps > 0 ? set.reps.toString() : '');
  const [weight, setWeight] = useState(set.weight > 0 ? set.weight.toString() : '');

  useEffect(() => {
    const prevSets = getPreviousSetData(exerciseName);
    if (prevSets && prevSets[setNumber - 1]) {
      const prev = prevSets[setNumber - 1];
      if (prev.weight > 0) {
        setPreviousData(`${prev.weight}${settings.weightUnit} x ${prev.reps}`);
      } else {
        setPreviousData('-');
      }
    }
  }, []);

  const handleRepsChange = (value: string) => {
    if (readonly) return;
    const sanitized = sanitizeReps(value);
    setReps(sanitized);
    const numValue = parseInt(sanitized) || 0;
    updateSet(exerciseId, set.id, { reps: numValue });
  };

  const handleWeightChange = (value: string) => {
    if (readonly) return;
    const sanitized = sanitizeWeight(value);
    setWeight(sanitized);
    const numValue = parseFloat(sanitized) || 0;
    updateSet(exerciseId, set.id, { weight: numValue });
  };

  const handleComplete = () => {
    if (readonly) return;
    if (set.isCompleted) {
      completeSet(exerciseId, set.id);
      return;
    }
    if (parseInt(reps) > 0 && parseFloat(weight) > 0) {
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
        style={[styles.input, styles.weightCol]}
        value={weight}
        onChangeText={handleWeightChange}
        keyboardType="decimal-pad"
        maxLength={6}
        placeholder="0"
        placeholderTextColor={Colors.textTertiary}
        editable={!set.isCompleted && !readonly}
      />
      <TextInput
        style={[styles.input, styles.repsCol]}
        value={reps}
        onChangeText={handleRepsChange}
        keyboardType="numeric"
        maxLength={3}
        placeholder="0"
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
  repsCol: { flex: 1, marginHorizontal: 4 },
  weightCol: { flex: 1.2, marginHorizontal: 4 },
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
