import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import { WorkoutSet } from '@/types/workout';
import { useWorkoutStore } from '@/lib/stores/workoutStore';
import { Checkbox } from '@/components/ui/Checkbox';
import { Colors, Spacing, Typography } from '@/constants';

interface SetRowProps {
  set: WorkoutSet;
  setNumber: number;
  exerciseId: string;
  exerciseName: string;
}

export const SetRow = ({ set, setNumber, exerciseId, exerciseName }: SetRowProps) => {
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
    setReps(value);
    const numValue = parseInt(value) || 0;
    updateSet(exerciseId, set.id, { reps: numValue });
  };

  const handleWeightChange = (value: string) => {
    setWeight(value);
    const numValue = parseFloat(value) || 0;
    updateSet(exerciseId, set.id, { weight: numValue });
  };

  const handleComplete = () => {
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
        placeholder="0"
        placeholderTextColor={Colors.grey400}
        editable={!set.isCompleted}
      />
      <TextInput
        style={[styles.input, styles.weightCol]}
        value={weight}
        onChangeText={handleWeightChange}
        keyboardType="decimal-pad"
        placeholder="0"
        placeholderTextColor={Colors.grey400}
        editable={!set.isCompleted}
      />
      <View style={styles.checkCol}>
        <Checkbox
          checked={set.isCompleted}
          onPress={handleComplete}
          disabled={set.isCompleted}
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
    borderBottomColor: Colors.grey100,
  },
  completedRow: {
    opacity: 0.6,
  },
  text: {
    fontSize: Typography.fontSize.body,
    color: Colors.grey900,
    textAlign: 'center',
  },
  prevText: {
    color: Colors.grey400,
    fontSize: Typography.fontSize.caption,
  },
  input: {
    backgroundColor: Colors.grey100,
    borderWidth: 1,
    borderColor: Colors.grey300,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 4,
    fontSize: Typography.fontSize.body,
    textAlign: 'center',
    color: Colors.grey900,
  },
  setCol: { flex: 0.5 },
  prevCol: { flex: 1.5 },
  repsCol: { flex: 1, marginHorizontal: 4 },
  weightCol: { flex: 1.2, marginHorizontal: 4 },
  checkCol: { flex: 0.5, alignItems: 'center' },
});
