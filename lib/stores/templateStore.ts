import { create } from 'zustand';
import { MAX_EXERCISES_PER_WORKOUT } from '@/lib/utils/validation';

interface TemplateExercise {
  name: string;
  muscleGroup: string | null;
  category: string;
}

interface TemplateState {
  name: string;
  exercises: TemplateExercise[];

  setName: (name: string) => void;
  addExercise: (name: string, muscleGroup: string | null, category: string) => void;
  removeExercise: (index: number) => void;
  reorderExercise: (fromIndex: number, toIndex: number) => void;
  reset: () => void;
}

export const useTemplateStore = create<TemplateState>((set, get) => ({
  name: '',
  exercises: [],

  setName: (name) => set({ name }),

  addExercise: (name, muscleGroup, category) => {
    const { exercises } = get();
    if (exercises.length >= MAX_EXERCISES_PER_WORKOUT) return;
    // Don't add duplicates
    if (exercises.some((e) => e.name === name)) return;
    set({ exercises: [...exercises, { name, muscleGroup, category }] });
  },

  removeExercise: (index) => {
    const { exercises } = get();
    set({ exercises: exercises.filter((_, i) => i !== index) });
  },

  reorderExercise: (fromIndex, toIndex) => {
    const { exercises } = get();
    const updated = [...exercises];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    set({ exercises: updated });
  },

  reset: () => set({ name: '', exercises: [] }),
}));
