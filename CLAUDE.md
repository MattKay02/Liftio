# Liftio - Development Guide

## Project Overview

Minimalist gym tracking app built with React Native + Expo. Core philosophy: speed, simplicity, zero distractions. Clean greyscale interface, local-first, offline-capable.

**Target:** iOS (primary), Android (secondary)

## Tech Stack

```
React Native 0.76+ / Expo SDK 52+ / TypeScript (strict)
Routing: Expo Router (file-based)
State: Zustand
Database: Expo SQLite
UI: Custom components (no UI library)
Icons: Lucide React Native (minimal use)
```

## Project Structure

```
app/                        # Expo Router
├── (tabs)/                 # Tab navigation: index, history, settings
├── workout/                # active, add-exercise, [id], finish
├── _layout.tsx
components/
├── ui/                     # Button, Input, Card, Checkbox, Divider
├── workout/                # ExerciseCard, SetRow, RestTimer
├── shared/                 # Header, EmptyState
lib/
├── database/
│   ├── db.ts               # SQLite init
│   ├── schema.ts           # Table schemas
│   ├── migrations.ts
│   └── queries/            # workouts, exercises, sets, exerciseLibrary
├── stores/                 # workoutStore, settingsStore (Zustand)
└── utils/                  # date, uuid, units
constants/                  # Colors, Typography, Spacing, Components
types/                      # workout, exercise, database
```

## Design System

### Colors - Greyscale Only

| Token | Hex | Usage |
|-------|-----|-------|
| white | #FFFFFF | Main background |
| grey50 | #FAFAFA | Card background |
| grey100 | #F5F5F5 | Input background |
| grey200 | #E5E7EB | Borders, dividers |
| grey300 | #D1D5DB | Input borders |
| grey400 | #9CA3AF | Tertiary text, placeholders |
| grey500 | #6B7280 | Completed states |
| grey600 | #4B5563 | Secondary text |
| grey800 | #111827 | Primary buttons |
| grey900 | #1A1A1A | Primary text |
| red600 | #DC2626 | Delete, errors |
| green600 | #16A34A | Success (rare) |

### Typography

- System fonts (SF Pro / Roboto)
- Sizes: display(28), title(20), bodyLg(16), body(14), caption(12)
- Weights: regular(400), semibold(600)

### Spacing (8px grid)

xs(4), sm(8), md(16), lg(24), xl(32), xxl(48)

### Component Specs

- **Buttons:** borderRadius 12, minHeight 48, primary=grey800, secondary=transparent
- **Inputs:** borderRadius 8, minHeight 44, bg=grey100, border=grey300
- **Cards:** borderRadius 12, bg=grey50, border=grey200, padding 16

## Database Schema

```sql
-- workouts: id(TEXT PK), name, date(INT), duration(INT), notes, is_template(INT), created_at, updated_at
-- exercises: id(TEXT PK), workout_id(FK), exercise_name, order_index, notes, created_at
-- sets: id(TEXT PK), exercise_id(FK), set_number, reps(INT), weight(REAL), is_completed(INT), created_at
-- exercise_library: id(TEXT PK), name(UNIQUE), category, muscle_group, equipment, is_custom(INT), created_at
-- user_settings: id(INT PK CHECK=1), weight_unit, default_rest_timer(INT), theme, created_at, updated_at
```

Key indexes: workouts(date DESC), exercises(workout_id, order_index), sets(exercise_id, set_number), exercise_library(category, name)

## TypeScript Types

See `types/workout.ts` for full definitions. Key interfaces:
- `Workout`, `Exercise`, `Set`, `ExerciseLibraryItem`, `UserSettings`
- `WorkoutWithExercises` (compound), `ExerciseWithSets` (compound)
- Categories: `'Barbell' | 'Dumbbell' | 'Machine' | 'Bodyweight' | 'Cable' | 'Other'`
- Weight units: `'lbs' | 'kg'`

## Development Guidelines

### Code Style
- TypeScript strict mode, functional components with hooks only
- `const` over `let`, no `var`; async/await over raw promises
- Components < 200 lines; extract reusable logic into custom hooks

### File Naming
- Components: PascalCase (`Button.tsx`)
- Utilities: camelCase (`formatDate.ts`)
- Constants: PascalCase files, UPPER_CASE values

### Component Structure
Imports → Types → Component (hooks, effects, handlers, render) → StyleSheet

### State Management
- Zustand for global state (workout, settings)
- useState for local UI state
- Keep state close to usage; avoid prop drilling

### Database
- All queries in `lib/database/queries/`
- Use prepared statements for repeated queries
- Handle errors with try/catch + Alert.alert

### Performance
- React.memo for expensive components
- useCallback to avoid inline functions in render
- FlatList with keyExtractor + getItemLayout
- SQLite indexes on frequent queries
- Lazy load / paginate history

## Phase 1 Scope

**Included:** Workout logging, exercise library, history, templates, settings (units, rest timer)

**Not included:** Cloud sync, accounts, social, charts, custom exercises, health integrations, dark mode
