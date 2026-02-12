import { create } from 'zustand';
import { WorkoutWithExercises, ExerciseWithSets, WorkoutSet, CardioMode } from '@/types/workout';
import { generateUUID } from '@/lib/utils/uuid';
import { saveWorkout, getPreviousSetsForExercise } from '@/lib/database/queries/workouts';
import {
  MAX_EXERCISES_PER_WORKOUT,
  MAX_SETS_PER_EXERCISE,
  MAX_NOTES_LENGTH,
  MAX_DURATION_SECONDS,
  clampReps,
  clampWeight,
  clampDistance,
} from '@/lib/utils/validation';
import { isCardioExercise } from '@/lib/database/queries/exerciseLibrary';

interface WorkoutState {
  activeWorkout: WorkoutWithExercises | null;
  isWorkoutActive: boolean;
  workoutStartTime: number | null;

  startWorkout: (name: string, fromTemplate?: WorkoutWithExercises) => void;
  finishWorkout: (notes?: string) => void;
  cancelWorkout: () => void;

  addExercise: (exerciseName: string) => void;
  removeExercise: (exerciseId: string) => void;

  addSet: (exerciseId: string) => void;
  updateSet: (exerciseId: string, setId: string, data: Partial<WorkoutSet>) => void;
  removeSet: (exerciseId: string, setId: string) => void;
  completeSet: (exerciseId: string, setId: string) => void;

  reorderExercises: (fromIndex: number, toIndex: number) => void;

  updateCardioMode: (exerciseId: string, mode: CardioMode) => void;

  getPreviousSetData: (exerciseName: string) => WorkoutSet[];
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  activeWorkout: null,
  isWorkoutActive: false,
  workoutStartTime: null,

  startWorkout: (name, fromTemplate) => {
    const now = Date.now();

    if (fromTemplate) {
      // Clone template with new IDs
      const newId = generateUUID();
      const exercises: ExerciseWithSets[] = fromTemplate.exercises.map((e, i) => ({
        id: generateUUID(),
        workoutId: newId,
        exerciseName: e.exerciseName,
        orderIndex: i,
        notes: null,
        cardioMode: e.cardioMode,
        createdAt: now,
        sets: e.sets.map((s, j) => ({
          id: generateUUID(),
          exerciseId: '', // Will be set below
          setNumber: j + 1,
          reps: 0,
          weight: s.weight,
          duration: 0,
          distance: 0,
          isCompleted: false,
          createdAt: now,
        })),
      }));

      // Fix exercise IDs on sets
      for (const ex of exercises) {
        for (const s of ex.sets) {
          s.exerciseId = ex.id;
        }
      }

      set({
        activeWorkout: {
          id: newId,
          name,
          date: now,
          duration: null,
          notes: null,
          isTemplate: false,
          createdAt: now,
          updatedAt: now,
          exercises,
        },
        isWorkoutActive: true,
        workoutStartTime: now,
      });
    } else {
      set({
        activeWorkout: {
          id: generateUUID(),
          name,
          date: now,
          duration: null,
          notes: null,
          isTemplate: false,
          createdAt: now,
          updatedAt: now,
          exercises: [],
        },
        isWorkoutActive: true,
        workoutStartTime: now,
      });
    }
  },

  finishWorkout: (notes) => {
    const { activeWorkout, workoutStartTime } = get();
    if (!activeWorkout || !workoutStartTime) return;

    const duration = Math.floor((Date.now() - workoutStartTime) / 1000);

    // Filter out sets with 0 reps and 0 duration, then remove exercises with no remaining sets
    const filteredExercises = activeWorkout.exercises
      .map((e) => ({
        ...e,
        sets: e.sets.filter((s) => s.reps > 0 || s.duration > 0 || s.distance > 0),
      }))
      .filter((e) => e.sets.length > 0);

    // Sanitize notes: trim and truncate
    const sanitizedNotes = notes?.trim().slice(0, MAX_NOTES_LENGTH) || null;

    const finalWorkout: WorkoutWithExercises = {
      ...activeWorkout,
      exercises: filteredExercises,
      duration,
      notes: sanitizedNotes,
      updatedAt: Date.now(),
    };

    // Save to database
    saveWorkout(finalWorkout);

    set({
      activeWorkout: null,
      isWorkoutActive: false,
      workoutStartTime: null,
    });
  },

  cancelWorkout: () => {
    set({
      activeWorkout: null,
      isWorkoutActive: false,
      workoutStartTime: null,
    });
  },

