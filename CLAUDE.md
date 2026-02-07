# Liftio - Development Guide for Claude Code

## Project Overview

**Liftio** is a minimalist, low-maintenance gym tracking app built with React Native + Expo. The core philosophy is speed, simplicity, and zero distractions. Users can log their workouts quickly with a clean greyscale interface.

**Target Platform:** iOS (primary), Android (secondary)
**Development Approach:** Local-first, offline-capable, no backend required for Phase 1

---

## Tech Stack

```
Framework: React Native 0.76+
Build Tool: Expo SDK 52+
Language: TypeScript (strict mode)
Routing: Expo Router (file-based)
State Management: Zustand
Local Database: Expo SQLite
UI: Custom components (no UI library)
Icons: Lucide React Native (minimal use)
```

---

## Design System

### Color Palette - Greyscale Only

```typescript
// constants/Colors.ts
export const Colors = {
  // Backgrounds
  white: '#FFFFFF',        // Main background
  grey50: '#FAFAFA',       // Card background
  grey100: '#F5F5F5',      // Input background
  
  // Text
  grey900: '#1A1A1A',      // Primary text (exercise names, headers)
  grey600: '#4B5563',      // Secondary text (body, completed sets)
  grey400: '#9CA3AF',      // Tertiary text (labels, placeholders, previous data)
  
  // UI Elements
  grey200: '#E5E7EB',      // Borders (cards, dividers)
  grey300: '#D1D5DB',      // Input borders
  grey800: '#111827',      // Primary button backgrounds
  grey500: '#6B7280',      // Completed states, active elements
  
  // Semantic (use sparingly)
  red600: '#DC2626',       // Delete, errors
  green600: '#16A34A',     // Success (rare use)
};
```

### Typography

```typescript
// constants/Typography.ts
export const Typography = {
  // Font families (system fonts)
  fontFamily: {
    primary: 'System',      // SF Pro (iOS) / Roboto (Android)
    mono: 'Monospace',      // SF Mono (iOS) / Roboto Mono (Android)
  },
  
  // Font sizes
  fontSize: {
    display: 28,    // App name, large headers
    title: 20,      // Exercise names
    bodyLg: 16,     // Button text, primary actions
    body: 14,       // Input text, set data, body copy
    caption: 12,    // Labels, timestamps, previous data
  },
  
  // Font weights
  fontWeight: {
    regular: '400',
    semibold: '600',
  },
  
  // Line heights
  lineHeight: {
    display: 34,
    title: 28,
    bodyLg: 24,
    body: 20,
    caption: 16,
  },
};
```

### Spacing (8px Grid)

```typescript
// constants/Spacing.ts
export const Spacing = {
  xs: 4,    // Tight spacing (between set rows)
  sm: 8,    // Small (internal card padding)
  md: 16,   // Medium (card padding, between cards, screen edges)
  lg: 24,   // Large (section spacing)
  xl: 32,   // XLarge (top/bottom screen margins)
  xxl: 48,  // XXLarge (major section breaks)
};
```

### Component Specs

```typescript
// constants/Components.ts
export const ComponentStyles = {
  // Buttons
  button: {
    primary: {
      backgroundColor: Colors.grey800,
      color: Colors.white,
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      minHeight: 48,
    },
    secondary: {
      backgroundColor: 'transparent',
      color: Colors.grey600,
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
  },
  
  // Input fields
  input: {
    backgroundColor: Colors.grey100,
    borderWidth: 1,
    borderColor: Colors.grey300,
    borderRadius: 8,
    padding: 12,
    minHeight: 44,
    color: Colors.grey900,
  },
  
  // Cards
  card: {
    backgroundColor: Colors.grey50,
    borderWidth: 1,
    borderColor: Colors.grey200,
    borderRadius: 12,
    padding: 16,
  },
};
```

---

## Project Structure

```
liftio/
├── app/                          # Expo Router app directory
│   ├── (tabs)/                   # Tab-based navigation
│   │   ├── index.tsx             # Home / Start Workout screen
│   │   ├── history.tsx           # Workout History screen
│   │   └── settings.tsx          # Settings screen
│   ├── workout/                  # Workout-related screens
│   │   ├── active.tsx            # Active workout screen
│   │   ├── add-exercise.tsx      # Add exercise screen
│   │   ├── [id].tsx              # Workout detail screen (read-only)
│   │   └── finish.tsx            # Finish workout modal
│   ├── _layout.tsx               # Root layout
│   └── +not-found.tsx            # 404 screen
├── components/                   # Reusable components
│   ├── ui/                       # Base UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Checkbox.tsx
│   │   └── Divider.tsx
│   ├── workout/                  # Workout-specific components
│   │   ├── ExerciseCard.tsx
│   │   ├── SetRow.tsx
│   │   └── RestTimer.tsx
│   └── shared/                   # Shared components
│       ├── Header.tsx
│       └── EmptyState.tsx
├── lib/                          # Core utilities
│   ├── database/                 # SQLite database
│   │   ├── db.ts                 # Database initialization
│   │   ├── schema.ts             # Table schemas
│   │   ├── migrations.ts         # Database migrations
│   │   └── queries/              # Database queries
│   │       ├── workouts.ts
│   │       ├── exercises.ts
│   │       ├── sets.ts
│   │       └── exerciseLibrary.ts
│   ├── stores/                   # Zustand stores
│   │   ├── workoutStore.ts       # Active workout state
│   │   └── settingsStore.ts      # User settings
│   └── utils/                    # Helper functions
│       ├── date.ts               # Date formatting
│       ├── uuid.ts               # UUID generation
│       └── units.ts              # Weight unit conversion
├── constants/                    # Design system constants
│   ├── Colors.ts
│   ├── Typography.ts
│   ├── Spacing.ts
│   └── Components.ts
├── types/                        # TypeScript types
│   ├── workout.ts
│   ├── exercise.ts
│   └── database.ts
├── assets/                       # Static assets
│   ├── fonts/
│   └── images/
├── app.json                      # Expo config
├── package.json
├── tsconfig.json
└── README.md
```

