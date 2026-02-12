export interface PremadeWorkout {
  id: string;
  name: string;
  description: string;
  exercises: string[];
}

export const PREMADE_WORKOUTS: PremadeWorkout[] = [
  {
    id: 'push',
    name: 'Push',
    description: 'Chest, shoulders & triceps',
    exercises: [
      'Barbell Bench Press',
      'Barbell Incline Bench Press',
      'Dumbbell Shoulder Press',
      'Cable Fly',
      'Dumbbell Lateral Raise',
      'Cable Tricep Pushdown',
    ],
  },
  {
    id: 'pull',
    name: 'Pull',
    description: 'Back & biceps',
    exercises: [
      'Barbell Deadlift',
      'Barbell Row',
      'Lat Pulldown',
      'Cable Row',
      'Dumbbell Bicep Curl',
      'Cable Face Pull',
    ],
  },
  {
    id: 'legs',
    name: 'Legs',
    description: 'Quads, hamstrings & calves',
    exercises: [
      'Barbell Back Squat',
      'Barbell Romanian Deadlift',
      'Leg Press',
      'Leg Curl',
      'Leg Extension',
      'Calf Raise Machine',
    ],
  },
  {
    id: 'upper',
    name: 'Upper Body',
    description: 'Chest, back, shoulders & arms',
    exercises: [
      'Barbell Bench Press',
      'Barbell Overhead Press',
      'Barbell Row',
      'Lat Pulldown',
      'Dumbbell Lateral Raise',
      'EZ Bar Curl',
      'Cable Tricep Pushdown',
    ],
  },
  {
    id: 'lower',
    name: 'Lower Body',
    description: 'Quads, glutes, hamstrings & calves',
    exercises: [
      'Barbell Back Squat',
      'Barbell Romanian Deadlift',
      'Barbell Hip Thrust',
      'Leg Press',
      'Leg Curl',
      'Calf Raise Machine',
    ],
  },
  {
    id: 'full-body',
    name: 'Full Body',
    description: 'All major muscle groups',
    exercises: [
      'Barbell Back Squat',
      'Barbell Bench Press',
      'Barbell Row',
      'Barbell Overhead Press',
      'Barbell Romanian Deadlift',
      'Dumbbell Bicep Curl',
      'Cable Tricep Pushdown',
    ],
  },
  {
    id: 'chest-triceps',
    name: 'Chest & Triceps',
    description: 'Pressing & tricep isolation',
    exercises: [
      'Barbell Bench Press',
      'Dumbbell Incline Bench Press',
      'Cable Fly',
      'Dip',
      'Cable Tricep Pushdown',
      'Dumbbell Skull Crusher',
    ],
  },
  {
    id: 'back-biceps',
    name: 'Back & Biceps',
    description: 'Pulling & bicep isolation',
    exercises: [
      'Barbell Deadlift',
      'Lat Pulldown',
      'Dumbbell Row',
      'Cable Row',
      'EZ Bar Curl',
      'Dumbbell Hammer Curl',
    ],
  },
  {
    id: 'shoulders-arms',
    name: 'Shoulders & Arms',
    description: 'Delts, biceps & triceps',
    exercises: [
      'Barbell Overhead Press',
      'Dumbbell Lateral Raise',
      'Cable Face Pull',
      'Barbell Curl',
      'Cable Tricep Pushdown',
      'EZ Bar Skull Crusher',
    ],
  },
  {
    id: 'glutes-hamstrings',
    name: 'Glutes & Hamstrings',
    description: 'Posterior chain focus',
    exercises: [
      'Barbell Hip Thrust',
      'Barbell Romanian Deadlift',
      'Dumbbell Bulgarian Split Squat',
      'Leg Curl',
      'Dumbbell Lunge',
      'Hip Abductor Machine',
    ],
  },
];
