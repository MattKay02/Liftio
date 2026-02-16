import * as SQLite from 'expo-sqlite';
import { generateUUID } from '@/lib/utils/uuid';
import { IMAGE_EXERCISES } from './imageSeedData';

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
    CREATE INDEX IF NOT EXISTS idx_exercises_name ON exercises(exercise_name);
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

  // Add duration column to sets (safe migration - no-op if already exists)
  try {
    await db.execAsync('ALTER TABLE sets ADD COLUMN duration INTEGER DEFAULT 0');
  } catch (e) {
    // Column already exists
  }

  // Add cardio_mode column to exercises
  try {
    await db.execAsync('ALTER TABLE exercises ADD COLUMN cardio_mode TEXT DEFAULT NULL');
  } catch (e) {
    // Column already exists
  }

  // Add distance column to sets
  try {
    await db.execAsync('ALTER TABLE sets ADD COLUMN distance REAL DEFAULT 0');
  } catch (e) {
    // Column already exists
  }

  // Add distance_unit column to user_settings
  try {
    await db.execAsync("ALTER TABLE user_settings ADD COLUMN distance_unit TEXT DEFAULT 'km'");
  } catch (e) {
    // Column already exists
  }

  // Add premade_id column to workouts (for tracking premade templates)
  try {
    await db.execAsync('ALTER TABLE workouts ADD COLUMN premade_id TEXT DEFAULT NULL');
  } catch (e) {
    // Column already exists
  }

  // Add image_key column to exercise_library
  try {
    await db.execAsync('ALTER TABLE exercise_library ADD COLUMN image_key TEXT DEFAULT NULL');
  } catch (e) {
    // Column already exists
  }

  // Seed exercise library (inserts any missing exercises)
  await seedExerciseLibrary(db);

  // Backfill image_key on the original 81 exercises (idempotent)
  updateExerciseImageKeys(db);

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
  const exercises: { name: string; category: string; muscleGroup: string; equipment: string; imageKey?: string | null }[] = [// BARBELL - Core Compounds
    { name: 'Barbell Back Squat', category: 'Barbell', muscleGroup: 'Legs', equipment: 'Barbell' },
    { name: 'Barbell Bench Press', category: 'Barbell', muscleGroup: 'Chest', equipment: 'Barbell' },
    { name: 'Barbell Deadlift', category: 'Barbell', muscleGroup: 'Back', equipment: 'Barbell' },
    { name: 'Barbell Overhead Press', category: 'Barbell', muscleGroup: 'Shoulders', equipment: 'Barbell' },
    { name: 'Barbell Row', category: 'Barbell', muscleGroup: 'Back', equipment: 'Barbell' },
    
    // BARBELL - Variations
    { name: 'Barbell Front Squat', category: 'Barbell', muscleGroup: 'Legs', equipment: 'Barbell' },
    { name: 'Barbell Romanian Deadlift', category: 'Barbell', muscleGroup: 'Legs', equipment: 'Barbell' },
    { name: 'Barbell Hip Thrust', category: 'Barbell', muscleGroup: 'Legs', equipment: 'Barbell' },
    { name: 'Barbell Incline Bench Press', category: 'Barbell', muscleGroup: 'Chest', equipment: 'Barbell' },
    { name: 'Barbell Curl', category: 'Barbell', muscleGroup: 'Arms', equipment: 'Barbell' },
    { name: 'Barbell Sumo Deadlift', category: 'Barbell', muscleGroup: 'Legs', equipment: 'Barbell' },
    { name: 'Barbell Close-Grip Bench Press', category: 'Barbell', muscleGroup: 'Chest', equipment: 'Barbell' },
    { name: 'Barbell Good Morning', category: 'Barbell', muscleGroup: 'Back', equipment: 'Barbell' },
    { name: 'Barbell Shrug', category: 'Barbell', muscleGroup: 'Back', equipment: 'Barbell' },
    
    // DUMBBELL - Essential
    { name: 'Dumbbell Bench Press', category: 'Dumbbell', muscleGroup: 'Chest', equipment: 'Dumbbell' },
    { name: 'Dumbbell Shoulder Press', category: 'Dumbbell', muscleGroup: 'Shoulders', equipment: 'Dumbbell' },
    { name: 'Dumbbell Row', category: 'Dumbbell', muscleGroup: 'Back', equipment: 'Dumbbell' },
    { name: 'Dumbbell Bicep Curl', category: 'Dumbbell', muscleGroup: 'Arms', equipment: 'Dumbbell' },
    { name: 'Dumbbell Tricep Extension', category: 'Dumbbell', muscleGroup: 'Arms', equipment: 'Dumbbell' },
    { name: 'Dumbbell Lateral Raise', category: 'Dumbbell', muscleGroup: 'Shoulders', equipment: 'Dumbbell' },
    { name: 'Dumbbell Goblet Squat', category: 'Dumbbell', muscleGroup: 'Legs', equipment: 'Dumbbell' },
    { name: 'Dumbbell Lunge', category: 'Dumbbell', muscleGroup: 'Legs', equipment: 'Dumbbell' },
    
    // DUMBBELL - Variations
    { name: 'Dumbbell Incline Bench Press', category: 'Dumbbell', muscleGroup: 'Chest', equipment: 'Dumbbell' },
    { name: 'Dumbbell Chest Fly', category: 'Dumbbell', muscleGroup: 'Chest', equipment: 'Dumbbell' },
    { name: 'Dumbbell Front Raise', category: 'Dumbbell', muscleGroup: 'Shoulders', equipment: 'Dumbbell' },
    { name: 'Dumbbell Rear Delt Fly', category: 'Dumbbell', muscleGroup: 'Shoulders', equipment: 'Dumbbell' },
    { name: 'Dumbbell Hammer Curl', category: 'Dumbbell', muscleGroup: 'Arms', equipment: 'Dumbbell' },
    { name: 'Dumbbell Shrug', category: 'Dumbbell', muscleGroup: 'Back', equipment: 'Dumbbell' },
    { name: 'Dumbbell Romanian Deadlift', category: 'Dumbbell', muscleGroup: 'Legs', equipment: 'Dumbbell' },
    { name: 'Dumbbell Bulgarian Split Squat', category: 'Dumbbell', muscleGroup: 'Legs', equipment: 'Dumbbell' },
    { name: 'Dumbbell Skull Crusher', category: 'Dumbbell', muscleGroup: 'Arms', equipment: 'Dumbbell' },
    
    // MACHINES - Essential
    { name: 'Leg Press', category: 'Machine', muscleGroup: 'Legs', equipment: 'Machine' },
    { name: 'Leg Curl', category: 'Machine', muscleGroup: 'Legs', equipment: 'Machine' },
    { name: 'Leg Extension', category: 'Machine', muscleGroup: 'Legs', equipment: 'Machine' },
    { name: 'Lat Pulldown', category: 'Machine', muscleGroup: 'Back', equipment: 'Machine' },
    { name: 'Cable Row', category: 'Machine', muscleGroup: 'Back', equipment: 'Machine' },
    { name: 'Chest Press Machine', category: 'Machine', muscleGroup: 'Chest', equipment: 'Machine' },
    
    // MACHINES - Additional
    { name: 'Smith Machine Squat', category: 'Machine', muscleGroup: 'Legs', equipment: 'Machine' },
    { name: 'Smith Machine Bench Press', category: 'Machine', muscleGroup: 'Chest', equipment: 'Machine' },
    { name: 'Hack Squat', category: 'Machine', muscleGroup: 'Legs', equipment: 'Machine' },
    { name: 'Calf Raise Machine', category: 'Machine', muscleGroup: 'Legs', equipment: 'Machine' },
    { name: 'Pec Deck Fly', category: 'Machine', muscleGroup: 'Chest', equipment: 'Machine' },
    { name: 'Shoulder Press Machine', category: 'Machine', muscleGroup: 'Shoulders', equipment: 'Machine' },
    { name: 'Hip Abductor Machine', category: 'Machine', muscleGroup: 'Legs', equipment: 'Machine' },
    { name: 'Hip Adductor Machine', category: 'Machine', muscleGroup: 'Legs', equipment: 'Machine' },
    { name: 'Preacher Curl Machine', category: 'Machine', muscleGroup: 'Arms', equipment: 'Machine' },
    
    // BODYWEIGHT - Essential
    { name: 'Pull-up', category: 'Bodyweight', muscleGroup: 'Back', equipment: 'Bodyweight' },
    { name: 'Push-up', category: 'Bodyweight', muscleGroup: 'Chest', equipment: 'Bodyweight' },
    { name: 'Dip', category: 'Bodyweight', muscleGroup: 'Chest', equipment: 'Bodyweight' },
    { name: 'Chin-up', category: 'Bodyweight', muscleGroup: 'Back', equipment: 'Bodyweight' },
    
    // BODYWEIGHT - Additional
    { name: 'Bodyweight Squat', category: 'Bodyweight', muscleGroup: 'Legs', equipment: 'Bodyweight' },
    { name: 'Plank', category: 'Bodyweight', muscleGroup: 'Core', equipment: 'Bodyweight' },
    { name: 'Sit-up', category: 'Bodyweight', muscleGroup: 'Core', equipment: 'Bodyweight' },
    { name: 'Lunge', category: 'Bodyweight', muscleGroup: 'Legs', equipment: 'Bodyweight' },
    { name: 'Glute Bridge', category: 'Bodyweight', muscleGroup: 'Legs', equipment: 'Bodyweight' },
    { name: 'Hanging Leg Raise', category: 'Bodyweight', muscleGroup: 'Core', equipment: 'Bodyweight' },
    { name: 'Mountain Climber', category: 'Bodyweight', muscleGroup: 'Core', equipment: 'Bodyweight' },
    { name: 'Burpee', category: 'Bodyweight', muscleGroup: 'Cardio', equipment: 'Bodyweight' },
    
    // CABLE - Essential
    { name: 'Cable Fly', category: 'Cable', muscleGroup: 'Chest', equipment: 'Cable' },
    { name: 'Cable Tricep Pushdown', category: 'Cable', muscleGroup: 'Arms', equipment: 'Cable' },
    { name: 'Cable Bicep Curl', category: 'Cable', muscleGroup: 'Arms', equipment: 'Cable' },
    { name: 'Cable Face Pull', category: 'Cable', muscleGroup: 'Shoulders', equipment: 'Cable' },
    
    // CABLE - Additional
    { name: 'Cable Lateral Raise', category: 'Cable', muscleGroup: 'Shoulders', equipment: 'Cable' },
    { name: 'Cable Rope Hammer Curl', category: 'Cable', muscleGroup: 'Arms', equipment: 'Cable' },
    { name: 'Cable Woodchop', category: 'Cable', muscleGroup: 'Core', equipment: 'Cable' },
    { name: 'Cable Crunch', category: 'Cable', muscleGroup: 'Core', equipment: 'Cable' },
    { name: 'Cable Overhead Tricep Extension', category: 'Cable', muscleGroup: 'Arms', equipment: 'Cable' },
    { name: 'Cable Upright Row', category: 'Cable', muscleGroup: 'Shoulders', equipment: 'Cable' },
    
    // EZ BAR
    { name: 'EZ Bar Curl', category: 'EZ Bar', muscleGroup: 'Arms', equipment: 'EZ Bar' },
    { name: 'EZ Bar Skull Crusher', category: 'EZ Bar', muscleGroup: 'Arms', equipment: 'EZ Bar' },
    { name: 'EZ Bar Preacher Curl', category: 'EZ Bar', muscleGroup: 'Arms', equipment: 'EZ Bar' },
    
    // TRAP BAR
    { name: 'Trap Bar Deadlift', category: 'Trap Bar', muscleGroup: 'Legs', equipment: 'Trap Bar' },
    
    // KETTLEBELL
    { name: 'Kettlebell Swing', category: 'Kettlebell', muscleGroup: 'Legs', equipment: 'Kettlebell' },
    { name: 'Kettlebell Goblet Squat', category: 'Kettlebell', muscleGroup: 'Legs', equipment: 'Kettlebell' },
    { name: 'Kettlebell Turkish Get-Up', category: 'Kettlebell', muscleGroup: 'Core', equipment: 'Kettlebell' },
    
    // CARDIO - Machine-based
    { name: 'Treadmill Running', category: 'Cardio', muscleGroup: 'Cardio', equipment: 'Treadmill' },
    { name: 'Treadmill Walking', category: 'Cardio', muscleGroup: 'Cardio', equipment: 'Treadmill' },
    { name: 'Treadmill Incline Walking', category: 'Cardio', muscleGroup: 'Cardio', equipment: 'Treadmill' },
    { name: 'Treadmill Sprints', category: 'Cardio', muscleGroup: 'Cardio', equipment: 'Treadmill' },
    { name: 'Stationary Bike', category: 'Cardio', muscleGroup: 'Cardio', equipment: 'Bike' },
    { name: 'Assault Bike', category: 'Cardio', muscleGroup: 'Cardio', equipment: 'Bike' },
    { name: 'Spin Bike', category: 'Cardio', muscleGroup: 'Cardio', equipment: 'Bike' },
    { name: 'Rowing Machine', category: 'Cardio', muscleGroup: 'Cardio', equipment: 'Rowing Machine' },
    { name: 'Elliptical', category: 'Cardio', muscleGroup: 'Cardio', equipment: 'Elliptical' },
    { name: 'Stair Climber', category: 'Cardio', muscleGroup: 'Cardio', equipment: 'Stair Climber' },
    { name: 'StairMaster', category: 'Cardio', muscleGroup: 'Cardio', equipment: 'StairMaster' },
    { name: 'VersaClimber', category: 'Cardio', muscleGroup: 'Cardio', equipment: 'VersaClimber' },
    { name: 'Ski Erg', category: 'Cardio', muscleGroup: 'Cardio', equipment: 'Ski Erg' },
    
    // CARDIO - Bodyweight/Outdoor
    { name: 'Running (Outdoor)', category: 'Cardio', muscleGroup: 'Cardio', equipment: 'None' },
    { name: 'Walking (Outdoor)', category: 'Cardio', muscleGroup: 'Cardio', equipment: 'None' },
    { name: 'Jump Rope', category: 'Cardio', muscleGroup: 'Cardio', equipment: 'Jump Rope' },
    { name: 'Box Jumps', category: 'Cardio', muscleGroup: 'Cardio', equipment: 'Box' },
    { name: 'Battle Ropes', category: 'Cardio', muscleGroup: 'Cardio', equipment: 'Battle Ropes' },
    { name: 'Swimming', category: 'Cardio', muscleGroup: 'Cardio', equipment: 'Pool' },
    { name: 'Cycling (Outdoor)', category: 'Cardio', muscleGroup: 'Cardio', equipment: 'Bike' },
    
    // CARDIO - HIIT/Conditioning
    { name: 'Sled Push', category: 'Cardio', muscleGroup: 'Cardio', equipment: 'Sled' },
    { name: 'Sled Pull', category: 'Cardio', muscleGroup: 'Cardio', equipment: 'Sled' },
    { name: 'Farmers Walk', category: 'Cardio', muscleGroup: 'Cardio', equipment: 'Dumbbells' },

    // IMAGE LIBRARY EXERCISES (252 exercises with images)
    ...IMAGE_EXERCISES,
  ];

  const now = Date.now();
  for (const exercise of exercises) {
    db.runSync(
      'INSERT OR IGNORE INTO exercise_library (id, name, category, muscle_group, equipment, image_key, is_custom, created_at) VALUES (?, ?, ?, ?, ?, ?, 0, ?)',
      [generateUUID(), exercise.name, exercise.category, exercise.muscleGroup, exercise.equipment, exercise.imageKey ?? null, now]
    );
  }
};