---

## Database Schema (SQLite)

### Table: workouts

```sql
CREATE TABLE IF NOT EXISTS workouts (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  date INTEGER NOT NULL,
  duration INTEGER,
  notes TEXT,
  is_template INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts(date DESC);
CREATE INDEX IF NOT EXISTS idx_workouts_is_template ON workouts(is_template);
```

### Table: exercises

```sql
CREATE TABLE IF NOT EXISTS exercises (
  id TEXT PRIMARY KEY NOT NULL,
  workout_id TEXT NOT NULL,
  exercise_name TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  notes TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_exercises_workout_id ON exercises(workout_id);
CREATE INDEX IF NOT EXISTS idx_exercises_order ON exercises(workout_id, order_index);
```

### Table: sets

```sql
CREATE TABLE IF NOT EXISTS sets (
  id TEXT PRIMARY KEY NOT NULL,
  exercise_id TEXT NOT NULL,
  set_number INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  weight REAL NOT NULL,
  is_completed INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sets_exercise_id ON sets(exercise_id);
CREATE INDEX IF NOT EXISTS idx_sets_set_number ON sets(exercise_id, set_number);
```

### Table: exercise_library

```sql
CREATE TABLE IF NOT EXISTS exercise_library (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  muscle_group TEXT,
  equipment TEXT,
  is_custom INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_exercise_library_category ON exercise_library(category);
CREATE INDEX IF NOT EXISTS idx_exercise_library_name ON exercise_library(name);
```

### Table: user_settings

```sql
CREATE TABLE IF NOT EXISTS user_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  weight_unit TEXT DEFAULT 'lbs',
  default_rest_timer INTEGER DEFAULT 90,
  theme TEXT DEFAULT 'light',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
```

---

## TypeScript Types

```typescript
// types/workout.ts

export interface Workout {
  id: string;
  name: string;
  date: number; // Unix timestamp
  duration: number | null; // Seconds
  notes: string | null;
  isTemplate: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Exercise {
  id: string;
  workoutId: string;
  exerciseName: string;
  orderIndex: number;
  notes: string | null;
  createdAt: number;
}

export interface Set {
  id: string;
  exerciseId: string;
  setNumber: number;
  reps: number;
  weight: number;
  isCompleted: boolean;
  createdAt: number;
}

export interface ExerciseLibraryItem {
  id: string;
  name: string;
  category: 'Barbell' | 'Dumbbell' | 'Machine' | 'Bodyweight' | 'Cable' | 'Other';
  muscleGroup: string | null;
  equipment: string | null;
  isCustom: boolean;
  createdAt: number;
}

export interface UserSettings {
  id: number;
  weightUnit: 'lbs' | 'kg';
  defaultRestTimer: number; // Seconds
  theme: 'light' | 'dark';
  createdAt: number;
  updatedAt: number;
}

// Compound types
export interface WorkoutWithExercises extends Workout {
  exercises: ExerciseWithSets[];
}

export interface ExerciseWithSets extends Exercise {
  sets: Set[];
}

export interface PreviousSetData {
  reps: number;
  weight: number;
}
```

---

## Core Features & Implementation

### Feature 1: Database Setup

**File:** `lib/database/db.ts`

```typescript
import * as SQLite from 'expo-sqlite';

const DB_NAME = 'liftio.db';

export const db = SQLite.openDatabaseSync(DB_NAME);

export const initializeDatabase = async () => {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
  `);
  
  // Create tables (see schema above)
  await createTables();
  
  // Seed exercise library if empty
  const count = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM exercise_library'
  );
  
  if (count?.count === 0) {
    await seedExerciseLibrary();
  }
  
  // Initialize settings if not exists
  const settings = await db.getFirstAsync('SELECT * FROM user_settings WHERE id = 1');
  if (!settings) {
    await db.runAsync(
      'INSERT INTO user_settings (id, weight_unit, default_rest_timer, theme, created_at, updated_at) VALUES (1, ?, ?, ?, ?, ?)',
      ['lbs', 90, 'light', Date.now(), Date.now()]
    );
  }
};

const createTables = async () => {
  // Execute CREATE TABLE statements from schema section
  // See Database Schema above
};

