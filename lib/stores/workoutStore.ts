import { create } from 'zustand';
import { WorkoutWithExercises, ExerciseWithSets, WorkoutSet } from '@/types/workout';
import { generateUUID } from '@/lib/utils/uuid';
import { saveWorkout, getPreviousSetsForExercise } from '@/lib/database/queries/workouts';

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
        createdAt: now,
        sets: e.sets.map((s, j) => ({
          id: generateUUID(),
          exerciseId: '', // Will be set below
          setNumber: j + 1,
          reps: 0,
          weight: s.weight,
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

    // Filter out sets with 0 reps, then remove exercises with no remaining sets
    const filteredExercises = activeWorkout.exercises
      .map((e) => ({
        ...e,
        sets: e.sets.filter((s) => s.reps > 0),
      }))
      .filter((e) => e.sets.length > 0);

    const finalWorkout: WorkoutWithExercises = {
      ...activeWorkout,
      exercises: filteredExercises,
      duration,
      notes: notes || null,
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

    const exerciseId = generateUUID();
    const newExercise: ExerciseWithSets = {
      id: exerciseId,
      workoutId: activeWorkout.id,
      exerciseName,
      orderIndex: activeWorkout.exercises.length,
      notes: null,
      createdAt: Date.now(),
      sets: [
        {
          id: generateUUID(),
          exerciseId,
          setNumber: 1,
          reps: 0,
          weight: 0,
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

    const lastSet = exercise.sets[exercise.sets.length - 1];

    const newSet: WorkoutSet = {
      id: generateUUID(),
      exerciseId,
      setNumber: exercise.sets.length + 1,
      reps: 0,
      weight: lastSet?.weight || 0,
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

    set({
      activeWorkout: {
        ...activeWorkout,
        exercises: activeWorkout.exercises.map((e) =>
          e.id === exerciseId
            ? {
                ...e,
                sets: e.sets.map((s) => (s.id === setId ? { ...s, ...data } : s)),
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
    get().updateSet(exerciseId, setId, { isCompleted: true });
  },

  getPreviousSetData: (exerciseName) => {
    return getPreviousSetsForExercise(exerciseName);
  },
}));
