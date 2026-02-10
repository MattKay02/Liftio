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
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX idx_workouts_date ON workouts(date DESC);
```

- `date` and timestamps are `Date.now()` (ms since epoch)
- `is_template = 1` for custom workout templates, `0` for completed workouts

### exercises

```sql
CREATE TABLE exercises (
  id TEXT PRIMARY KEY NOT NULL,
  workout_id TEXT NOT NULL,
  exercise_name TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  notes TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE
);
CREATE INDEX idx_exercises_workout_id ON exercises(workout_id);
```

### sets

```sql
CREATE TABLE sets (
  id TEXT PRIMARY KEY NOT NULL,
  exercise_id TEXT NOT NULL,
  set_number INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  weight REAL NOT NULL,
  duration INTEGER DEFAULT 0,
  is_completed INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
);
CREATE INDEX idx_sets_exercise_id ON sets(exercise_id);
```

- `duration` column was added via migration (`ALTER TABLE sets ADD COLUMN duration INTEGER DEFAULT 0`)
- Used for cardio exercises (stored as total seconds)

### exercise_library

```sql
CREATE TABLE exercise_library (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  muscle_group TEXT,
  equipment TEXT,
  is_custom INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE INDEX idx_exercise_library_category ON exercise_library(category);
```

- Seeded on init with ~80 exercises across Barbell, Dumbbell, Machine, Bodyweight, Cable, EZ Bar, Trap Bar, Kettlebell, Cardio
- Cardio exercises use `duration` field on sets instead of `reps`/`weight`

### user_settings

```sql
CREATE TABLE user_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  weight_unit TEXT DEFAULT 'lbs',
  default_rest_timer INTEGER DEFAULT 90,
  theme TEXT DEFAULT 'light',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
```

- Single-row table (enforced by `CHECK (id = 1)`)

## TypeScript Types

Defined in `types/workout.ts`:

```typescript
Workout           { id, name, date, duration, notes, isTemplate, createdAt, updatedAt }
Exercise          { id, workoutId, exerciseName, orderIndex, notes, createdAt }
WorkoutSet        { id, exerciseId, setNumber, reps, weight, duration, isCompleted, createdAt }
ExerciseLibraryItem { id, name, category, muscleGroup, equipment, isCustom, createdAt }
UserSettings      { id, weightUnit, defaultRestTimer, theme, createdAt, updatedAt }

WorkoutWithExercises extends Workout { exercises: ExerciseWithSets[] }
ExerciseWithSets extends Exercise { sets: WorkoutSet[] }
```

## Query Functions

All in `lib/database/queries/workouts.ts`:

| Function | Description |
|----------|-------------|
| `saveWorkout(workout)` | Insert a completed workout with all exercises and sets |
| `updateWorkout(workout)` | Delete-and-reinsert exercises/sets, update workout row |
| `deleteWorkout(id)` | Delete a workout (cascades to exercises/sets) |
| `getWorkoutById(id)` | Fetch single workout with exercises and sets |
| `getRecentWorkouts(limit?)` | Non-template workouts, newest first |
| `getAllWorkouts(limit?)` | All non-template workouts |
| `getCompletedWorkouts(limit?)` | Completed workouts (same as non-template) |
| `getCustomTemplates()` | Workouts where `is_template = 1` |
| `getRecentTemplates(limit?)` | All workouts (templates + completed), newest first |
| `saveTemplate(name, exerciseNames)` | Create template with 3 empty sets per exercise |
| `getPreviousSetsForExercise(name)` | Last workout's sets for a given exercise name |

Exercise library queries in `lib/database/queries/exerciseLibrary.ts`.

## Patterns

- All IDs are UUIDs generated via `expo-crypto` (`lib/utils/uuid.ts`)
- Queries use synchronous API (`runSync`, `getAllSync`, `getFirstSync`)
- `updateWorkout` uses delete-and-reinsert (no diffing) for simplicity
- Error handling: wrap in `try/catch` + `Alert.alert` at the call site