const seedExerciseLibrary = async () => {
  const exercises = [
    // Barbell
    { name: 'Barbell Back Squat', category: 'Barbell', muscleGroup: 'Legs', equipment: 'Barbell' },
    { name: 'Barbell Bench Press', category: 'Barbell', muscleGroup: 'Chest', equipment: 'Barbell' },
    { name: 'Barbell Deadlift', category: 'Barbell', muscleGroup: 'Back', equipment: 'Barbell' },
    { name: 'Barbell Overhead Press', category: 'Barbell', muscleGroup: 'Shoulders', equipment: 'Barbell' },
    { name: 'Barbell Row', category: 'Barbell', muscleGroup: 'Back', equipment: 'Barbell' },
    { name: 'Barbell Front Squat', category: 'Barbell', muscleGroup: 'Legs', equipment: 'Barbell' },
    { name: 'Barbell Romanian Deadlift', category: 'Barbell', muscleGroup: 'Legs', equipment: 'Barbell' },
    { name: 'Barbell Hip Thrust', category: 'Barbell', muscleGroup: 'Legs', equipment: 'Barbell' },
    
    // Dumbbell
    { name: 'Dumbbell Bench Press', category: 'Dumbbell', muscleGroup: 'Chest', equipment: 'Dumbbell' },
    { name: 'Dumbbell Shoulder Press', category: 'Dumbbell', muscleGroup: 'Shoulders', equipment: 'Dumbbell' },
    { name: 'Dumbbell Row', category: 'Dumbbell', muscleGroup: 'Back', equipment: 'Dumbbell' },
    { name: 'Dumbbell Bicep Curl', category: 'Dumbbell', muscleGroup: 'Arms', equipment: 'Dumbbell' },
    { name: 'Dumbbell Tricep Extension', category: 'Dumbbell', muscleGroup: 'Arms', equipment: 'Dumbbell' },
    { name: 'Dumbbell Lateral Raise', category: 'Dumbbell', muscleGroup: 'Shoulders', equipment: 'Dumbbell' },
    { name: 'Dumbbell Goblet Squat', category: 'Dumbbell', muscleGroup: 'Legs', equipment: 'Dumbbell' },
    { name: 'Dumbbell Lunge', category: 'Dumbbell', muscleGroup: 'Legs', equipment: 'Dumbbell' },
    
    // Machine
    { name: 'Leg Press', category: 'Machine', muscleGroup: 'Legs', equipment: 'Machine' },
    { name: 'Leg Curl', category: 'Machine', muscleGroup: 'Legs', equipment: 'Machine' },
    { name: 'Leg Extension', category: 'Machine', muscleGroup: 'Legs', equipment: 'Machine' },
    { name: 'Lat Pulldown', category: 'Machine', muscleGroup: 'Back', equipment: 'Machine' },
    { name: 'Cable Row', category: 'Machine', muscleGroup: 'Back', equipment: 'Machine' },
    { name: 'Chest Press Machine', category: 'Machine', muscleGroup: 'Chest', equipment: 'Machine' },
    
    // Bodyweight
    { name: 'Pull-up', category: 'Bodyweight', muscleGroup: 'Back', equipment: 'Bodyweight' },
    { name: 'Push-up', category: 'Bodyweight', muscleGroup: 'Chest', equipment: 'Bodyweight' },
    { name: 'Dip', category: 'Bodyweight', muscleGroup: 'Chest', equipment: 'Bodyweight' },
    { name: 'Chin-up', category: 'Bodyweight', muscleGroup: 'Back', equipment: 'Bodyweight' },
    
    // Cable
    { name: 'Cable Fly', category: 'Cable', muscleGroup: 'Chest', equipment: 'Cable' },
    { name: 'Cable Tricep Pushdown', category: 'Cable', muscleGroup: 'Arms', equipment: 'Cable' },
    { name: 'Cable Bicep Curl', category: 'Cable', muscleGroup: 'Arms', equipment: 'Cable' },
    { name: 'Cable Face Pull', category: 'Cable', muscleGroup: 'Shoulders', equipment: 'Cable' },
  ];
  
  const statement = await db.prepareAsync(
    'INSERT INTO exercise_library (id, name, category, muscle_group, equipment, is_custom, created_at) VALUES (?, ?, ?, ?, ?, 0, ?)'
  );
  
  for (const exercise of exercises) {
    await statement.executeAsync([
      crypto.randomUUID(),
      exercise.name,
      exercise.category,
      exercise.muscleGroup,
      exercise.equipment,
      Date.now(),
    ]);
  }
  
  await statement.finalizeAsync();
};
```

---

### Feature 2: Workout Store (Zustand)

**File:** `lib/stores/workoutStore.ts`

```typescript
import { create } from 'zustand';
import { WorkoutWithExercises, ExerciseWithSets, Set } from '@/types/workout';

interface WorkoutState {
  // Active workout state
  activeWorkout: WorkoutWithExercises | null;
  isWorkoutActive: boolean;
  workoutStartTime: number | null;
  
  // Actions
  startWorkout: (name: string, fromTemplate?: WorkoutWithExercises) => void;
  finishWorkout: (notes?: string, saveAsTemplate?: boolean) => Promise<void>;
  cancelWorkout: () => void;
  
