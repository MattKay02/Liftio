import { getDb } from './db';
import { generateUUID } from '@/lib/utils/uuid';

interface ExerciseConfig {
  name: string;
  cardioMode: 'time_distance' | 'time' | null;
  baseWeight: number;
  weeklyIncrease: number;
  minReps: number;
  maxReps: number;
  numSets: number;
}

const PUSH: ExerciseConfig[] = [
  { name: 'Barbell Bench Press',          cardioMode: null, baseWeight: 135, weeklyIncrease: 2.5,  minReps: 5,  maxReps: 8,  numSets: 4 },
  { name: 'Barbell Overhead Press',       cardioMode: null, baseWeight: 95,  weeklyIncrease: 2.5,  minReps: 5,  maxReps: 8,  numSets: 4 },
  { name: 'Dumbbell Incline Bench Press', cardioMode: null, baseWeight: 55,  weeklyIncrease: 2.5,  minReps: 8,  maxReps: 12, numSets: 3 },
  { name: 'Cable Tricep Pushdown',        cardioMode: null, baseWeight: 40,  weeklyIncrease: 2.5,  minReps: 10, maxReps: 15, numSets: 3 },
  { name: 'Dumbbell Lateral Raise',       cardioMode: null, baseWeight: 20,  weeklyIncrease: 1.25, minReps: 12, maxReps: 15, numSets: 3 },
];

const PULL: ExerciseConfig[] = [
  { name: 'Barbell Deadlift',    cardioMode: null, baseWeight: 185, weeklyIncrease: 5,    minReps: 4,  maxReps: 6,  numSets: 3 },
  { name: 'Barbell Row',         cardioMode: null, baseWeight: 135, weeklyIncrease: 2.5,  minReps: 6,  maxReps: 10, numSets: 4 },
  { name: 'Pull-up',             cardioMode: null, baseWeight: 0,   weeklyIncrease: 0,    minReps: 6,  maxReps: 10, numSets: 3 },
  { name: 'Cable Row',           cardioMode: null, baseWeight: 100, weeklyIncrease: 2.5,  minReps: 10, maxReps: 12, numSets: 3 },
  { name: 'Dumbbell Bicep Curl', cardioMode: null, baseWeight: 35,  weeklyIncrease: 1.25, minReps: 10, maxReps: 12, numSets: 3 },
];

const LEGS: ExerciseConfig[] = [
  { name: 'Barbell Back Squat',        cardioMode: null, baseWeight: 155, weeklyIncrease: 5,   minReps: 5,  maxReps: 8,  numSets: 4 },
  { name: 'Leg Press',                 cardioMode: null, baseWeight: 225, weeklyIncrease: 10,  minReps: 8,  maxReps: 12, numSets: 3 },
  { name: 'Barbell Romanian Deadlift', cardioMode: null, baseWeight: 135, weeklyIncrease: 5,   minReps: 8,  maxReps: 10, numSets: 3 },
  { name: 'Leg Curl',                  cardioMode: null, baseWeight: 60,  weeklyIncrease: 2.5, minReps: 10, maxReps: 12, numSets: 3 },
  { name: 'Calf Raise Machine',        cardioMode: null, baseWeight: 90,  weeklyIncrease: 5,   minReps: 12, maxReps: 15, numSets: 3 },
];

const UPPER: ExerciseConfig[] = [
  { name: 'Barbell Bench Press',    cardioMode: null, baseWeight: 135, weeklyIncrease: 2.5,  minReps: 6,  maxReps: 10, numSets: 3 },
  { name: 'Barbell Row',            cardioMode: null, baseWeight: 135, weeklyIncrease: 2.5,  minReps: 6,  maxReps: 10, numSets: 3 },
  { name: 'Barbell Overhead Press', cardioMode: null, baseWeight: 95,  weeklyIncrease: 2.5,  minReps: 6,  maxReps: 10, numSets: 3 },
  { name: 'Pull-up',                cardioMode: null, baseWeight: 0,   weeklyIncrease: 0,    minReps: 6,  maxReps: 10, numSets: 3 },
  { name: 'Dumbbell Lateral Raise', cardioMode: null, baseWeight: 20,  weeklyIncrease: 1.25, minReps: 12, maxReps: 15, numSets: 3 },
  { name: 'Cable Fly',              cardioMode: null, baseWeight: 30,  weeklyIncrease: 2.5,  minReps: 12, maxReps: 15, numSets: 3 },
];

const TREADMILL: ExerciseConfig = {
  name: 'Treadmill Running', cardioMode: 'time_distance',
  baseWeight: 0, weeklyIncrease: 0, minReps: 0, maxReps: 0, numSets: 1,
};

