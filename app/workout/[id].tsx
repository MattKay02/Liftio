import { View, Text, TextInput, StyleSheet, Alert, Pressable } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, Typography, Spacing } from '@/constants';
import { Button } from '@/components/ui/Button';
import { WorkoutWithExercises, ExerciseWithSets, WorkoutSet, CardioMode, CARDIO_MODE_LABELS } from '@/types/workout';
import { CardioModePicker } from '@/components/workout/CardioModePicker';
import { getWorkoutById, deleteWorkout, updateWorkout } from '@/lib/database/queries/workouts';
import { useSettingsStore } from '@/lib/stores/settingsStore';
import { formatDate, formatDuration, getTotalWeight, formatWeight } from '@/lib/utils/date';
import { secondsToTimeDisplay, sanitizeReps, sanitizeWeight, sanitizeDistance, sanitizeTimeInput, formatTimeDisplay, timeDigitsToSeconds, secondsToTimeDigits } from '@/lib/utils/validation';
import { isCardioExercise } from '@/lib/database/queries/exerciseLibrary';
import { generateUUID } from '@/lib/utils/uuid';
import { consumePendingExercise } from '@/lib/utils/pendingExercise';
import { SafeAreaView } from 'react-native-safe-area-context';
import ReanimatedSwipeable, { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, { SharedValue, FadeInDown } from 'react-native-reanimated';

export default function WorkoutDetailScreen() {
  const { id, edit } = useLocalSearchParams<{ id: string; edit?: string }>();
  const [workout, setWorkout] = useState<WorkoutWithExercises | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editWorkout, setEditWorkout] = useState<WorkoutWithExercises | null>(null);
  const weightUnit = useSettingsStore((s) => s.settings.weightUnit);
  const distanceUnit = useSettingsStore((s) => s.settings.distanceUnit);
  const [modePickerExerciseId, setModePickerExerciseId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const data = getWorkoutById(id);
      setWorkout(data);
      if (edit === 'true' && data) {
        enterEditMode(data);
      }
    }
  }, [id]);

  const enterEditMode = (source?: WorkoutWithExercises) => {
    const w = source ?? workout;
    if (!w) return;
    setEditWorkout(JSON.parse(JSON.stringify(w)));
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setEditWorkout(null);
    setIsEditing(false);
  };

  const handleSave = () => {
    if (!editWorkout) return;
    Alert.alert('Confirm Changes', 'Save all changes to this workout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Save',
        onPress: () => {
          try {
            updateWorkout(editWorkout);
            setWorkout(JSON.parse(JSON.stringify(editWorkout)));
            setEditWorkout(null);
            setIsEditing(false);
          } catch (e) {
            Alert.alert('Error', 'Failed to save changes.');
          }
        },
      },
    ]);
  };

  const handleDelete = () => {
    Alert.alert('Delete Workout?', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          if (id) {
            deleteWorkout(id);
            router.back();
          }
        },
      },
    ]);
  };

  // Edit mode helpers
  const updateSetField = (exerciseId: string, setId: string, field: 'reps' | 'weight' | 'duration' | 'distance', value: number) => {
    if (!editWorkout) return;
    setEditWorkout({
      ...editWorkout,
      exercises: editWorkout.exercises.map((e) =>
        e.id === exerciseId
          ? { ...e, sets: e.sets.map((s) => (s.id === setId ? { ...s, [field]: value } : s)) }
          : e
      ),
    });
  };

  const updateExerciseCardioMode = (exerciseId: string, mode: CardioMode) => {
    if (!editWorkout) return;
    setEditWorkout({
      ...editWorkout,
      exercises: editWorkout.exercises.map((e) =>
        e.id === exerciseId ? { ...e, cardioMode: mode } : e
      ),
    });
  };

  const removeSet = (exerciseId: string, setId: string) => {
    if (!editWorkout) return;
    setEditWorkout({
      ...editWorkout,
      exercises: editWorkout.exercises.map((e) =>
        e.id === exerciseId
          ? {
              ...e,
              sets: e.sets
                .filter((s) => s.id !== setId)
                .map((s, i) => ({ ...s, setNumber: i + 1 })),
            }
          : e
      ),
    });
  };

  // Pick up exercise selected from add-exercise screen
  useFocusEffect(
    useCallback(() => {
      const pending = consumePendingExercise();
      if (pending && editWorkout) {
        const isCardio = isCardioExercise(pending.name);
        const newExercise: ExerciseWithSets = {
          id: generateUUID(),
          workoutId: editWorkout.id,
          exerciseName: pending.name,
          orderIndex: editWorkout.exercises.length,
          notes: null,
          cardioMode: isCardio ? 'time' : null,
          createdAt: Date.now(),
          sets: [{
            id: generateUUID(),
            exerciseId: '',
            setNumber: 1,
            reps: 0,
            weight: 0,
            duration: 0,
            distance: 0,
            isCompleted: false,
            createdAt: Date.now(),
          }],
        };
        // Fix the set's exerciseId
        newExercise.sets[0].exerciseId = newExercise.id;
        setEditWorkout({
          ...editWorkout,
          exercises: [...editWorkout.exercises, newExercise],
        });
      }
    }, [editWorkout])
  );

  const removeExercise = (exerciseId: string) => {
    if (!editWorkout) return;
    const exercise = editWorkout.exercises.find((e) => e.id === exerciseId);
    Alert.alert(
      'Remove Exercise',
      `Remove ${exercise?.exerciseName ?? 'this exercise'} and all its sets?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setEditWorkout({
              ...editWorkout,
              exercises: editWorkout.exercises
                .filter((e) => e.id !== exerciseId)
                .map((e, i) => ({ ...e, orderIndex: i })),
            });
          },
        },
      ]
    );
  };

  const addSet = (exerciseId: string) => {
    if (!editWorkout) return;
    setEditWorkout({
      ...editWorkout,
      exercises: editWorkout.exercises.map((e) => {
        if (e.id !== exerciseId) return e;
        const newSet: WorkoutSet = {
          id: generateUUID(),
          exerciseId,
          setNumber: e.sets.length + 1,
          reps: 0,
          weight: 0,
          duration: 0,
          distance: 0,
          isCompleted: false,
          createdAt: Date.now(),
        };
        return { ...e, sets: [...e.sets, newSet] };
      }),
    });
  };

  if (!workout) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const displayWorkout = isEditing && editWorkout ? editWorkout : workout;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          {isEditing ? (
            <>
              <Button title="Cancel" onPress={cancelEdit} variant="text" />
              <Text style={styles.headerTitle}>Editing</Text>
              <Button title="Save" onPress={handleSave} variant="text" />
            </>
          ) : (
            <>
              <Button title="Back" onPress={() => router.back()} variant="text" />
              <Text style={styles.headerTitle}>
                {workout.isTemplate ? 'Template' : formatDate(workout.date)}
              </Text>
              <Button title="Edit" onPress={() => enterEditMode()} variant="text" />
            </>
          )}
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
          decelerationRate="fast"
        >
          <Text style={styles.workoutName}>{displayWorkout.name}</Text>

          <View style={styles.metaRow}>
            {!displayWorkout.isTemplate && displayWorkout.duration != null && displayWorkout.duration > 0 && (
              <Text style={styles.metaText}>{formatDuration(displayWorkout.duration)}</Text>
            )}
            <Text style={styles.metaText}>
              {displayWorkout.exercises.length} exercise{displayWorkout.exercises.length !== 1 ? 's' : ''}
            </Text>
            {!displayWorkout.isTemplate && getTotalWeight(displayWorkout.exercises) > 0 && (
              <Text style={styles.metaText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>{formatWeight(getTotalWeight(displayWorkout.exercises), weightUnit)}</Text>
            )}
          </View>

          {displayWorkout.notes && (
            <Text style={styles.notes}>{displayWorkout.notes}</Text>
          )}

          {displayWorkout.exercises.map((exercise, exerciseIndex) => {
            const isCardio = exercise.cardioMode !== null || isCardioExercise(exercise.exerciseName);
            const cardioMode: CardioMode = exercise.cardioMode ?? 'time';

            const showTime = cardioMode === 'time' || cardioMode === 'time_distance' || cardioMode === 'time_reps';
            const showDistance = cardioMode === 'distance' || cardioMode === 'time_distance';
            const showReps = cardioMode === 'reps' || cardioMode === 'time_reps';

            // Dynamic header columns for cardio
            const fieldCount = [showTime, showDistance, showReps].filter(Boolean).length;
            const fieldFlex = fieldCount === 1 ? 2 : 1.2;

            return (
              <Animated.View
                key={exercise.id}
                style={styles.exerciseSection}
                entering={FadeInDown.delay(exerciseIndex * 80).duration(350)}
              >
                <View style={styles.exerciseHeader}>
                  <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
                  {isEditing && (
                    <Pressable
                      onPress={() => removeExercise(exercise.id)}
                      hitSlop={8}
                    >
                      <Text style={styles.removeExerciseText}>Remove</Text>
                    </Pressable>
                  )}
                </View>

                {/* Edit Units button in edit mode for cardio exercises */}
                {isEditing && isCardio && (
                  <Pressable style={styles.editUnitsButton} onPress={() => setModePickerExerciseId(exercise.id)}>
                    <Text style={styles.editUnitsText}>
                      {CARDIO_MODE_LABELS[cardioMode]}
                    </Text>
                    <Text style={styles.editUnitsChevron}>Edit Units</Text>
                  </Pressable>
                )}

                {/* Mode picker bottom sheet */}
                {isEditing && isCardio && (
                  <CardioModePicker
                    visible={modePickerExerciseId === exercise.id}
                    currentMode={cardioMode}
                    onSelect={(mode) => updateExerciseCardioMode(exercise.id, mode)}
                    onClose={() => setModePickerExerciseId(null)}
                  />
                )}

                <View style={styles.setsTable}>
                  <View style={styles.setsHeaderRow}>
                    <Text style={[styles.setsHeaderText, styles.setNumCol]}>Set</Text>
                    {isCardio ? (
                      <>
                        {showTime && <Text style={[styles.setsHeaderText, { flex: fieldFlex, textAlign: 'center' }]}>Duration</Text>}
                        {showDistance && <Text style={[styles.setsHeaderText, { flex: fieldFlex, textAlign: 'center' }]}>Dist ({distanceUnit})</Text>}
                        {showReps && <Text style={[styles.setsHeaderText, { flex: fieldFlex, textAlign: 'center' }]}>Reps</Text>}
                      </>
                    ) : (
                      <>
                        <Text style={[styles.setsHeaderText, styles.weightCol]}>
                          Weight ({weightUnit})
                        </Text>
                        <Text style={[styles.setsHeaderText, styles.repsCol]}>Reps</Text>
                      </>
                    )}
                  </View>
                  {exercise.sets.map((set, i) =>
                    isEditing ? (
                      <EditableSetRow
                        key={set.id}
                        set={set}
                        index={i}
                        exerciseId={exercise.id}
                        isCardio={isCardio}
                        cardioMode={cardioMode}
                        distanceUnit={distanceUnit}
                        onUpdateField={updateSetField}
                        onRemove={removeSet}
                      />
                    ) : (
                      <View key={set.id} style={styles.setRow}>
                        <Text style={[styles.setText, styles.setNumCol]}>{i + 1}</Text>
                        {isCardio ? (
                          <>
                            {showTime && (
                              <Text style={[styles.setText, { flex: fieldFlex, textAlign: 'center' }]}>
                                {secondsToTimeDisplay(set.duration)}
                              </Text>
                            )}
                            {showDistance && (
                              <Text style={[styles.setText, { flex: fieldFlex, textAlign: 'center' }]}>
                                {set.distance > 0 ? set.distance : '-'}
                              </Text>
                            )}
                            {showReps && (
                              <Text style={[styles.setText, { flex: fieldFlex, textAlign: 'center' }]}>
                                {set.reps > 0 ? set.reps : '-'}
                              </Text>
                            )}
                          </>
                        ) : (
                          <>
                            <Text style={[styles.setText, styles.weightCol]}>{set.weight}</Text>
                            <Text style={[styles.setText, styles.repsCol]}>{set.reps}</Text>
                          </>
                        )}
                      </View>
                    )
                  )}
                </View>
                {isEditing && (
                  <Pressable style={styles.addSetButton} onPress={() => addSet(exercise.id)}>
                    <Text style={styles.addSetText}>+ Add Set</Text>
                  </Pressable>
                )}
              </Animated.View>
            );
          })}

          {isEditing && (
            <>
              <Pressable
                style={styles.addExerciseButton}
                onPress={() => router.push('/workout/add-exercise?mode=edit')}
              >
                <Text style={styles.addExerciseText}>+ Add Exercise</Text>
              </Pressable>
              <Button
                title="Delete Workout"
                onPress={handleDelete}
                variant="destructive"
                style={styles.deleteButton}
              />
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// Editable set row with swipe-to-delete
interface EditableSetRowProps {
  set: WorkoutSet;
  index: number;
  exerciseId: string;
  isCardio: boolean;
  cardioMode: CardioMode;
  distanceUnit: 'km' | 'mi';
  onUpdateField: (exerciseId: string, setId: string, field: 'reps' | 'weight' | 'duration' | 'distance', value: number) => void;
  onRemove: (exerciseId: string, setId: string) => void;
}

const EditableSetRow = ({ set, index, exerciseId, isCardio, cardioMode, distanceUnit, onUpdateField, onRemove }: EditableSetRowProps) => {
  const [reps, setReps] = useState(set.reps > 0 ? set.reps.toString() : '');
  const [weight, setWeight] = useState(set.weight > 0 ? set.weight.toString() : '');
  const [timeDigits, setTimeDigits] = useState(secondsToTimeDigits(set.duration));
  const [distanceValue, setDistanceValue] = useState(set.distance > 0 ? set.distance.toString() : '');

  const showTime = cardioMode === 'time' || cardioMode === 'time_distance' || cardioMode === 'time_reps';
  const showDistanceField = cardioMode === 'distance' || cardioMode === 'time_distance';
  const showRepsField = cardioMode === 'reps' || cardioMode === 'time_reps';

  const fieldCount = [showTime, showDistanceField, showRepsField].filter(Boolean).length;
  const fieldFlex = fieldCount === 1 ? 2 : 1.2;

  const handleRepsChange = (value: string) => {
    const sanitized = sanitizeReps(value);
    setReps(sanitized);
    onUpdateField(exerciseId, set.id, 'reps', parseInt(sanitized) || 0);
  };

  const handleWeightChange = (value: string) => {
    const sanitized = sanitizeWeight(value);
    setWeight(sanitized);
    onUpdateField(exerciseId, set.id, 'weight', parseFloat(sanitized) || 0);
  };

  const handleTimeChange = (value: string) => {
    const sanitized = sanitizeTimeInput(value);
    setTimeDigits(sanitized);
    onUpdateField(exerciseId, set.id, 'duration', timeDigitsToSeconds(sanitized));
  };

  const handleDistanceChange = (value: string) => {
    const sanitized = sanitizeDistance(value);
    setDistanceValue(sanitized);
    onUpdateField(exerciseId, set.id, 'distance', parseFloat(sanitized) || 0);
  };

  const renderLeftActions = (
    _progress: SharedValue<number>,
    _translation: SharedValue<number>,
    swipeableMethods: SwipeableMethods
  ) => (
    <Pressable
      style={styles.swipeDeleteButton}
      onPress={() => {
        swipeableMethods.close();
        onRemove(exerciseId, set.id);
      }}
    >
      <Text style={styles.swipeDeleteText}>Delete</Text>
    </Pressable>
  );

  return (
    <ReanimatedSwipeable
      renderLeftActions={renderLeftActions}
      overshootLeft={false}
      leftThreshold={40}
      friction={2}
      dragOffsetFromLeftEdge={20}
    >
      <View style={styles.editSetRow}>
        <Text style={[styles.setText, styles.setNumCol]}>{index + 1}</Text>
        {isCardio ? (
          <>
            {showTime && (
              <TextInput
                style={[styles.editInput, { flex: fieldFlex, marginHorizontal: 4 }]}
                value={timeDigits ? formatTimeDisplay(timeDigits) : ''}
                onChangeText={handleTimeChange}
                keyboardType="numeric"
                maxLength={9}
                placeholder="00:00"
                placeholderTextColor={Colors.textTertiary}
              />
            )}
            {showDistanceField && (
              <TextInput
                style={[styles.editInput, { flex: fieldFlex, marginHorizontal: 4 }]}
                value={distanceValue}
                onChangeText={handleDistanceChange}
                keyboardType="decimal-pad"
                maxLength={6}
                placeholder={`0 ${distanceUnit}`}
                placeholderTextColor={Colors.textTertiary}
              />
            )}
            {showRepsField && (
              <TextInput
                style={[styles.editInput, { flex: fieldFlex, marginHorizontal: 4 }]}
                value={reps}
                onChangeText={handleRepsChange}
                keyboardType="numeric"
                maxLength={3}
                placeholder="0"
                placeholderTextColor={Colors.textTertiary}
              />
            )}
          </>
        ) : (
          <>
            <TextInput
              style={[styles.editInput, styles.weightCol]}
              value={weight}
              onChangeText={handleWeightChange}
              keyboardType="decimal-pad"
              maxLength={6}
              placeholder="0"
              placeholderTextColor={Colors.textTertiary}
            />
            <TextInput
              style={[styles.editInput, styles.repsCol]}
              value={reps}
              onChangeText={handleRepsChange}
              keyboardType="numeric"
              maxLength={3}
              placeholder="0"
              placeholderTextColor={Colors.textTertiary}
            />
          </>
        )}
      </View>
    </ReanimatedSwipeable>
  );
};

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
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: Typography.fontSize.body,
    color: Colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  loadingText: {
    fontSize: Typography.fontSize.body,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.xxl,
  },
  workoutName: {
    fontSize: Typography.fontSize.display,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  metaText: {
    fontSize: Typography.fontSize.body,
    color: Colors.textTertiary,
  },
  notes: {
    fontSize: Typography.fontSize.body,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeight.body,
    marginBottom: Spacing.lg,
    fontStyle: 'italic',
  },
  exerciseSection: {
    marginBottom: Spacing.lg,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  exerciseName: {
    fontSize: Typography.fontSize.bodyLg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  removeExerciseText: {
    fontSize: Typography.fontSize.caption,
    color: Colors.red600,
    fontWeight: Typography.fontWeight.semibold,
  },
  editUnitsButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.xs + 2,
    marginBottom: Spacing.sm,
  },
  editUnitsText: {
    fontSize: Typography.fontSize.caption,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeight.semibold,
  },
  editUnitsChevron: {
    fontSize: Typography.fontSize.caption,
    color: Colors.textTertiary,
  },
  setsTable: {},
  setsHeaderRow: {
    flexDirection: 'row',
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  setsHeaderText: {
    fontSize: Typography.fontSize.caption,
    color: Colors.textTertiary,
    fontWeight: Typography.fontWeight.semibold,
  },
  setRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  editSetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.bg,
  },
  setText: {
    fontSize: Typography.fontSize.body,
    color: Colors.textPrimary,
  },
  setNumCol: {
    flex: 0.5,
    textAlign: 'center',
  },
  repsCol: {
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 4,
  },
  weightCol: {
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 4,
  },
  durationCol: {
    flex: 2,
    textAlign: 'center',
    marginHorizontal: 4,
  },
  editInput: {
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
  addSetButton: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    marginTop: Spacing.sm,
  },
  addSetText: {
    fontSize: Typography.fontSize.body,
    color: Colors.textSecondary,
  },
  addExerciseButton: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    marginBottom: Spacing.md,
  },
  addExerciseText: {
    fontSize: Typography.fontSize.body,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.semibold,
  },
  deleteButton: {
    marginTop: Spacing.md,
  },
  swipeDeleteButton: {
    backgroundColor: Colors.red600,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 8,
  },
  swipeDeleteText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.semibold,
  },
});