  // Exercise actions
  addExercise: (exerciseName: string) => void;
  removeExercise: (exerciseId: string) => void;
  
  // Set actions
  addSet: (exerciseId: string) => void;
  updateSet: (exerciseId: string, setId: string, data: Partial<Set>) => void;
  removeSet: (exerciseId: string, setId: string) => void;
  completeSet: (exerciseId: string, setId: string) => void;
  
  // Previous data
  getPreviousSetData: (exerciseName: string) => Promise<Set[]>;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  activeWorkout: null,
  isWorkoutActive: false,
  workoutStartTime: null,
  
  startWorkout: (name, fromTemplate) => {
    const workout: WorkoutWithExercises = fromTemplate || {
      id: crypto.randomUUID(),
      name,
      date: Date.now(),
      duration: null,
      notes: null,
      isTemplate: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      exercises: [],
    };
    
    set({
      activeWorkout: workout,
      isWorkoutActive: true,
      workoutStartTime: Date.now(),
    });
  },
  
  finishWorkout: async (notes, saveAsTemplate) => {
    const { activeWorkout, workoutStartTime } = get();
    if (!activeWorkout || !workoutStartTime) return;
    
    const duration = Math.floor((Date.now() - workoutStartTime) / 1000);
    
    const finalWorkout = {
      ...activeWorkout,
      duration,
      notes: notes || null,
      isTemplate: saveAsTemplate || false,
      updatedAt: Date.now(),
    };
    
    // Save to database
    await saveWorkoutToDatabase(finalWorkout);
    
    set({
      activeWorkout: null,
      isWorkoutActive: false,
      workoutStartTime: null,
    });
  },
  
  cancelWorkout: () => {
    set({
      activeWorkout: null,
      isWorkoutActive: false,
      workoutStartTime: null,
    });
  },
  
  addExercise: (exerciseName) => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;
    
    const newExercise: ExerciseWithSets = {
      id: crypto.randomUUID(),
      workoutId: activeWorkout.id,
      exerciseName,
      orderIndex: activeWorkout.exercises.length,
      notes: null,
      createdAt: Date.now(),
      sets: [],
    };
    
    set({
      activeWorkout: {
        ...activeWorkout,
        exercises: [...activeWorkout.exercises, newExercise],
      },
    });
  },
  
  removeExercise: (exerciseId) => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;
    
    set({
      activeWorkout: {
        ...activeWorkout,
        exercises: activeWorkout.exercises.filter(e => e.id !== exerciseId),
      },
    });
  },
  
  addSet: (exerciseId) => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;
    
    const exercise = activeWorkout.exercises.find(e => e.id === exerciseId);
    if (!exercise) return;
    
    const lastSet = exercise.sets[exercise.sets.length - 1];
    
    const newSet: Set = {
      id: crypto.randomUUID(),
      exerciseId,
      setNumber: exercise.sets.length + 1,
      reps: 0,
      weight: lastSet?.weight || 0, // Auto-fill weight from previous set
      isCompleted: false,
      createdAt: Date.now(),
    };
    
    set({
      activeWorkout: {
        ...activeWorkout,
        exercises: activeWorkout.exercises.map(e =>
          e.id === exerciseId
            ? { ...e, sets: [...e.sets, newSet] }
            : e
        ),
      },
    });
  },
  
  updateSet: (exerciseId, setId, data) => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;
    
    set({
      activeWorkout: {
        ...activeWorkout,
        exercises: activeWorkout.exercises.map(e =>
          e.id === exerciseId
            ? {
                ...e,
                sets: e.sets.map(s =>
                  s.id === setId ? { ...s, ...data } : s
                ),
              }
            : e
        ),
      },
    });
  },
  
  removeSet: (exerciseId, setId) => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;
    
    set({
      activeWorkout: {
        ...activeWorkout,
        exercises: activeWorkout.exercises.map(e =>
          e.id === exerciseId
            ? { ...e, sets: e.sets.filter(s => s.id !== setId) }
            : e
        ),
      },
    });
  },
  
  completeSet: (exerciseId, setId) => {
    get().updateSet(exerciseId, setId, { isCompleted: true });
  },
  
  getPreviousSetData: async (exerciseName) => {
    // Query database for most recent sets for this exercise
    // Return array of sets with reps/weight
    // Implementation depends on database query
    return [];
  },
}));

// Helper function to save workout to database
const saveWorkoutToDatabase = async (workout: WorkoutWithExercises) => {
  // Implementation: Insert workout, exercises, and sets into SQLite
  // See lib/database/queries/workouts.ts
};
```

---

### Feature 3: Home Screen

**File:** `app/(tabs)/index.tsx`

```typescript
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Colors, Typography, Spacing } from '@/constants';
import { Button } from '@/components/ui/Button';
import { WorkoutWithExercises } from '@/types/workout';
import { getRecentTemplates } from '@/lib/database/queries/workouts';

