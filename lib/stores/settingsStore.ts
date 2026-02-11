import { create } from 'zustand';
import { getDb } from '@/lib/database/db';
import { UserSettings } from '@/types/workout';

interface SettingsRow {
  id: number;
  weight_unit: string;
  distance_unit: string;
  default_rest_timer: number;
  theme: string;
  created_at: number;
  updated_at: number;
}

interface SettingsState {
  settings: UserSettings;
  loadSettings: () => void;
  updateWeightUnit: (unit: 'lbs' | 'kg') => void;
  updateDistanceUnit: (unit: 'km' | 'mi') => void;
  updateRestTimer: (seconds: number) => void;
}

const defaultSettings: UserSettings = {
  id: 1,
  weightUnit: 'lbs',
  distanceUnit: 'km',
  defaultRestTimer: 90,
  theme: 'light',
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: defaultSettings,

  loadSettings: () => {
    const db = getDb();
    const row = db.getFirstSync<SettingsRow>('SELECT * FROM user_settings WHERE id = 1');

    if (row) {
      set({
        settings: {
          id: row.id,
          weightUnit: row.weight_unit as 'lbs' | 'kg',
          distanceUnit: (row.distance_unit as 'km' | 'mi') ?? 'km',
          defaultRestTimer: row.default_rest_timer,
          theme: row.theme as 'light' | 'dark',
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        },
      });
    }
  },

  updateWeightUnit: (unit) => {
    const db = getDb();
    const now = Date.now();
    db.runSync('UPDATE user_settings SET weight_unit = ?, updated_at = ? WHERE id = 1', [unit, now]);

    set((state) => ({
      settings: { ...state.settings, weightUnit: unit, updatedAt: now },
    }));
  },

  updateDistanceUnit: (unit) => {
    const db = getDb();
    const now = Date.now();
    db.runSync('UPDATE user_settings SET distance_unit = ?, updated_at = ? WHERE id = 1', [unit, now]);

    set((state) => ({
      settings: { ...state.settings, distanceUnit: unit, updatedAt: now },
    }));
  },

  updateRestTimer: (seconds) => {
    const db = getDb();
    const now = Date.now();
    db.runSync('UPDATE user_settings SET default_rest_timer = ?, updated_at = ? WHERE id = 1', [seconds, now]);

    set((state) => ({
      settings: { ...state.settings, defaultRestTimer: seconds, updatedAt: now },
    }));
  },
}));
