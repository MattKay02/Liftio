# Liftio

A minimalist gym tracking app for logging workouts fast. No distractions, no fluff — just your lifts.

## Features

- Start and log workouts with exercises, sets, reps, and weight
- Browse a built-in exercise library (30+ exercises)
- View workout history and past performance
- Auto-fill weight from previous sessions
- Fully offline — all data stored locally on device

## Tech Stack

- **React Native** + **Expo SDK 54** (TypeScript)
- **Expo Router** — file-based navigation
- **Zustand** — state management
- **Expo SQLite** — local database
- **Custom UI** — greyscale design system, no UI library

## Getting Started

```bash
npm install
npx expo start
```

Requires a physical device with Expo Go or an Android emulator (no web support due to SQLite).
