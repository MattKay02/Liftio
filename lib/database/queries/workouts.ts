import { getDb } from '../db';
import { WorkoutWithExercises, ExerciseWithSets, WorkoutSet } from '@/types/workout';
import { generateUUID } from '@/lib/utils/uuid';

interface WorkoutRow {
  id: string;
  name: string;
  date: number;
  duration: number | null;
  notes: string | null;
  is_template: number;
  created_at: number;
  updated_at: number;
}

interface ExerciseRow {
  id: string;
  workout_id: string;
  exercise_name: string;
  order_index: number;
  notes: string | null;
  created_at: number;
}

interface SetRow {
  id: string;
  exercise_id: string;
  set_number: number;
  reps: number;
  weight: number;
  duration: number;
  is_completed: number;
  created_at: number;
}

export const saveWorkout = (workout: WorkoutWithExercises) => {
  const db = getDb();

  db.runSync(
    `INSERT INTO workouts (id, name, date, duration, notes, is_template, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      workout.id,
      workout.name,
      workout.date,
      workout.duration,
      workout.notes,
      workout.isTemplate ? 1 : 0,
      workout.createdAt,
      workout.updatedAt,
    ]
  );

  for (const exercise of workout.exercises) {
    db.runSync(
      `INSERT INTO exercises (id, workout_id, exercise_name, order_index, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        exercise.id,
        workout.id,
        exercise.exerciseName,
        exercise.orderIndex,
        exercise.notes,
        exercise.createdAt,
      ]
    );

    for (const set of exercise.sets) {
      db.runSync(
        `INSERT INTO sets (id, exercise_id, set_number, reps, weight, duration, is_completed, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          set.id,
          exercise.id,
          set.setNumber,
          set.reps,
          set.weight,
          set.duration ?? 0,
          set.isCompleted ? 1 : 0,
          set.createdAt,
        ]
      );
    }
  }
};

export const getRecentWorkouts = (limit: number = 20): WorkoutWithExercises[] => {
  const db = getDb();

  const workoutRows = db.getAllSync<WorkoutRow>(
    'SELECT * FROM workouts WHERE is_template = 0 ORDER BY date DESC LIMIT ?',
    [limit]
  );

  return workoutRows.map(mapWorkoutWithExercises);
};

export const getAllWorkouts = (limit: number = 100): WorkoutWithExercises[] => {
  const db = getDb();

  const workoutRows = db.getAllSync<WorkoutRow>(
    'SELECT * FROM workouts WHERE is_template = 0 ORDER BY date DESC LIMIT ?',
    [limit]
  );

  return workoutRows.map(mapWorkoutWithExercises);
};

export const getRecentTemplates = (limit: number = 5): WorkoutWithExercises[] => {
  const db = getDb();

  const workoutRows = db.getAllSync<WorkoutRow>(
    'SELECT * FROM workouts ORDER BY date DESC LIMIT ?',
    [limit]
  );

  return workoutRows.map(mapWorkoutWithExercises);
};

export const getCustomTemplates = (): WorkoutWithExercises[] => {
  const db = getDb();

  const workoutRows = db.getAllSync<WorkoutRow>(
    'SELECT * FROM workouts WHERE is_template = 1 ORDER BY created_at DESC'
  );

  return workoutRows.map(mapWorkoutWithExercises);
};

export const getCompletedWorkouts = (limit: number = 20): WorkoutWithExercises[] => {
  const db = getDb();

  const workoutRows = db.getAllSync<WorkoutRow>(
    'SELECT * FROM workouts WHERE is_template = 0 ORDER BY date DESC LIMIT ?',
    [limit]
  );

  return workoutRows.map(mapWorkoutWithExercises);
};

export const saveTemplate = (name: string, exerciseNames: string[]) => {
  const db = getDb();
  const now = Date.now();
  const workoutId = generateUUID();

  db.runSync(
    `INSERT INTO workouts (id, name, date, duration, notes, is_template, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 1, ?, ?)`,
    [workoutId, name, 0, null, null, now, now]
  );

  for (let i = 0; i < exerciseNames.length; i++) {
    const exerciseId = generateUUID();

    db.runSync(
      `INSERT INTO exercises (id, workout_id, exercise_name, order_index, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [exerciseId, workoutId, exerciseNames[i], i, null, now]
    );

    // Create 3 empty sets per exercise as a framework
    for (let j = 1; j <= 3; j++) {
      db.runSync(
        `INSERT INTO sets (id, exercise_id, set_number, reps, weight, is_completed, created_at)
         VALUES (?, ?, ?, 0, 0, 0, ?)`,
        [generateUUID(), exerciseId, j, now]
      );
    }
  }
};

export const getWorkoutById = (id: string): WorkoutWithExercises | null => {
  const db = getDb();

  const row = db.getFirstSync<WorkoutRow>(
    'SELECT * FROM workouts WHERE id = ?',
    [id]
  );

  if (!row) return null;
  return mapWorkoutWithExercises(row);
};

export const updateWorkout = (workout: WorkoutWithExercises) => {
  const db = getDb();

  // Delete existing exercises and sets for this workout
  const exerciseRows = db.getAllSync<{ id: string }>(
    'SELECT id FROM exercises WHERE workout_id = ?',
    [workout.id]
  );
  for (const er of exerciseRows) {
    db.runSync('DELETE FROM sets WHERE exercise_id = ?', [er.id]);
  }
  db.runSync('DELETE FROM exercises WHERE workout_id = ?', [workout.id]);

  // Update workout row
  db.runSync(
    'UPDATE workouts SET name = ?, notes = ?, updated_at = ? WHERE id = ?',
    [workout.name, workout.notes, Date.now(), workout.id]
  );

  // Re-insert exercises and sets
  for (const exercise of workout.exercises) {
    db.runSync(
      `INSERT INTO exercises (id, workout_id, exercise_name, order_index, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        exercise.id,
        workout.id,
        exercise.exerciseName,
        exercise.orderIndex,
        exercise.notes,
        exercise.createdAt,
      ]
    );

    for (const set of exercise.sets) {
      db.runSync(
        `INSERT INTO sets (id, exercise_id, set_number, reps, weight, duration, is_completed, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          set.id,
          exercise.id,
          set.setNumber,
          set.reps,
          set.weight,
          set.duration ?? 0,
          set.isCompleted ? 1 : 0,
          set.createdAt,
        ]
      );
    }
  }
};