const BIKE: ExerciseConfig = {
  name: 'Stationary Bike', cardioMode: 'time',
  baseWeight: 0, weeklyIncrease: 0, minReps: 0, maxReps: 0, numSets: 1,
};

// 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
const SCHEDULE: Record<number, { name: string; exercises: ExerciseConfig[] } | null> = {
  0: null,
  1: { name: 'Push',   exercises: PUSH },
  2: { name: 'Pull',   exercises: PULL },
  3: { name: 'Cardio', exercises: [TREADMILL] },
  4: { name: 'Legs',   exercises: LEGS },
  5: { name: 'Upper',  exercises: UPPER },
  6: { name: 'Cardio', exercises: [BIKE] },
};

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function roundTo(value: number, nearest: number): number {
  return Math.round(value / nearest) * nearest;
}

export function countExistingWorkouts(): number {
  const db = getDb();
  const result = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM workouts WHERE is_template = 0'
  );
  return result?.count ?? 0;
}

export async function seedDemoData(clearExisting: boolean): Promise<{ workoutsInserted: number }> {
  const db = getDb();

  if (clearExisting) {
    db.runSync('DELETE FROM workouts WHERE is_template = 0');
  }

  const now = Date.now();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 90);
  startDate.setHours(0, 0, 0, 0);

  let workoutsInserted = 0;

  for (let dayOffset = 0; dayOffset < 90; dayOffset++) {
    const workoutDate = new Date(startDate);
    workoutDate.setDate(startDate.getDate() + dayOffset);

    const schedule = SCHEDULE[workoutDate.getDay()];
    if (!schedule) continue;

    // Skip ~10% of scheduled days to look realistic
    if (Math.random() < 0.1) continue;

    const weekNumber = Math.floor(dayOffset / 7);

    // Realistic gym times: morning (6–9am) or evening (5–8pm)
    const gymHour = Math.random() < 0.55 ? randInt(6, 9) : randInt(17, 20);
    workoutDate.setHours(gymHour, randInt(0, 59), 0, 0);

    const workoutId = generateUUID();
    const durationSeconds = randInt(2700, 5400);

    db.runSync(
      'INSERT INTO workouts (id, name, date, duration, notes, is_template, created_at, updated_at) VALUES (?, ?, ?, ?, NULL, 0, ?, ?)',
      [workoutId, schedule.name, workoutDate.getTime(), durationSeconds, now, now]
    );

    schedule.exercises.forEach((ex, orderIndex) => {
      const exerciseId = generateUUID();

      db.runSync(
        'INSERT INTO exercises (id, workout_id, exercise_name, order_index, notes, cardio_mode, created_at) VALUES (?, ?, ?, ?, NULL, ?, ?)',
        [exerciseId, workoutId, ex.name, orderIndex, ex.cardioMode ?? null, now]
      );

      if (ex.cardioMode !== null) {
        // Cardio: single set with duration and optional distance
        const duration = randInt(1800, 2700); // 30–45 min
        let distance = 0;
        if (ex.cardioMode === 'time_distance') {
          const speedKmh = 9 + Math.random() * 3; // 9–12 km/h
          distance = roundTo((duration / 3600) * speedKmh, 0.1);
        }
        db.runSync(
          'INSERT INTO sets (id, exercise_id, set_number, reps, weight, duration, distance, is_completed, created_at) VALUES (?, ?, 1, 0, 0, ?, ?, 1, ?)',
          [generateUUID(), exerciseId, duration, distance, now]
        );
      } else {
        // Strength: progressive overload with slight per-set fatigue drop
        const baseWeight = ex.baseWeight + weekNumber * ex.weeklyIncrease;

        for (let setNum = 1; setNum <= ex.numSets; setNum++) {
          const noise = roundTo((Math.random() - 0.5) * 5, 2.5); // ±2.5 lbs noise
          const fatigueDrop = setNum > 2 ? 2.5 : 0;
          const weight = Math.max(0, roundTo(baseWeight + noise - fatigueDrop, 2.5));
          const reps = randInt(ex.minReps, ex.maxReps);

          db.runSync(
            'INSERT INTO sets (id, exercise_id, set_number, reps, weight, duration, distance, is_completed, created_at) VALUES (?, ?, ?, ?, ?, 0, 0, 1, ?)',
            [generateUUID(), exerciseId, setNum, reps, weight, now]
          );
        }
      }
    });

    workoutsInserted++;
  }

  return { workoutsInserted };
}
