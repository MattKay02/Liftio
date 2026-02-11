import { WorkoutWithExercises, ExerciseLibraryItem } from '@/types/workout';

const CSV_HEADER = 'record_type,workout_name,workout_date,workout_duration,workout_notes,is_template,exercise_name,exercise_order,exercise_notes,cardio_mode,set_number,reps,weight,duration,distance,is_completed';

export const escapeCSVField = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

export const buildExportCSV = (
  workouts: WorkoutWithExercises[],
  customExercises: ExerciseLibraryItem[]
): string => {
  const lines: string[] = [CSV_HEADER];

  for (const workout of workouts) {
    for (const exercise of workout.exercises) {
      if (exercise.sets.length === 0) {
        // Exercise with no sets — preserve it as one row with empty set fields
        lines.push([
          'workout',
          escapeCSVField(workout.name),
          workout.date,
          workout.duration ?? '',
          escapeCSVField(workout.notes),
          workout.isTemplate ? 1 : 0,
          escapeCSVField(exercise.exerciseName),
          exercise.orderIndex,
          escapeCSVField(exercise.notes),
          exercise.cardioMode ?? '',
          '', '', '', '', '', '',
        ].join(','));
      } else {
        for (const set of exercise.sets) {
          lines.push([
            'workout',
            escapeCSVField(workout.name),
            workout.date,
            workout.duration ?? '',
            escapeCSVField(workout.notes),
            workout.isTemplate ? 1 : 0,
            escapeCSVField(exercise.exerciseName),
            exercise.orderIndex,
            escapeCSVField(exercise.notes),
            exercise.cardioMode ?? '',
            set.setNumber,
            set.reps,
            set.weight,
            set.duration ?? 0,
            set.distance ?? 0,
            set.isCompleted ? 1 : 0,
          ].join(','));
        }
      }
    }
  }

  // Custom exercise rows: record_type, name (in workout_name col), category (in workout_date col), muscle_group (in workout_duration col)
  for (const ex of customExercises) {
    lines.push([
      'custom_exercise',
      escapeCSVField(ex.name),
      escapeCSVField(ex.category),
      escapeCSVField(ex.muscleGroup),
      '', '', '', '', '', '', '', '', '', '', '', '',
    ].join(','));
  }

  return lines.join('\n');
};
