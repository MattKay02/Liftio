import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import { WorkoutSet } from '@/types/workout';
import { useWorkoutStore } from '@/lib/stores/workoutStore';
import { Checkbox } from '@/components/ui/Checkbox';
import { Colors, Spacing, Typography } from '@/constants';
import { sanitizeReps, sanitizeWeight } from '@/lib/utils/validation';

interface SetRowProps {
  set: WorkoutSet;
  setNumber: number;
  exerciseId: string;
  exerciseName: string;
  readonly?: boolean;
}

export const SetRow = ({ set, setNumber, exerciseId, exerciseName, readonly = false }: SetRowProps) => {
  const { updateSet, completeSet, getPreviousSetData } = useWorkoutStore();
  const [previousData, setPreviousData] = useState('');
  const [reps, setReps] = useState(set.reps > 0 ? set.reps.toString() : '');
  const [weight, setWeight] = useState(set.weight > 0 ? set.weight.toString() : '');

  useEffect(() => {
    const prevSets = getPreviousSetData(exerciseName);
    if (prevSets && prevSets[setNumber - 1]) {
      const prev = prevSets[setNumber - 1];
      setPreviousData(`${prev.reps} x ${prev.weight}`);
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
    if (parseInt(reps) > 0 && parseFloat(weight) > 0) {
      completeSet(exerciseId, set.id);
    }
  };

  return (
    <View style={[styles.row, set.isCompleted && styles.completedRow]}>
      <Text style={[styles.text, styles.setCol]}>{setNumber}</Text>
      <Text style={[styles.text, styles.prevCol, styles.prevText]}>
        {previousData || '-'}
      </Text>
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
      <View style={styles.checkCol}>
        <Checkbox
          checked={set.isCompleted}
          onPress={handleComplete}
          disabled={set.isCompleted || readonly}
        />
      </View>
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
  repsCol: { flex: 1, marginHorizontal: 4 },
  weightCol: { flex: 1.2, marginHorizontal: 4 },
  checkCol: { flex: 0.5, alignItems: 'center' },
});