export default function HomeScreen() {
  const [recentTemplates, setRecentTemplates] = useState<WorkoutWithExercises[]>([]);
  
  useEffect(() => {
    loadRecentTemplates();
  }, []);
  
  const loadRecentTemplates = async () => {
    const templates = await getRecentTemplates(5);
    setRecentTemplates(templates);
  };
  
  const handleStartWorkout = () => {
    router.push('/workout/active');
  };
  
  const handleStartFromTemplate = (template: WorkoutWithExercises) => {
    router.push({
      pathname: '/workout/active',
      params: { templateId: template.id },
    });
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>Liftio</Text>
      </View>
      
      <Button
        title="START WORKOUT"
        onPress={handleStartWorkout}
        style={styles.startButton}
      />
      
      {recentTemplates.length > 0 && (
        <View style={styles.templatesSection}>
          <Text style={styles.sectionLabel}>Recent Workouts</Text>
          {recentTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onPress={() => handleStartFromTemplate(template)}
            />
          ))}
        </View>
      )}
      
      <View style={styles.bottomActions}>
        <Pressable onPress={() => router.push('/history')}>
          <Text style={styles.bottomActionText}>History</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/settings')}>
          <Text style={styles.bottomActionText}>Settings</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const TemplateCard = ({ template, onPress }) => {
  const timeSince = getTimeSinceString(template.date);
  
  return (
    <Pressable style={styles.templateCard} onPress={onPress}>
      <Text style={styles.templateName}>{template.name}</Text>
      <Text style={styles.templateMeta}>
        {template.exercises.length} exercises • {Math.floor(template.duration / 60)} min
      </Text>
      <Text style={styles.templateDate}>Last: {timeSince}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    alignItems: 'center',
    marginTop: Spacing.xxl,
  },
  logo: {
    fontSize: Typography.fontSize.display,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.grey900,
  },
  startButton: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
  },
  templatesSection: {
    marginTop: Spacing.xl,
    marginHorizontal: Spacing.md,
  },
  sectionLabel: {
    fontSize: Typography.fontSize.caption,
    color: Colors.grey600,
    marginBottom: Spacing.sm,
  },
  templateCard: {
    backgroundColor: Colors.grey50,
    borderWidth: 1,
    borderColor: Colors.grey200,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  templateName: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.grey900,
    marginBottom: Spacing.xs,
  },
  templateMeta: {
    fontSize: Typography.fontSize.caption,
    color: Colors.grey600,
    marginBottom: Spacing.xs,
  },
  templateDate: {
    fontSize: Typography.fontSize.caption,
    color: Colors.grey400,
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: Spacing.xl,
  },
  bottomActionText: {
    fontSize: Typography.fontSize.body,
    color: Colors.grey600,
  },
});

// Helper function
const getTimeSinceString = (timestamp: number): string => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  const days = Math.floor(seconds / 86400);
  
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
};
```

---

### Feature 4: Active Workout Screen

**File:** `app/workout/active.tsx`

```typescript
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { useWorkoutStore } from '@/lib/stores/workoutStore';
import { ExerciseCard } from '@/components/workout/ExerciseCard';
import { Button } from '@/components/ui/Button';
import { Colors, Spacing } from '@/constants';

export default function ActiveWorkoutScreen() {
  const params = useLocalSearchParams();
  const {
    activeWorkout,
    startWorkout,
    finishWorkout,
    cancelWorkout,
    addExercise,
  } = useWorkoutStore();
  
  useEffect(() => {
    if (!activeWorkout) {
      // Start new workout or load from template
      const templateId = params.templateId as string | undefined;
      if (templateId) {
        loadTemplateAndStart(templateId);
      } else {
        startWorkout('Workout');
      }
    }
  }, []);
  
  const loadTemplateAndStart = async (templateId: string) => {
    // Load template from database
    // const template = await getWorkoutById(templateId);
    // startWorkout(template.name, template);
  };
  
  const handleCancel = () => {
    Alert.alert(
      'Cancel Workout?',
      'Are you sure you want to cancel this workout?',
      [
        { text: 'Keep Going', style: 'cancel' },
        { 
          text: 'Cancel Workout',
          style: 'destructive',
          onPress: () => {
            cancelWorkout();
            router.back();
          },
        },
      ]
    );
  };
  
  const handleFinish = () => {
    router.push('/workout/finish');
  };
  
  const handleAddExercise = () => {
    router.push('/workout/add-exercise');
  };
  
  if (!activeWorkout) {
    return null; // Loading
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button title="Cancel" onPress={handleCancel} variant="text" />
        <Text style={styles.workoutName}>{activeWorkout.name}</Text>
        <Button title="Finish" onPress={handleFinish} variant="text" />
      </View>
      
      <ScrollView style={styles.content}>
        {activeWorkout.exercises.map((exercise) => (
          <ExerciseCard key={exercise.id} exercise={exercise} />
        ))}
        
        <Button
          title="+ Add Exercise"
          onPress={handleAddExercise}
          variant="secondary"
          style={styles.addButton}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey200,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.grey900,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  addButton: {
    marginTop: Spacing.md,
  },
});
```

---

### Feature 5: Exercise Card Component

**File:** `components/workout/ExerciseCard.tsx`

```typescript
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ExerciseWithSets } from '@/types/workout';
import { SetRow } from './SetRow';
import { useWorkoutStore } from '@/lib/stores/workoutStore';
import { Colors, Spacing, Typography } from '@/constants';
import { X } from 'lucide-react-native';