export const deleteWorkout = (id: string) => {
  const db = getDb();
  db.runSync('DELETE FROM workouts WHERE id = ?', [id]);
};

export const getPreviousSetsForExercise = (exerciseName: string): WorkoutSet[] => {
  const db = getDb();

  const rows = db.getAllSync<SetRow>(
    `SELECT s.* FROM sets s
     INNER JOIN exercises e ON s.exercise_id = e.id
     INNER JOIN workouts w ON e.workout_id = w.id
     WHERE e.exercise_name = ?
     ORDER BY w.date DESC, s.set_number ASC
     LIMIT 10`,
    [exerciseName]
  );

  if (rows.length === 0) return [];

  // Get the exercise_id of the most recent workout's exercise
  const mostRecentExerciseId = rows[0].exercise_id;

  return rows
    .filter((r) => r.exercise_id === mostRecentExerciseId)
    .map(mapSet);
};

const mapWorkoutWithExercises = (row: WorkoutRow): WorkoutWithExercises => {
  const db = getDb();

  const exerciseRows = db.getAllSync<ExerciseRow>(
    'SELECT * FROM exercises WHERE workout_id = ? ORDER BY order_index ASC',
    [row.id]
  );

  const exercises: ExerciseWithSets[] = exerciseRows.map((er) => {
    const setRows = db.getAllSync<SetRow>(
      'SELECT * FROM sets WHERE exercise_id = ? ORDER BY set_number ASC',
      [er.id]
    );

    return {
      id: er.id,
      workoutId: er.workout_id,
      exerciseName: er.exercise_name,
      orderIndex: er.order_index,
      notes: er.notes,
      createdAt: er.created_at,
      sets: setRows.map(mapSet),
    };
  });

  return {
    id: row.id,
    name: row.name,
    date: row.date,
    duration: row.duration,
    notes: row.notes,
    isTemplate: row.is_template === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    exercises,
  };
};

const mapSet = (row: SetRow): WorkoutSet => ({
  id: row.id,
  exerciseId: row.exercise_id,
  setNumber: row.set_number,
  reps: row.reps,
  weight: row.weight,
  duration: row.duration ?? 0,
  isCompleted: row.is_completed === 1,
  createdAt: row.created_at,
});
