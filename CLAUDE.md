# Liftio - Development Guide

## Project Overview

Minimalist gym tracking app built with React Native + Expo. Core philosophy: speed, simplicity, zero distractions. Dark interface, local-first, offline-capable.

**Target:** iOS (primary), Android (secondary)

## Tech Stack

```
React 19 / React Native 0.81 / Expo SDK 54 / TypeScript 5.9 (strict)
Routing:    Expo Router 6 (file-based, Next.js-style)
State:      Zustand 5
Database:   Expo SQLite 16 — local-first, fully offline (see DATABASE.md)
Gestures:   react-native-gesture-handler 2.28 + react-native-reanimated 4.1
            react-native-worklets 0.5 (JS worklets engine for reanimated)
Charts:     react-native-gifted-charts 1.4 + react-native-svg 15
UI:         Custom components; expo-linear-gradient for gradient surfaces
Lists:      react-native-draggable-flatlist (drag-to-reorder)
Icons:      Lucide React Native + @expo/vector-icons
Utilities:  expo-crypto (UUID), expo-file-system, expo-document-picker, expo-sharing
```

## Project Structure

```
app/                        # Expo Router
├── (tabs)/                 # Tab navigation: index (My Workouts), logs (History)
├── workout/                # active, add-exercise, [id], finish, create-template
├── _layout.tsx             # Root layout (GestureHandlerRootView wrapper)
components/
├── ui/                     # Button, Input, Checkbox
├── workout/                # ExerciseCard, SetRow, CardioSetRow
├── shared/                 # Header, CalendarView, WorkoutDetailSlideUp, SettingsMenu
lib/
├── database/
│   ├── db.ts               # SQLite init + seed
│   └── queries/            # workouts, exerciseLibrary
├── stores/                 # workoutStore, settingsStore (Zustand)
└── utils/                  # date, uuid, validation
constants/                  # Colors, Typography, Spacing
types/                      # workout.ts
```

## Design System

### Colors - Dark Theme

Defined in `constants/Colors.ts`. The app uses a dark UI.

| Token | Hex | Usage |
|-------|-----|-------|
| `bg` | #1A1A1A | Main background |
| `bgCard` | #2D2D2D | Card backgrounds |
| `bgElevated` | #404040 | Inputs, elevated surfaces |
| `textPrimary` | #FFFFFF | Headers, exercise names, primary text |
| `textSecondary` | #9CA3AF | Labels, meta info |
| `textTertiary` | #6B7280 | Timestamps, previous data, placeholders |
| `border` | #404040 | Borders, dividers |
| `accent` | #FFFFFF | Primary button background |
| `accentText` | #1A1A1A | Text on accent buttons |
| `highlight` | #4B5563 | Calendar selection highlight |
| `red600` | #DC2626 | Delete actions, errors, destructive |
| `green600` | #16A34A | Completed set checkmarks, success states |

Completed sets use `rgba(22, 163, 74, 0.08)` row background and `rgba(22, 163, 74, 0.15)` checkbox background.

### Typography

Defined in `constants/Typography.ts`. System fonts (SF Pro / Roboto).

| Size | Value | Usage |
|------|-------|-------|
| `display` | 28 | Screen titles |
| `title` | 20 | Section headers, exercise names |
| `bodyLg` | 16 | Workout names, prominent text |
| `body` | 14 | General content |
| `caption` | 12 | Labels, meta, timestamps |

Weights: `regular` (400), `semibold` (600)

### Spacing (8px grid)

`xs`(4), `sm`(8), `md`(16), `lg`(24), `xl`(32), `xxl`(48)

### Component Specs

- **Buttons:** borderRadius 12, minHeight 48, primary bg=`accent` (#FFF), text variant has no bg
- **Inputs:** borderRadius 8, bg=`bgElevated` (#404040), border=`border` (#404040)
- **Cards:** borderRadius 12, bg=`bgCard` (#2D2D2D), border=`border` (#404040), padding 16
- **Checkbox:** 24x24, borderRadius 12, checked=green border + green tint bg, checkmark=#16A34A
- **Swipe-to-delete:** ReanimatedSwipeable, swipe right to reveal 80px red delete button

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
Imports -> Types -> Component (hooks, effects, handlers, render) -> StyleSheet

### State Management
- Zustand for global state (active workout, settings)
- `useState` for local UI state and edit mode (e.g. workout detail editing)
- Keep state close to usage; avoid prop drilling
- Active workout state lives in `workoutStore` — never use it for editing saved workouts

### Gestures
- App wrapped in `GestureHandlerRootView` (`_layout.tsx`)
- Screens with swipeable rows use `ScrollView` from `react-native-gesture-handler` (not from `react-native`) to avoid gesture conflicts
- Swipe-to-delete uses `ReanimatedSwipeable` with `renderLeftActions`

### Database
- See `DATABASE.md` for full schema, queries, and patterns
- All queries in `lib/database/queries/`
- Handle errors with try/catch + Alert.alert

### Performance
- React.memo for expensive components
- useCallback to avoid inline functions in render
- FlatList with keyExtractor + getItemLayout
- SQLite indexes on frequent queries

## Navigation Flow

- **My Workouts tab** (`index.tsx`): Custom templates. Press card -> view-only detail. "Start" button -> start active workout.
- **Logs tab** (`logs.tsx`): Calendar + recent workouts. Press card -> view-only detail. Pencil -> edit mode.
- **Workout detail** (`workout/[id].tsx`): View mode by default. Edit button switches to inline editing (local state, not workoutStore). Save persists to DB.
- **Active workout** (`workout/active.tsx`): Timer, live set tracking, add/remove exercises/sets, finish flow.
- Starting a new active workout only happens from the My Workouts tab.
