# Liftio - Database Reference

Only reference this file when working on database-related queries, schema changes, or data operations.

## Tech

- **Expo SQLite** (`expo-sqlite ^16.0.10`) with synchronous API (`runSync`, `getAllSync`, `getFirstSync`)
- WAL journal mode, foreign keys enabled
- Database file: `liftio.db`
- Init: `lib/database/db.ts` → `initializeDatabase()`

## Schema

### workouts

```sql
CREATE TABLE workouts (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  date INTEGER NOT NULL,
  duration INTEGER,
  notes TEXT,
  is_template INTEGER DEFAULT 0,
  premade_id TEXT DEFAULT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX idx_workouts_date ON workouts(date DESC);
```

- `date` and timestamps are `Date.now()` (ms since epoch)
- `is_template = 1` for custom workout templates, `0` for completed workouts
- `premade_id` links a template to a `PremadeWorkout.id` from `constants/PremadeWorkouts.ts` (prevents duplicate adds)

### exercises

```sql
CREATE TABLE exercises (
  id TEXT PRIMARY KEY NOT NULL,
  workout_id TEXT NOT NULL,
  exercise_name TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  notes TEXT,
  cardio_mode TEXT DEFAULT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE
);
CREATE INDEX idx_exercises_workout_id ON exercises(workout_id);
CREATE INDEX idx_exercises_name ON exercises(exercise_name);
```

- `cardio_mode` values: `'time'` | `'time_distance'` | `'time_reps'` | `'distance'` | `'reps'`
- Determines which fields (duration/distance/reps/weight) are tracked for each set
- Auto-set to `'time'` for cardio category exercises when creating templates

### sets

```sql
CREATE TABLE sets (
  id TEXT PRIMARY KEY NOT NULL,
  exercise_id TEXT NOT NULL,
  set_number INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  weight REAL NOT NULL,
  duration INTEGER DEFAULT 0,
  distance REAL DEFAULT 0,
  is_completed INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
);
CREATE INDEX idx_sets_exercise_id ON sets(exercise_id);
```

- `duration` — total seconds (used for cardio time-based modes)
- `distance` — distance in the user's preferred unit (`km` or `mi`)

### exercise_library

```sql
CREATE TABLE exercise_library (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  muscle_group TEXT,
  equipment TEXT,
  image_key TEXT DEFAULT NULL,
  is_custom INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE INDEX idx_exercise_library_category ON exercise_library(category);
```

- Seeded on init with ~330 exercises across: Barbell, Dumbbell, Machine, Bodyweight, Cable, EZ Bar, Trap Bar, Kettlebell, Cardio, Other
- `image_key` maps to a static asset via `lib/exerciseImages.ts` (252 exercises have images)
- Custom exercises created by the user have `is_custom = 1`

### user_settings

```sql
CREATE TABLE user_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  weight_unit TEXT DEFAULT 'lbs',
  distance_unit TEXT DEFAULT 'km',
  default_rest_timer INTEGER DEFAULT 90,
  theme TEXT DEFAULT 'light',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
```

- Single-row table (enforced by `CHECK (id = 1)`)
- `weight_unit`: `'lbs'` | `'kg'`
- `distance_unit`: `'km'` | `'mi'`

## Migrations

Applied as safe no-ops in `initializeDatabase()` via `ALTER TABLE ... ADD COLUMN` (wrapped in try/catch):

| Column | Table | Notes |
|--------|-------|-------|
| `duration INTEGER DEFAULT 0` | `sets` | Cardio time tracking |
| `cardio_mode TEXT DEFAULT NULL` | `exercises` | Cardio tracking mode |
| `distance REAL DEFAULT 0` | `sets` | Cardio distance tracking |
| `distance_unit TEXT DEFAULT 'km'` | `user_settings` | User distance preference |
| `premade_id TEXT DEFAULT NULL` | `workouts` | Premade template deduplication |
| `image_key TEXT DEFAULT NULL` | `exercise_library` | Exercise illustration key |

## TypeScript Types

Defined in `types/workout.ts`:

```typescript
CardioMode        'time' | 'time_distance' | 'time_reps' | 'distance' | 'reps'

Workout           { id, name, date, duration, notes, isTemplate, createdAt, updatedAt }
Exercise          { id, workoutId, exerciseName, orderIndex, notes, cardioMode, createdAt }
WorkoutSet        { id, exerciseId, setNumber, reps, weight, duration, distance, isCompleted, createdAt }
ExerciseLibraryItem { id, name, category, muscleGroup, equipment, isCustom, imageKey, createdAt }
UserSettings      { id, weightUnit, distanceUnit, defaultRestTimer, theme, createdAt, updatedAt }

WorkoutWithExercises extends Workout { exercises: ExerciseWithSets[] }
ExerciseWithSets extends Exercise { sets: WorkoutSet[] }
```

## Query Functions

### `lib/database/queries/workouts.ts`

| Function | Description |
|----------|-------------|
| `saveWorkout(workout)` | Insert a completed workout with all exercises and sets |
| `updateWorkout(workout)` | Delete-and-reinsert exercises/sets, update workout row |
| `deleteWorkout(id)` | Delete a workout (cascades to exercises/sets) |
| `getWorkoutById(id)` | Fetch single workout with exercises and sets |
| `getRecentWorkouts(limit?)` | Non-template workouts, newest first (default 20) |
| `getAllWorkouts(limit?)` | All non-template workouts (default 100) |
| `getCompletedWorkouts(limit?)` | Completed workouts, newest first (default 20) |
| `getCustomTemplates()` | Templates (`is_template = 1`), ordered by `created_at DESC` |
| `getRecentTemplates(limit?)` | Templates only, newest first |
| `saveTemplate(name, exerciseNames, premadeId?)` | Create template with 3 empty sets per exercise; auto-sets `cardio_mode` for cardio exercises |
| `getAddedPremadeIds()` | Returns `Set<string>` of premade IDs already saved as templates |
| `reorderTemplates(orderedIds)` | Reorders templates by manipulating `created_at` timestamps |
| `getPreviousSetsForExercise(name)` | Last workout's sets for a given exercise name (for auto-fill) |

### `lib/database/queries/exerciseLibrary.ts`

Exercise library queries: search, filter by category, add/delete custom exercises.

### `lib/database/queries/exerciseStats.ts`

Stats and analytics queries. All functions accept an optional `sinceTimestamp` (ms epoch) for time-range filtering.

| Function | Returns | Description |
|----------|---------|-------------|
| `getMostFrequentExercise(since?)` | `ExerciseFrequency \| null` | Most performed exercise by workout count |
| `getHighestVolumeSet(since?)` | `HighestVolumeSet \| null` | Set with highest reps × weight |
| `getHighestWeightLifted(since?)` | `HighestWeightSet \| null` | Heaviest completed set |
| `getPerformedExerciseNames(since?)` | `string[]` | All exercises with completed weighted sets, ordered by frequency |
| `getWeightOverTime(name, since?)` | `WeightDataPoint[]` | Max weight per workout session for a given exercise |
| `getOverviewDuration(since?)` | `OverviewDataPoint[]` | Workout duration per session |
| `getOverviewTotalVolume(since?)` | `OverviewDataPoint[]` | Total volume (reps × weight) per session |
| `getOverviewTotalReps(since?)` | `OverviewDataPoint[]` | Total reps per session |
| `getOverviewTotalSets(since?)` | `OverviewDataPoint[]` | Total completed sets per session |
| `getTopExercisesByFrequency(since?)` | `ExerciseFrequencyRow[]` | All exercises ranked by workout count |
| `getExerciseHighestLift(name, since?)` | `ExerciseHighestLift \| null` | Best single-set weight for an exercise |
| `getExerciseHighestVolumeSet(name, since?)` | `ExerciseHighestVolume \| null` | Highest volume set for an exercise |
| `getExerciseVolumeOverTime(name, since?)` | `OverviewDataPoint[]` | Per-session volume for an exercise |
| `getExerciseRepsOverTime(name, since?)` | `OverviewDataPoint[]` | Per-session total reps for an exercise |
| `getExerciseSetsOverTime(name, since?)` | `OverviewDataPoint[]` | Per-session set count for an exercise |

## Patterns

- All IDs are UUIDs generated via `expo-crypto` (`lib/utils/uuid.ts`)
- Queries use synchronous API (`runSync`, `getAllSync`, `getFirstSync`)
- `updateWorkout` uses delete-and-reinsert (no diffing) for simplicity
- Error handling: wrap in `try/catch` + `Alert.alert` at the call site
- `cardio_mode` on an exercise determines which fields (duration/distance/reps/weight) are active in the UI
