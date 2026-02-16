export type CardioMode = 'time' | 'time_distance' | 'time_reps' | 'distance' | 'reps';

export const CARDIO_MODE_LABELS: Record<CardioMode, string> = {
  time: 'Time',
  time_distance: 'Time + Dist',
  time_reps: 'Time + Reps',
  distance: 'Distance',
  reps: 'Reps',
};

export interface Workout {
  id: string;
  name: string;
  date: number;
  duration: number | null;
  notes: string | null;
  isTemplate: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Exercise {
  id: string;
  workoutId: string;
  exerciseName: string;
  orderIndex: number;
  notes: string | null;
  cardioMode: CardioMode | null;
  createdAt: number;
}

export interface WorkoutSet {
  id: string;
  exerciseId: string;
  setNumber: number;
  reps: number;
  weight: number;
  duration: number; // total seconds, used for cardio
  distance: number;
  isCompleted: boolean;
  createdAt: number;
}

export interface ExerciseLibraryItem {
  id: string;
  name: string;
  category: 'Barbell' | 'Dumbbell' | 'Machine' | 'Bodyweight' | 'Cable' | 'EZ Bar' | 'Trap Bar' | 'Kettlebell' | 'Cardio' | 'Other';
  muscleGroup: string | null;
  equipment: string | null;
  isCustom: boolean;
  createdAt: number;
  imageKey: string | null;
}

export interface UserSettings {
  id: number;
  weightUnit: 'lbs' | 'kg';
  distanceUnit: 'km' | 'mi';
  defaultRestTimer: number;
  theme: 'light' | 'dark';
  createdAt: number;
  updatedAt: number;
}

export interface WorkoutWithExercises extends Workout {
  exercises: ExerciseWithSets[];
}

export interface ExerciseWithSets extends Exercise {
  sets: WorkoutSet[];
}
