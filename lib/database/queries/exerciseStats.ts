import { getDb } from '../db';

export interface ExerciseFrequency {
  exerciseName: string;
  workoutCount: number;
}

export interface HighestVolumeSet {
  exerciseName: string;
  reps: number;
  weight: number;
  volume: number;
}

export interface HighestWeightSet {
  exerciseName: string;
  weight: number;
  reps: number;
}

export interface WeightDataPoint {
  date: number;
  weight: number;
}

export const getMostFrequentExercise = (sinceTimestamp?: number): ExerciseFrequency | null => {
  const db = getDb();
  const dateFilter = sinceTimestamp ? 'AND w.date >= ?' : '';
  const params: (string | number)[] = sinceTimestamp ? [sinceTimestamp] : [];

  const row = db.getFirstSync<{ exercise_name: string; workout_count: number }>(
    `SELECT e.exercise_name, COUNT(DISTINCT e.workout_id) AS workout_count
     FROM exercises e
     INNER JOIN workouts w ON e.workout_id = w.id
     WHERE w.is_template = 0 ${dateFilter}
     GROUP BY e.exercise_name
     ORDER BY workout_count DESC, e.exercise_name ASC
     LIMIT 1`,
    params
  );

  if (!row) return null;
  return { exerciseName: row.exercise_name, workoutCount: row.workout_count };
};

export const getHighestVolumeSet = (sinceTimestamp?: number): HighestVolumeSet | null => {
  const db = getDb();
  const dateFilter = sinceTimestamp ? 'AND w.date >= ?' : '';
  const params: (string | number)[] = sinceTimestamp ? [sinceTimestamp] : [];

  const row = db.getFirstSync<{
    exercise_name: string;
    reps: number;
    weight: number;
    volume: number;
  }>(
    `SELECT e.exercise_name, s.reps, s.weight, (s.reps * s.weight) AS volume
     FROM sets s
     INNER JOIN exercises e ON s.exercise_id = e.id
     INNER JOIN workouts w ON e.workout_id = w.id
     WHERE w.is_template = 0 AND s.is_completed = 1 AND s.weight > 0 AND s.reps > 0 ${dateFilter}
     ORDER BY volume DESC
     LIMIT 1`,
    params
  );

  if (!row) return null;
  return {
    exerciseName: row.exercise_name,
    reps: row.reps,
    weight: row.weight,
    volume: row.volume,
  };
};

export const getHighestWeightLifted = (sinceTimestamp?: number): HighestWeightSet | null => {
  const db = getDb();
  const dateFilter = sinceTimestamp ? 'AND w.date >= ?' : '';
  const params: (string | number)[] = sinceTimestamp ? [sinceTimestamp] : [];

  const row = db.getFirstSync<{
    exercise_name: string;
    weight: number;
    reps: number;
  }>(
    `SELECT e.exercise_name, s.weight, s.reps
     FROM sets s
     INNER JOIN exercises e ON s.exercise_id = e.id
     INNER JOIN workouts w ON e.workout_id = w.id
     WHERE w.is_template = 0 AND s.is_completed = 1 AND s.weight > 0 ${dateFilter}
     ORDER BY s.weight DESC
     LIMIT 1`,
    params
  );

  if (!row) return null;
  return { exerciseName: row.exercise_name, weight: row.weight, reps: row.reps };
};

export const getPerformedExerciseNames = (sinceTimestamp?: number): string[] => {
  const db = getDb();
  const dateFilter = sinceTimestamp ? 'AND w.date >= ?' : '';
  const params: (string | number)[] = sinceTimestamp ? [sinceTimestamp] : [];

  const rows = db.getAllSync<{ exercise_name: string }>(
    `SELECT e.exercise_name
     FROM exercises e
     INNER JOIN workouts w ON e.workout_id = w.id
     INNER JOIN sets s ON s.exercise_id = e.id
     WHERE w.is_template = 0 AND s.is_completed = 1 AND s.weight > 0 ${dateFilter}
     GROUP BY e.exercise_name
     ORDER BY COUNT(DISTINCT e.workout_id) DESC, e.exercise_name ASC`,
    params
  );

  return rows.map((r) => r.exercise_name);
};

export const getWeightOverTime = (exerciseName: string, sinceTimestamp?: number): WeightDataPoint[] => {
  const db = getDb();
  const dateFilter = sinceTimestamp ? 'AND w.date >= ?' : '';
  const params: (string | number)[] = [exerciseName];
  if (sinceTimestamp) params.push(sinceTimestamp);

  const rows = db.getAllSync<{ date: number; max_weight: number }>(
    `SELECT w.date, MAX(s.weight) AS max_weight
     FROM sets s
     INNER JOIN exercises e ON s.exercise_id = e.id
     INNER JOIN workouts w ON e.workout_id = w.id
     WHERE w.is_template = 0 AND e.exercise_name = ? AND s.is_completed = 1 AND s.weight > 0 ${dateFilter}
     GROUP BY w.id
     ORDER BY w.date ASC`,
    params
  );

  return rows.map((r) => ({ date: r.date, weight: r.max_weight }));
};
