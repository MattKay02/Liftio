let pending: { name: string } | null = null;

export const setPendingExercise = (exercise: { name: string }) => {
  pending = exercise;
};

export const consumePendingExercise = () => {
  const e = pending;
  pending = null;
  return e;
};