  addExercise: (exerciseName) => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;
    if (activeWorkout.exercises.length >= MAX_EXERCISES_PER_WORKOUT) return;

    const exerciseId = generateUUID();
    const isCardio = isCardioExercise(exerciseName);
    const newExercise: ExerciseWithSets = {
      id: exerciseId,
      workoutId: activeWorkout.id,
      exerciseName,
      orderIndex: activeWorkout.exercises.length,
      notes: null,
      cardioMode: isCardio ? 'time' : null,
      createdAt: Date.now(),
      sets: [
        {
          id: generateUUID(),
          exerciseId,
          setNumber: 1,
          reps: 0,
          weight: 0,
          duration: 0,
          distance: 0,
          isCompleted: false,
          createdAt: Date.now(),
        },
      ],
    };

    set({
      activeWorkout: {
        ...activeWorkout,
        exercises: [...activeWorkout.exercises, newExercise],
      },
    });
  },

  removeExercise: (exerciseId) => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;

    set({
      activeWorkout: {
        ...activeWorkout,
        exercises: activeWorkout.exercises.filter((e) => e.id !== exerciseId),
      },
    });
  },

  addSet: (exerciseId) => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;

    const exercise = activeWorkout.exercises.find((e) => e.id === exerciseId);
    if (!exercise) return;
    if (exercise.sets.length >= MAX_SETS_PER_EXERCISE) return;

    const lastSet = exercise.sets[exercise.sets.length - 1];
    const isCardio = isCardioExercise(exercise.exerciseName);

    const newSet: WorkoutSet = {
      id: generateUUID(),
      exerciseId,
      setNumber: exercise.sets.length + 1,
      reps: 0,
      weight: isCardio ? 0 : (lastSet?.weight || 0),
      duration: 0,
      distance: 0,
      isCompleted: false,
      createdAt: Date.now(),
    };

    set({
      activeWorkout: {
        ...activeWorkout,
        exercises: activeWorkout.exercises.map((e) =>
          e.id === exerciseId ? { ...e, sets: [...e.sets, newSet] } : e
        ),
      },
    });
  },

  updateSet: (exerciseId, setId, data) => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;

    // Clamp numeric values
    const clamped = { ...data };
    if (clamped.reps !== undefined) clamped.reps = clampReps(clamped.reps);
    if (clamped.weight !== undefined) clamped.weight = clampWeight(clamped.weight);
    if (clamped.duration !== undefined) clamped.duration = Math.min(Math.max(Math.round(clamped.duration), 0), MAX_DURATION_SECONDS);
    if (clamped.distance !== undefined) clamped.distance = clampDistance(clamped.distance);

    set({
      activeWorkout: {
        ...activeWorkout,
        exercises: activeWorkout.exercises.map((e) =>
          e.id === exerciseId
            ? {
                ...e,
                sets: e.sets.map((s) => (s.id === setId ? { ...s, ...clamped } : s)),
              }
            : e
        ),
      },
    });
  },

  removeSet: (exerciseId, setId) => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;

    set({
      activeWorkout: {
        ...activeWorkout,
        exercises: activeWorkout.exercises.map((e) =>
          e.id === exerciseId
            ? {
                ...e,
                sets: e.sets
                  .filter((s) => s.id !== setId)
                  .map((s, i) => ({ ...s, setNumber: i + 1 })),
              }
            : e
        ),
      },
    });
  },

  completeSet: (exerciseId, setId) => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;
    const exercise = activeWorkout.exercises.find((e) => e.id === exerciseId);
    const currentSet = exercise?.sets.find((s) => s.id === setId);
    get().updateSet(exerciseId, setId, { isCompleted: !currentSet?.isCompleted });
  },

  reorderExercises: (fromIndex, toIndex) => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;

    const exercises = [...activeWorkout.exercises];
    const [moved] = exercises.splice(fromIndex, 1);
    exercises.splice(toIndex, 0, moved);

    // Update orderIndex on each exercise
    const reindexed = exercises.map((e, i) => ({ ...e, orderIndex: i }));

    set({
      activeWorkout: {
        ...activeWorkout,
        exercises: reindexed,
      },
    });
  },

  updateCardioMode: (exerciseId, mode) => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;

    set({
      activeWorkout: {
        ...activeWorkout,
        exercises: activeWorkout.exercises.map((e) =>
          e.id === exerciseId ? { ...e, cardioMode: mode } : e
        ),
      },
    });
  },

  getPreviousSetData: (exerciseName) => {
    return getPreviousSetsForExercise(exerciseName);
  },
}));