interface ExerciseCardProps {
  exercise: ExerciseWithSets;
}

export const ExerciseCard = ({ exercise }: ExerciseCardProps) => {
  const { removeExercise, addSet } = useWorkoutStore();
  
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
        <Pressable onPress={() => removeExercise(exercise.id)}>
          <X size={20} color={Colors.grey600} />
        </Pressable>
      </View>
      
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.headerText, styles.setCol]}>Set</Text>
          <Text style={[styles.headerText, styles.prevCol]}>Previous</Text>
          <Text style={[styles.headerText, styles.repsCol]}>Reps</Text>
          <Text style={[styles.headerText, styles.weightCol]}>Weight</Text>
          <Text style={[styles.headerText, styles.checkCol]}>✓</Text>
        </View>
        
        {exercise.sets.map((set, index) => (
          <SetRow
            key={set.id}
            set={set}
            setNumber={index + 1}
            exerciseId={exercise.id}
            exerciseName={exercise.exerciseName}
          />
        ))}
      </View>
      
      <Pressable
        style={styles.addSetButton}
        onPress={() => addSet(exercise.id)}
      >
        <Text style={styles.addSetText}>+ Add Set</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.grey50,
    borderWidth: 1,
    borderColor: Colors.grey200,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  exerciseName: {
    fontSize: Typography.fontSize.title,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.grey900,
  },
  table: {
    marginTop: Spacing.sm,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey200,
  },
  headerText: {
    fontSize: Typography.fontSize.caption,
    color: Colors.grey400,
    textAlign: 'center',
  },
  setCol: { flex: 0.5 },
  prevCol: { flex: 1.5 },
  repsCol: { flex: 1 },
  weightCol: { flex: 1.2 },
  checkCol: { flex: 0.5 },
  addSetButton: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    marginTop: Spacing.sm,
  },
  addSetText: {
    fontSize: Typography.fontSize.body,
    color: Colors.grey600,
  },
});
```

---

### Feature 6: Set Row Component

**File:** `components/workout/SetRow.tsx`

```typescript
import { View, TextInput, StyleSheet, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import { Set } from '@/types/workout';
import { useWorkoutStore } from '@/lib/stores/workoutStore';
import { Checkbox } from '@/components/ui/Checkbox';
import { Colors, Spacing, Typography } from '@/constants';

interface SetRowProps {
  set: Set;
  setNumber: number;
  exerciseId: string;
  exerciseName: string;
}

export const SetRow = ({ set, setNumber, exerciseId, exerciseName }: SetRowProps) => {
  const { updateSet, completeSet, getPreviousSetData } = useWorkoutStore();
  const [previousData, setPreviousData] = useState<string>('');
  const [reps, setReps] = useState(set.reps > 0 ? set.reps.toString() : '');
  const [weight, setWeight] = useState(set.weight > 0 ? set.weight.toString() : '');
  
  useEffect(() => {
    loadPreviousData();
  }, []);
  
  const loadPreviousData = async () => {
    const prevSets = await getPreviousSetData(exerciseName);
    if (prevSets && prevSets[setNumber - 1]) {
      const prev = prevSets[setNumber - 1];
      setPreviousData(`${prev.reps} × ${prev.weight}`);
    }
  };
  
  const handleRepsChange = (value: string) => {
    setReps(value);
    const numValue = parseInt(value) || 0;
    updateSet(exerciseId, set.id, { reps: numValue });
  };
  
  const handleWeightChange = (value: string) => {
    setWeight(value);
    const numValue = parseFloat(value) || 0;
    updateSet(exerciseId, set.id, { weight: numValue });
  };
  
  const handleComplete = () => {
    if (set.reps > 0 && set.weight > 0) {
      completeSet(exerciseId, set.id);
    }
  };
  
  return (
    <View style={[styles.row, set.isCompleted && styles.completedRow]}>
      <Text style={[styles.text, styles.setCol]}>{setNumber}</Text>
      <Text style={[styles.text, styles.prevCol, styles.prevText]}>
        {previousData}
      </Text>
      <TextInput
        style={[styles.input, styles.repsCol]}
        value={reps}
        onChangeText={handleRepsChange}
        keyboardType="numeric"
        placeholder="0"
        placeholderTextColor={Colors.grey400}
        editable={!set.isCompleted}
      />
      <TextInput
        style={[styles.input, styles.weightCol]}
        value={weight}
        onChangeText={handleWeightChange}
        keyboardType="decimal-pad"
        placeholder="0"
        placeholderTextColor={Colors.grey400}
        editable={!set.isCompleted}
      />
      <View style={styles.checkCol}>
        <Checkbox
          checked={set.isCompleted}
          onPress={handleComplete}
          disabled={set.isCompleted}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey100,
  },
  completedRow: {
    opacity: 0.6,
  },
  text: {
    fontSize: Typography.fontSize.body,
    color: Colors.grey900,
    textAlign: 'center',
  },
  prevText: {
    color: Colors.grey400,
    fontSize: Typography.fontSize.caption,
  },
  input: {
    backgroundColor: Colors.grey100,
    borderWidth: 1,
    borderColor: Colors.grey300,
    borderRadius: 8,
    padding: Spacing.sm,
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.mono,
    textAlign: 'center',
    color: Colors.grey900,
  },
  setCol: { flex: 0.5 },
  prevCol: { flex: 1.5 },
  repsCol: { flex: 1, marginHorizontal: 4 },
  weightCol: { flex: 1.2, marginHorizontal: 4 },
  checkCol: { flex: 0.5, alignItems: 'center' },
});
```

---

## UI Component Library

### Button Component

**File:** `components/ui/Button.tsx`

```typescript
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors, Spacing, Typography } from '@/constants';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'destructive';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export const Button = ({
  title,
  onPress,
  variant = 'primary',
  style,
  textStyle,
  disabled = false,
}: ButtonProps) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.text, styles[`${variant}Text`], textStyle]}>
        {title}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primary: {
    backgroundColor: Colors.grey800,
  },
  secondary: {
    backgroundColor: 'transparent',
  },
  destructive: {
    backgroundColor: 'transparent',
  },
  text: {
    fontSize: Typography.fontSize.bodyLg,
    fontWeight: Typography.fontWeight.semibold,
  },
  primaryText: {
    color: Colors.white,
  },
  secondaryText: {
    color: Colors.grey600,
  },
  destructiveText: {
    color: Colors.red600,
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    backgroundColor: Colors.grey200,
  },
});
```

### Input Component

**File:** `components/ui/Input.tsx`

```typescript
import { TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Colors, Spacing, Typography } from '@/constants';

