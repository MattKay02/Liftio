# Liftio

A minimalist gym tracking app for logging workouts fast. Dark interface, fully offline, local-first.

## Features

- Start and log workouts from custom or premade templates
- Track exercises with sets, reps, and weight — or cardio with time, distance, or both
- Auto-fill weight from your previous session for each exercise
- Browse 330+ exercises with illustration images across 10 equipment categories
- Create, reorder, and manage custom workout templates
- Browse premade templates (Push/Pull/Legs, Upper/Lower, Full Body, and more)
- View workout history on a calendar with drill-down detail
- Stats section: overview charts (volume, reps, sets, duration) and per-exercise progress tracking
- Export all workout data as CSV
- Fully offline — all data stored locally on device via SQLite

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | React Native | 0.81.5 |
| Framework | React | 19.1.0 |
| Build system | Expo SDK | 54 |
| Language | TypeScript | 5.9 (strict) |
| Navigation | Expo Router | 6 (file-based, Next.js-style) |
| State management | Zustand | 5 |
| Database | Expo SQLite | 16 (local-first, offline) |
| Gestures | react-native-gesture-handler | 2.28 |
| Animations | react-native-reanimated | 4.1 |
| JS Worklets engine | react-native-worklets | 0.5.1 |
| Charts | react-native-gifted-charts + react-native-svg | 1.4 / 15 |
| Drag-to-reorder lists | react-native-draggable-flatlist | 4 |
| Gradients | expo-linear-gradient | 15 |
| Icons | Lucide React Native + @expo/vector-icons | — |
| UUID generation | expo-crypto | 15 |
| File I/O | expo-file-system | 19 |
| File import | expo-document-picker | 14 |
| File sharing / export | expo-sharing | 14 |

## Project Architecture

```
app/                          # Expo Router — screens and navigation
├── (tabs)/
│   ├── index.tsx             # My Workouts tab — templates + premade browser
│   └── logs.tsx              # Logs tab — calendar, history, stats
├── workout/
│   ├── active.tsx            # Active workout screen (timer, sets, cardio)
│   ├── add-exercise.tsx      # Exercise library picker
│   ├── create-template.tsx   # Template builder
│   ├── finish.tsx            # Post-workout summary
│   └── [id].tsx              # Workout detail — view + edit mode
└── _layout.tsx               # Root layout (GestureHandlerRootView)

components/
├── ui/                       # Reusable primitives
│   ├── AnimatedPressable.tsx # Scale-on-press wrapper
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Checkbox.tsx
│   ├── Divider.tsx
│   └── Input.tsx
├── workout/                  # Workout-specific components
│   ├── CardioModePicker.tsx  # Time / Distance / Time+Distance selector
│   ├── CardioSetRow.tsx      # Set row for cardio exercises
│   ├── ExerciseCard.tsx      # Collapsible exercise block with sets
│   └── SetRow.tsx            # Set row for strength exercises
├── shared/                   # Cross-screen components
│   ├── AllWorkoutsSlideUp.tsx
│   ├── CalendarView.tsx
│   ├── EmptyState.tsx
│   ├── ExerciseImage.tsx     # Exercise illustration with fallback
│   ├── FloatingWorkoutTimer.tsx
│   ├── Header.tsx
│   ├── KeyboardDismissButton.tsx
│   ├── LoadingScreen.tsx
│   ├── PremadeWorkoutsSlideUp.tsx
│   ├── SettingsMenu.tsx
│   └── WorkoutDetailSlideUp.tsx
└── stats/                    # Analytics and charting
    ├── ExerciseDetailSlideUp.tsx
    ├── ExerciseStatsSection.tsx
    ├── MoreExercisesDropdown.tsx
    ├── OverviewChart.tsx
    ├── StatsLineChart.tsx
    └── TopExercisesList.tsx

lib/
├── database/
│   ├── db.ts                 # SQLite init, schema creation, migrations, seeding
│   ├── imageSeedData.ts      # 252 image-linked exercise definitions
│   ├── seedDemoData.ts       # Demo data seeder
│   └── queries/
│       ├── exerciseLibrary.ts
│       ├── exerciseStats.ts  # Analytics queries (charts, PRs, frequency)
│       └── workouts.ts
├── stores/                   # Zustand global state
│   ├── settingsStore.ts      # Weight/distance units, rest timer
│   ├── templateStore.ts      # Create-template flow state
│   └── workoutStore.ts       # Active workout state
├── exerciseImages.ts         # Static asset map: imageKey → require()
└── utils/
    ├── csv.ts                # CSV formatting
    ├── csvExportImport.ts    # Export workout data to shareable CSV
    ├── date.ts               # Formatting helpers
    ├── pendingExercise.ts    # Pending exercise state helper
    ├── uuid.ts               # UUID via expo-crypto
    └── validation.ts         # Input validation + limits

constants/
├── Colors.ts                 # Dark theme color tokens
├── PremadeWorkouts.ts        # Built-in template definitions
├── Shadows.ts                # Card shadow styles
├── Spacing.ts                # 8px grid spacing tokens
├── Typography.ts             # Font sizes and weights
└── index.ts                  # Barrel export

types/
└── workout.ts                # All shared types (Workout, Exercise, WorkoutSet, CardioMode, etc.)
```

## Getting Started

```bash
npm install
npx expo start
```

Requires a physical device with Expo Go or a simulator. No web support (SQLite is device-only).
