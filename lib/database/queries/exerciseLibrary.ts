import { getDb } from '../db';
import { ExerciseLibraryItem } from '@/types/workout';
import { generateUUID } from '@/lib/utils/uuid';

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

export const getMuscleGroups = (): string[] => {
  const db = getDb();
  const rows = db.getAllSync<{ muscle_group: string }>(
    'SELECT DISTINCT muscle_group FROM exercise_library WHERE muscle_group IS NOT NULL ORDER BY muscle_group ASC'
  );
  return rows.map((r) => r.muscle_group);
};

export const exerciseNameExists = (name: string): boolean => {
  const db = getDb();
  const row = db.getFirstSync<{ found: number }>(
    'SELECT 1 AS found FROM exercise_library WHERE LOWER(name) = LOWER(?)',
    [name.trim()]
  );
  return row !== null;
};

export const addCustomExercise = (
  name: string,
  category: string,
  muscleGroup: string
): ExerciseLibraryItem => {
  const db = getDb();
  const id = generateUUID();
  const now = Date.now();

  db.runSync(
    `INSERT INTO exercise_library (id, name, category, muscle_group, is_custom, created_at)
     VALUES (?, ?, ?, ?, 1, ?)`,
    [id, name.trim(), category, muscleGroup, now]
  );

  return {
    id,
    name: name.trim(),
    category: category as ExerciseLibraryItem['category'],
    muscleGroup,
    equipment: null,
    isCustom: true,
    createdAt: now,
  };
};

export const isCardioExercise = (exerciseName: string): boolean => {
  const db = getDb();
  const row = db.getFirstSync<{ found: number }>(
    'SELECT 1 AS found FROM exercise_library WHERE name = ? AND muscle_group = ?',
    [exerciseName, 'Cardio']
  );
  return row !== null;
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