interface InputProps extends TextInputProps {
  variant?: 'default' | 'number';
}

export const Input = ({ variant = 'default', style, ...props }: InputProps) => {
  return (
    <TextInput
      style={[
        styles.input,
        variant === 'number' && styles.numberInput,
        style,
      ]}
      placeholderTextColor={Colors.grey400}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: Colors.grey100,
    borderWidth: 1,
    borderColor: Colors.grey300,
    borderRadius: 8,
    padding: Spacing.sm,
    fontSize: Typography.fontSize.body,
    color: Colors.grey900,
    minHeight: 44,
  },
  numberInput: {
    fontFamily: Typography.fontFamily.mono,
    textAlign: 'center',
  },
});
```

### Checkbox Component

**File:** `components/ui/Checkbox.tsx`

```typescript
import { Pressable, View, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { Colors } from '@/constants';

interface CheckboxProps {
  checked: boolean;
  onPress: () => void;
  disabled?: boolean;
}

export const Checkbox = ({ checked, onPress, disabled = false }: CheckboxProps) => {
  return (
    <Pressable
      style={[styles.checkbox, checked && styles.checked]}
      onPress={onPress}
      disabled={disabled}
    >
      {checked && <Check size={16} color={Colors.white} strokeWidth={3} />}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.grey300,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checked: {
    backgroundColor: Colors.grey500,
    borderColor: Colors.grey500,
  },
});
```

---

## Development Guidelines

### Code Style

- Use TypeScript strict mode
- Use functional components with hooks (no class components)
- Prefer `const` over `let`, avoid `var`
- Use async/await over promises where possible
- Keep components small and focused (< 200 lines)
- Extract reusable logic into custom hooks

### File Naming

- Components: PascalCase (e.g., `Button.tsx`, `ExerciseCard.tsx`)
- Utilities: camelCase (e.g., `formatDate.ts`, `uuid.ts`)
- Types: PascalCase (e.g., `Workout.ts`)
- Constants: PascalCase for files, UPPER_CASE for values

### Component Structure

```typescript
// Imports
import { ... } from 'react-native';
import { ... } from 'expo-...';

// Types
interface ComponentProps {
  ...
}

// Component
export const Component = (props: ComponentProps) => {
  // Hooks
  const [state, setState] = useState();
  
  // Effects
  useEffect(() => {}, []);
  
  // Handlers
  const handleAction = () => {};
  
  // Render
  return <View>...</View>;
};

// Styles
const styles = StyleSheet.create({
  ...
});
```

### State Management

- Use Zustand for global state (workout, settings)
- Use local state (useState) for UI state (input values, modals)
- Keep state as close to where it's used as possible
- Avoid prop drilling - use stores or context

### Database Queries

- All database operations should be in `lib/database/queries/`
- Use prepared statements for repeated queries
- Always handle errors gracefully
- Close database connections properly

### Error Handling

```typescript
try {
  await databaseOperation();
} catch (error) {
  console.error('Operation failed:', error);
  // Show user-friendly error message
  Alert.alert('Error', 'Something went wrong. Please try again.');
}
```

### Performance

- Use `React.memo` for expensive components
- Avoid inline functions in render (use useCallback)
- Optimize FlatList with `keyExtractor` and `getItemLayout`
- Use SQLite indexes for frequently queried columns
- Lazy load data (pagination for history)

---

## Testing Strategy

### Manual Testing Checklist

**Core Functionality:**
- [ ] Start new workout
- [ ] Add exercises from library
- [ ] Log sets (reps, weight, completion)
- [ ] Auto-fill weight from previous set
- [ ] Display previous workout data
- [ ] Add/remove sets
- [ ] Add/remove exercises
- [ ] Finish workout (save, notes, template)
- [ ] Cancel workout

**History:**
- [ ] View workout history
- [ ] View workout details
- [ ] Start workout from template
- [ ] Delete workout

**Settings:**
- [ ] Change weight unit (lbs/kg)
- [ ] Change default rest timer
- [ ] Settings persist across app restarts

**Edge Cases:**
- [ ] App works offline (always)
- [ ] Empty states (no templates, no history)
- [ ] Very long workout names
- [ ] Very heavy weights (1000+ lbs)
- [ ] Zero/negative inputs handled

**Performance:**
- [ ] App launches < 2 seconds
- [ ] Smooth scrolling in history
- [ ] No lag when adding sets
- [ ] Database operations < 100ms

---

## Deployment

### iOS (TestFlight)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure project
eas build:configure

# Create iOS build
eas build --platform ios

# Submit to TestFlight
eas submit --platform ios
```

### Android (Google Play Internal Testing)

```bash
# Create Android build
eas build --platform android

# Submit to Google Play
eas submit --platform android
```

---

## Phase 1 Milestones

### Week 1: Foundation ✅
- [ ] Project setup (Expo + TypeScript)
- [ ] Database schema + initialization
- [ ] Design system constants
- [ ] Basic UI components (Button, Input, Card, Checkbox)
- [ ] Zustand stores (workout, settings)

### Week 2: Core Screens ✅
- [ ] Home screen (start workout, templates)
- [ ] Active workout screen
- [ ] Exercise card component
- [ ] Set row component
- [ ] Add exercise screen

### Week 3: Exercise Library & History ✅
- [ ] Exercise library (search, categories)
- [ ] Seed 50-100 exercises
- [ ] Workout history screen
- [ ] Workout detail screen
- [ ] Previous data logic

### Week 4: Finish Workout & Settings ✅
- [ ] Finish workout flow
- [ ] Save as template
- [ ] Settings screen
- [ ] Weight unit toggle (lbs/kg)
- [ ] Rest timer (basic)

### Week 5: Polish & Testing ✅
- [ ] Personal records detection
- [ ] Empty states
- [ ] Error handling
- [ ] Performance optimization
- [ ] User testing (5-10 people)

### Week 6: Launch Prep ✅
- [ ] Bug fixes from testing
- [ ] App icon + splash screen
- [ ] App Store screenshots
- [ ] Privacy policy
- [ ] Submit to TestFlight

---

## Common Tasks & Commands

### Start Development

```bash
# Start Expo dev server
npx expo start

# Start with cache clear
npx expo start --clear

# Run on iOS simulator
npx expo start --ios

# Run on Android emulator
npx expo start --android
```

### Database Management

```bash
# Reset database (dev only)
# Delete app from device/simulator and reinstall
```

### Build & Deploy

```bash
# Create development build
eas build --profile development --platform ios

# Create preview build (for testing)
eas build --profile preview --platform ios

# Create production build
eas build --profile production --platform ios
```

### Debugging

```bash
# View logs
npx expo start

# Open React DevTools
Press 'j' in terminal

# Reload app
Press 'r' in terminal

# Enable Remote Debugging
Shake device → Enable Remote Debugging
```

---

## Success Criteria for Phase 1

**Technical:**
- ✅ App launches without errors
- ✅ All core features work offline
- ✅ No data loss on app restart
- ✅ Smooth 60fps UI interactions

**User Experience:**
- ✅ New user can start workout in < 60 seconds
- ✅ Logging a set takes < 5 seconds
- ✅ Previous data displays correctly
- ✅ Greyscale design is visually appealing

**Quality:**
- ✅ Zero crashes during testing
- ✅ All database operations succeed
- ✅ Settings persist correctly
- ✅ No console errors/warnings

---

## Known Limitations (Phase 1)

**Intentionally Not Included:**
- No cloud sync (local only)
- No user accounts
- No social features
- No progress charts
- No body weight tracking
- No custom exercises (only from library)
- No exercise images/videos
- No Apple Health / Google Fit integration
- No dark mode
- No rest timer notifications (Phase 2)

---

## Next Phase (Phase 2) Preview

**Features to Add:**
- Cloud sync (Supabase)
- User accounts (email/password)
- Cross-device sync
- Progress charts (weight over time)
- Custom exercises
- Data export (CSV)
- Rest timer notifications
- Apple Health integration

---

## Resources

**Documentation:**
- Expo: https://docs.expo.dev
- React Native: https://reactnative.dev
- Zustand: https://github.com/pmndrs/zustand
- Expo SQLite: https://docs.expo.dev/versions/latest/sdk/sqlite/

**Design Inspiration:**
- Linear (minimal UI)
- Things 3 (clean task management)
- Apple Notes (simplicity)

---

## Questions? Issues?

If Claude Code encounters any issues or needs clarification:

1. **Database errors:** Check schema matches types
2. **TypeScript errors:** Ensure types are imported correctly
3. **Navigation errors:** Verify Expo Router file structure
4. **Styling inconsistencies:** Reference design system constants
5. **State management issues:** Check Zustand store logic

---

**Let's build Liftio! 🏋️**

Start with database setup, then move to UI components, then connect the flows. Keep it simple, keep it minimal, keep it fast.