import { getDb } from '@/lib/database/db';

// ── Limits ──────────────────────────────────────────
export const MAX_CUSTOM_WORKOUTS = 10;
export const MAX_EXERCISES_PER_WORKOUT = 30;
export const MAX_SETS_PER_EXERCISE = 30;
export const MAX_NOTES_LENGTH = 500;
export const MAX_WORKOUT_NAME_LENGTH = 50;
export const MAX_EXERCISE_NAME_LENGTH = 50;
export const MAX_WEIGHT = 900;
export const MAX_WEIGHT_DECIMALS = 2;
export const MAX_REPS = 250;

// ── Reps ────────────────────────────────────────────
/** Sanitize reps input: integers only, clamped to 0–250 */
export const sanitizeReps = (value: string): string => {
  // Strip anything that isn't a digit
  const digits = value.replace(/[^0-9]/g, '');
  if (digits === '') return '';

  const num = parseInt(digits, 10);
  if (num > MAX_REPS) return MAX_REPS.toString();
  return num.toString();
};

/** Clamp a numeric reps value */
export const clampReps = (value: number): number => {
  return Math.min(Math.max(Math.round(value), 0), MAX_REPS);
};

// ── Weight ──────────────────────────────────────────
/** Sanitize weight input: decimal allowed, clamped to 0–900, max 2 decimal places */
export const sanitizeWeight = (value: string): string => {
  // Allow digits and at most one decimal point
  let cleaned = value.replace(/[^0-9.]/g, '');

  // Remove extra decimal points (keep first)
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    cleaned = parts[0] + '.' + parts.slice(1).join('');
  }

  // Enforce max 2 decimal places
  if (parts.length === 2 && parts[1].length > MAX_WEIGHT_DECIMALS) {
    cleaned = parts[0] + '.' + parts[1].slice(0, MAX_WEIGHT_DECIMALS);
  }

  if (cleaned === '' || cleaned === '.') return cleaned;

  const num = parseFloat(cleaned);
  if (isNaN(num)) return '';
  if (num > MAX_WEIGHT) return MAX_WEIGHT.toString();

  return cleaned;
};

/** Clamp a numeric weight value */
export const clampWeight = (value: number): number => {
  const clamped = Math.min(Math.max(value, 0), MAX_WEIGHT);
  // Round to 2 decimal places
  return Math.round(clamped * 100) / 100;
};

// ── Workout Name ────────────────────────────────────
/** Returns an error message string, or null if valid */
export const validateWorkoutName = (name: string): string | null => {
  const trimmed = name.trim();
  if (trimmed.length === 0) return 'Give your workout a name.';
  if (trimmed.length > MAX_WORKOUT_NAME_LENGTH) {
    return `Name must be ${MAX_WORKOUT_NAME_LENGTH} characters or less.`;
  }
  return null;
};

// ── Template Count ──────────────────────────────────
/** Query DB for current number of custom templates */
export const getCustomTemplateCount = (): number => {
  const db = getDb();
  const row = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM workouts WHERE is_template = 1'
  );
  return row?.count ?? 0;
};
