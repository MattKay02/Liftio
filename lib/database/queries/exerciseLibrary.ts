import { getDb } from '../db';
import { ExerciseLibraryItem } from '@/types/workout';

interface ExerciseLibraryRow {
  id: string;
  name: string;
  category: string;
  muscle_group: string | null;
  equipment: string | null;
  is_custom: number;
  created_at: number;
}

export const getAllExercises = (): ExerciseLibraryItem[] => {
  const db = getDb();
  const rows = db.getAllSync<ExerciseLibraryRow>(
    'SELECT * FROM exercise_library ORDER BY name ASC'
  );
  return rows.map(mapExercise);
};

export const searchExercises = (query: string): ExerciseLibraryItem[] => {
  const db = getDb();
  const rows = db.getAllSync<ExerciseLibraryRow>(
    'SELECT * FROM exercise_library WHERE name LIKE ? ORDER BY name ASC',
    [`%${query}%`]
  );
  return rows.map(mapExercise);
};

export const getExercisesByCategory = (category: string): ExerciseLibraryItem[] => {
  const db = getDb();
  const rows = db.getAllSync<ExerciseLibraryRow>(
    'SELECT * FROM exercise_library WHERE category = ? ORDER BY name ASC',
    [category]
  );
  return rows.map(mapExercise);
};

export const getCategories = (): string[] => {
  const db = getDb();
  const rows = db.getAllSync<{ category: string }>(
    'SELECT DISTINCT category FROM exercise_library ORDER BY category ASC'
  );
  return rows.map((r) => r.category);
};

const mapExercise = (row: ExerciseLibraryRow): ExerciseLibraryItem => ({
  id: row.id,
  name: row.name,
  category: row.category as ExerciseLibraryItem['category'],
  muscleGroup: row.muscle_group,
  equipment: row.equipment,
  isCustom: row.is_custom === 1,
  createdAt: row.created_at,
});