const updateExerciseImageKeys = (db: SQLite.SQLiteDatabase) => {
  const updates: [string, string][] = [
    ['Barbell Back Squat',              'barbell-squat'],
    ['Barbell Bench Press',             'bench-press'],
    ['Barbell Deadlift',                'barbell-dead-lifts'],
    ['Barbell Overhead Press',          'barbell-shoulder-press'],
    ['Barbell Row',                     'rear-deltoid-row-barbell'],
    ['Barbell Front Squat',             'front-squat-with-barbell'],
    ['Barbell Romanian Deadlift',       'romanian-dead-lift'],
    ['Barbell Hip Thrust',              'bridging'],
    ['Barbell Incline Bench Press',     'incline-bench-press'],
    ['Barbell Curl',                    'bicep-curls-with-barbell'],
    ['Barbell Close-Grip Bench Press',  'close-grip-barbell-bench-press'],
    ['Barbell Good Morning',            'barbell-good-mornings'],
    ['Barbell Shrug',                   'barbell-shrugs'],
    ['Dumbbell Bench Press',            'bench-press-dumbbell'],
    ['Dumbbell Shoulder Press',         'dumbbell-shoulder-press'],
    ['Dumbbell Row',                    'rear-deltoid-row-dumbbell'],
    ['Dumbbell Bicep Curl',             'biceps-curl-with-dumbbell'],
    ['Dumbbell Tricep Extension',       'lying-triceps-extension-with-dumbbells'],
    ['Dumbbell Lateral Raise',          'lateral-dumbbell-raises'],
    ['Dumbbell Goblet Squat',           'pile-squat-with-dumbbell'],
    ['Dumbbell Lunge',                  'dumbbell-lunges'],
    ['Dumbbell Incline Bench Press',    'dumbbell-incline-bench-press'],
    ['Dumbbell Chest Fly',              'dumbbell-flys'],
    ['Dumbbell Front Raise',            'front-dumbbell-raise'],
    ['Dumbbell Rear Delt Fly',          'lying-rear-lateral-raise'],
    ['Dumbbell Hammer Curl',            'bicep-hammer-curl-with-dumbbell'],
    ['Dumbbell Shrug',                  'shoulder-shrugs'],
    ['Dumbbell Romanian Deadlift',      'dumbbell-dead-lifts'],
    ['Dumbbell Skull Crusher',          'lying-triceps-extension-with-dumbbells'],
    ['Leg Press',                       'leg-press'],
    ['Leg Curl',                        'lying-leg-curl-machine'],
    ['Leg Extension',                   'leg-extensions'],
    ['Lat Pulldown',                    'wide-grip-lat-pull-down'],
    ['Cable Row',                       'seated-cable-rows'],
    ['Chest Press Machine',             'machine-bench-press'],
    ['Smith Machine Squat',             'smith-machine-squats'],
    ['Smith Machine Bench Press',       'smith-machine-bench-press'],
    ['Hack Squat',                      'hack-squat-machine'],
    ['Calf Raise Machine',              'standing-calf-raises-using-machine'],
    ['Pec Deck Fly',                    'butterfly-machine'],
    ['Shoulder Press Machine',          'seated-shoulder-press-machine'],
    ['Hip Abductor Machine',            'thigh-abductor'],
    ['Hip Adductor Machine',            'thigh-adductor'],
    ['Preacher Curl Machine',           'preacher-curl-with-machine'],
    ['Pull-up',                         'pull-ups'],
    ['Push-up',                         'push-ups'],
    ['Dip',                             'tricep-dips'],
    ['Chin-up',                         'chin-ups'],
    ['Plank',                           'side-plank'],
    ['Sit-up',                          'crunches'],
    ['Lunge',                           'walking-lunges'],
    ['Glute Bridge',                    'bridging'],
    ['Hanging Leg Raise',               'flat-bench-leg-raises'],
    ['Cable Fly',                       'cable-crossover'],
    ['Cable Tricep Pushdown',           'triceps-pushdown-with-cable'],
    ['Cable Bicep Curl',                'standing-biceps-curl-with-cable'],
    ['Cable Rope Hammer Curl',          'hammer-curls-with-rope-and-cable'],
    ['Cable Crunch',                    'seated-ab-crunch-with-cable'],
    ['Cable Overhead Tricep Extension', 'kneeling-triceps-extension-with-cable'],
    ['Cable Upright Row',               'upright-cable-row'],
    ['EZ Bar Curl',                     'ez-bar-curl-with-barbell'],
    ['EZ Bar Skull Crusher',            'decline-ez-bar-triceps-extension-with-barbell'],
    ['EZ Bar Preacher Curl',            'close-grip-ez-bar-curl-with-barbell'],
  ];
  for (const [name, imageKey] of updates) {
    db.runSync(
      'UPDATE exercise_library SET image_key = ? WHERE name = ? AND image_key IS NULL',
      [imageKey, name]
    );
  }
};
