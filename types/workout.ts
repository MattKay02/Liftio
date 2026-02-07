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
  createdAt: number;
}

export interface WorkoutSet {
  id: string;
  exerciseId: string;
  setNumber: number;
  reps: number;
  weight: number;
  isCompleted: boolean;
  createdAt: number;
}

export interface ExerciseLibraryItem {
  id: string;
  name: string;
  category: 'Barbell' | 'Dumbbell' | 'Machine' | 'Bodyweight' | 'Cable' | 'Other';
  muscleGroup: string | null;
  equipment: string | null;
  isCustom: boolean;
  createdAt: number;
}

export interface UserSettings {
  id: number;
  weightUnit: 'lbs' | 'kg';
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
