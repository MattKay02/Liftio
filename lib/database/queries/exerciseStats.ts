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

export interface OverviewDataPoint {
  date: number;
  value: number;
}

export interface ExerciseFrequencyRow {
  exerciseName: string;
  workoutCount: number;
}

export interface ExerciseHighestLift {
  weight: number;
  reps: number;
}

export interface ExerciseHighestVolume {
  reps: number;
  weight: number;
  volume: number;
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

// --- Overview chart queries (per-workout data points) ---

export const getOverviewDuration = (sinceTimestamp?: number): OverviewDataPoint[] => {
  const db = getDb();
  const dateFilter = sinceTimestamp ? 'AND w.date >= ?' : '';
  const params: (string | number)[] = sinceTimestamp ? [sinceTimestamp] : [];

  const rows = db.getAllSync<{ date: number; value: number }>(
    `SELECT w.date, w.duration AS value
     FROM workouts w
     WHERE w.is_template = 0 AND w.duration > 0 ${dateFilter}
     ORDER BY w.date ASC`,
    params
  );

  return rows.map((r) => ({ date: r.date, value: r.value }));
};

export const getOverviewTotalVolume = (sinceTimestamp?: number): OverviewDataPoint[] => {
  const db = getDb();
  const dateFilter = sinceTimestamp ? 'AND w.date >= ?' : '';
  const params: (string | number)[] = sinceTimestamp ? [sinceTimestamp] : [];

  const rows = db.getAllSync<{ date: number; value: number }>(
    `SELECT w.date, SUM(s.reps * s.weight) AS value
     FROM sets s
     INNER JOIN exercises e ON s.exercise_id = e.id
     INNER JOIN workouts w ON e.workout_id = w.id
     WHERE w.is_template = 0 AND s.is_completed = 1 AND s.weight > 0 AND s.reps > 0 ${dateFilter}
     GROUP BY w.id
     ORDER BY w.date ASC`,
    params
  );

  return rows.map((r) => ({ date: r.date, value: r.value }));
};

export const getOverviewTotalReps = (sinceTimestamp?: number): OverviewDataPoint[] => {
  const db = getDb();
  const dateFilter = sinceTimestamp ? 'AND w.date >= ?' : '';
  const params: (string | number)[] = sinceTimestamp ? [sinceTimestamp] : [];

  const rows = db.getAllSync<{ date: number; value: number }>(
    `SELECT w.date, SUM(s.reps) AS value
     FROM sets s
     INNER JOIN exercises e ON s.exercise_id = e.id
     INNER JOIN workouts w ON e.workout_id = w.id
     WHERE w.is_template = 0 AND s.is_completed = 1 AND s.reps > 0 ${dateFilter}
     GROUP BY w.id
     ORDER BY w.date ASC`,
    params
  );

  return rows.map((r) => ({ date: r.date, value: r.value }));
};

export const getOverviewTotalSets = (sinceTimestamp?: number): OverviewDataPoint[] => {
  const db = getDb();
  const dateFilter = sinceTimestamp ? 'AND w.date >= ?' : '';
  const params: (string | number)[] = sinceTimestamp ? [sinceTimestamp] : [];

  const rows = db.getAllSync<{ date: number; value: number }>(
    `SELECT w.date, COUNT(s.id) AS value
     FROM sets s
     INNER JOIN exercises e ON s.exercise_id = e.id
     INNER JOIN workouts w ON e.workout_id = w.id
     WHERE w.is_template = 0 AND s.is_completed = 1 ${dateFilter}
     GROUP BY w.id
     ORDER BY w.date ASC`,
    params
  );

  return rows.map((r) => ({ date: r.date, value: r.value }));
};

// --- Exercise frequency ---

export const getTopExercisesByFrequency = (sinceTimestamp?: number): ExerciseFrequencyRow[] => {
  const db = getDb();
  const dateFilter = sinceTimestamp ? 'AND w.date >= ?' : '';
  const params: (string | number)[] = sinceTimestamp ? [sinceTimestamp] : [];

  const rows = db.getAllSync<{ exercise_name: string; workout_count: number }>(
    `SELECT e.exercise_name, COUNT(DISTINCT e.workout_id) AS workout_count
     FROM exercises e
     INNER JOIN workouts w ON e.workout_id = w.id
     INNER JOIN sets s ON s.exercise_id = e.id
     WHERE w.is_template = 0 AND s.is_completed = 1 ${dateFilter}
     GROUP BY e.exercise_name
     ORDER BY workout_count DESC, e.exercise_name ASC`,
    params
  );

  return rows.map((r) => ({ exerciseName: r.exercise_name, workoutCount: r.workout_count }));
};

// --- Per-exercise detail queries ---

export const getExerciseHighestLift = (exerciseName: string, sinceTimestamp?: number): ExerciseHighestLift | null => {
  const db = getDb();
  const dateFilter = sinceTimestamp ? 'AND w.date >= ?' : '';
  const params: (string | number)[] = [exerciseName];
  if (sinceTimestamp) params.push(sinceTimestamp);

  const row = db.getFirstSync<{ weight: number; reps: number }>(
    `SELECT s.weight, s.reps
     FROM sets s
     INNER JOIN exercises e ON s.exercise_id = e.id
     INNER JOIN workouts w ON e.workout_id = w.id
     WHERE e.exercise_name = ? AND w.is_template = 0 AND s.is_completed = 1 AND s.weight > 0 ${dateFilter}
     ORDER BY s.weight DESC
     LIMIT 1`,
    params
  );

  if (!row) return null;
  return { weight: row.weight, reps: row.reps };
};

export const getExerciseHighestVolumeSet = (exerciseName: string, sinceTimestamp?: number): ExerciseHighestVolume | null => {
  const db = getDb();
  const dateFilter = sinceTimestamp ? 'AND w.date >= ?' : '';
  const params: (string | number)[] = [exerciseName];
  if (sinceTimestamp) params.push(sinceTimestamp);

  const row = db.getFirstSync<{ reps: number; weight: number; volume: number }>(
    `SELECT s.reps, s.weight, (s.reps * s.weight) AS volume
     FROM sets s
     INNER JOIN exercises e ON s.exercise_id = e.id
     INNER JOIN workouts w ON e.workout_id = w.id
     WHERE e.exercise_name = ? AND w.is_template = 0 AND s.is_completed = 1 AND s.weight > 0 AND s.reps > 0 ${dateFilter}
     ORDER BY volume DESC
     LIMIT 1`,
    params
  );

  if (!row) return null;
  return { reps: row.reps, weight: row.weight, volume: row.volume };
};

export const getExerciseVolumeOverTime = (exerciseName: string, sinceTimestamp?: number): OverviewDataPoint[] => {
  const db = getDb();
  const dateFilter = sinceTimestamp ? 'AND w.date >= ?' : '';
  const params: (string | number)[] = [exerciseName];
  if (sinceTimestamp) params.push(sinceTimestamp);

  const rows = db.getAllSync<{ date: number; value: number }>(
    `SELECT w.date, SUM(s.reps * s.weight) AS value
     FROM sets s
     INNER JOIN exercises e ON s.exercise_id = e.id
     INNER JOIN workouts w ON e.workout_id = w.id
     WHERE e.exercise_name = ? AND w.is_template = 0 AND s.is_completed = 1 AND s.weight > 0 AND s.reps > 0 ${dateFilter}
     GROUP BY w.id
     ORDER BY w.date ASC`,
    params
  );

  return rows.map((r) => ({ date: r.date, value: r.value }));
};

export const getExerciseRepsOverTime = (exerciseName: string, sinceTimestamp?: number): OverviewDataPoint[] => {
  const db = getDb();
  const dateFilter = sinceTimestamp ? 'AND w.date >= ?' : '';
  const params: (string | number)[] = [exerciseName];
  if (sinceTimestamp) params.push(sinceTimestamp);

  const rows = db.getAllSync<{ date: number; value: number }>(
    `SELECT w.date, SUM(s.reps) AS value
     FROM sets s
     INNER JOIN exercises e ON s.exercise_id = e.id
     INNER JOIN workouts w ON e.workout_id = w.id
     WHERE e.exercise_name = ? AND w.is_template = 0 AND s.is_completed = 1 AND s.reps > 0 ${dateFilter}
     GROUP BY w.id
     ORDER BY w.date ASC`,
    params
  );

  return rows.map((r) => ({ date: r.date, value: r.value }));
};

export const getExerciseSetsOverTime = (exerciseName: string, sinceTimestamp?: number): OverviewDataPoint[] => {
  const db = getDb();
  const dateFilter = sinceTimestamp ? 'AND w.date >= ?' : '';
  const params: (string | number)[] = [exerciseName];
  if (sinceTimestamp) params.push(sinceTimestamp);

  const rows = db.getAllSync<{ date: number; value: number }>(
    `SELECT w.date, COUNT(s.id) AS value
     FROM sets s
     INNER JOIN exercises e ON s.exercise_id = e.id
     INNER JOIN workouts w ON e.workout_id = w.id
     WHERE e.exercise_name = ? AND w.is_template = 0 AND s.is_completed = 1 ${dateFilter}
     GROUP BY w.id
     ORDER BY w.date ASC`,
    params
  );

  return rows.map((r) => ({ date: r.date, value: r.value }));
};
