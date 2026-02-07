import * as SQLite from 'expo-sqlite';
import { generateUUID } from '@/lib/utils/uuid';

const DB_NAME = 'liftio.db';

let _db: SQLite.SQLiteDatabase | null = null;

export const getDb = (): SQLite.SQLiteDatabase => {
  if (!_db) {
    _db = SQLite.openDatabaseSync(DB_NAME);
  }
  return _db;
};

export const initializeDatabase = async () => {
  const db = getDb();

  await db.execAsync(`PRAGMA journal_mode = WAL;`);
  await db.execAsync(`PRAGMA foreign_keys = ON;`);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS workouts (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      date INTEGER NOT NULL,
      duration INTEGER,
      notes TEXT,
      is_template INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);

  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts(date DESC);
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS exercises (
      id TEXT PRIMARY KEY NOT NULL,
      workout_id TEXT NOT NULL,
      exercise_name TEXT NOT NULL,
      order_index INTEGER NOT NULL,
      notes TEXT,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE
    );
  `);

  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_exercises_workout_id ON exercises(workout_id);
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS sets (
      id TEXT PRIMARY KEY NOT NULL,
      exercise_id TEXT NOT NULL,
      set_number INTEGER NOT NULL,
      reps INTEGER NOT NULL,
      weight REAL NOT NULL,
      is_completed INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
    );
  `);

  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_sets_exercise_id ON sets(exercise_id);
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS exercise_library (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL,
      muscle_group TEXT,
      equipment TEXT,
      is_custom INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL
    );
  `);

  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_exercise_library_category ON exercise_library(category);
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS user_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      weight_unit TEXT DEFAULT 'lbs',
      default_rest_timer INTEGER DEFAULT 90,
      theme TEXT DEFAULT 'light',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);

  // Seed exercise library if empty
  const count = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM exercise_library'
  );

  if (count && count.count === 0) {
    await seedExerciseLibrary(db);
  }

  // Initialize settings if not exists
  const settings = db.getFirstSync('SELECT * FROM user_settings WHERE id = 1');
  if (!settings) {
    const now = Date.now();
    db.runSync(
      'INSERT INTO user_settings (id, weight_unit, default_rest_timer, theme, created_at, updated_at) VALUES (1, ?, ?, ?, ?, ?)',
      ['lbs', 90, 'light', now, now]
    );
  }
};

const seedExerciseLibrary = async (db: SQLite.SQLiteDatabase) => {
  const exercises = [
    { name: 'Barbell Back Squat', category: 'Barbell', muscleGroup: 'Legs', equipment: 'Barbell' },
    { name: 'Barbell Bench Press', category: 'Barbell', muscleGroup: 'Chest', equipment: 'Barbell' },
    { name: 'Barbell Deadlift', category: 'Barbell', muscleGroup: 'Back', equipment: 'Barbell' },
    { name: 'Barbell Overhead Press', category: 'Barbell', muscleGroup: 'Shoulders', equipment: 'Barbell' },
    { name: 'Barbell Row', category: 'Barbell', muscleGroup: 'Back', equipment: 'Barbell' },
    { name: 'Barbell Front Squat', category: 'Barbell', muscleGroup: 'Legs', equipment: 'Barbell' },
    { name: 'Barbell Romanian Deadlift', category: 'Barbell', muscleGroup: 'Legs', equipment: 'Barbell' },
    { name: 'Barbell Hip Thrust', category: 'Barbell', muscleGroup: 'Legs', equipment: 'Barbell' },
    { name: 'Dumbbell Bench Press', category: 'Dumbbell', muscleGroup: 'Chest', equipment: 'Dumbbell' },
    { name: 'Dumbbell Shoulder Press', category: 'Dumbbell', muscleGroup: 'Shoulders', equipment: 'Dumbbell' },
    { name: 'Dumbbell Row', category: 'Dumbbell', muscleGroup: 'Back', equipment: 'Dumbbell' },
    { name: 'Dumbbell Bicep Curl', category: 'Dumbbell', muscleGroup: 'Arms', equipment: 'Dumbbell' },
    { name: 'Dumbbell Tricep Extension', category: 'Dumbbell', muscleGroup: 'Arms', equipment: 'Dumbbell' },
    { name: 'Dumbbell Lateral Raise', category: 'Dumbbell', muscleGroup: 'Shoulders', equipment: 'Dumbbell' },
    { name: 'Dumbbell Goblet Squat', category: 'Dumbbell', muscleGroup: 'Legs', equipment: 'Dumbbell' },
    { name: 'Dumbbell Lunge', category: 'Dumbbell', muscleGroup: 'Legs', equipment: 'Dumbbell' },
    { name: 'Leg Press', category: 'Machine', muscleGroup: 'Legs', equipment: 'Machine' },
    { name: 'Leg Curl', category: 'Machine', muscleGroup: 'Legs', equipment: 'Machine' },
    { name: 'Leg Extension', category: 'Machine', muscleGroup: 'Legs', equipment: 'Machine' },
    { name: 'Lat Pulldown', category: 'Machine', muscleGroup: 'Back', equipment: 'Machine' },
    { name: 'Cable Row', category: 'Machine', muscleGroup: 'Back', equipment: 'Machine' },
    { name: 'Chest Press Machine', category: 'Machine', muscleGroup: 'Chest', equipment: 'Machine' },
    { name: 'Pull-up', category: 'Bodyweight', muscleGroup: 'Back', equipment: 'Bodyweight' },
    { name: 'Push-up', category: 'Bodyweight', muscleGroup: 'Chest', equipment: 'Bodyweight' },
    { name: 'Dip', category: 'Bodyweight', muscleGroup: 'Chest', equipment: 'Bodyweight' },
    { name: 'Chin-up', category: 'Bodyweight', muscleGroup: 'Back', equipment: 'Bodyweight' },
    { name: 'Cable Fly', category: 'Cable', muscleGroup: 'Chest', equipment: 'Cable' },
    { name: 'Cable Tricep Pushdown', category: 'Cable', muscleGroup: 'Arms', equipment: 'Cable' },
    { name: 'Cable Bicep Curl', category: 'Cable', muscleGroup: 'Arms', equipment: 'Cable' },
    { name: 'Cable Face Pull', category: 'Cable', muscleGroup: 'Shoulders', equipment: 'Cable' },
  ];

  const now = Date.now();
  for (const exercise of exercises) {
    db.runSync(
      'INSERT INTO exercise_library (id, name, category, muscle_group, equipment, is_custom, created_at) VALUES (?, ?, ?, ?, ?, 0, ?)',
      [generateUUID(), exercise.name, exercise.category, exercise.muscleGroup, exercise.equipment, now]
    );
  }
};
