import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface NutritionDayNotesState {
  notes: Record<string, string>;
  setNote: (dayKey: string, note: string) => void;
  getNote: (dayKey: string) => string;
}

export const useNutritionDayNotesStore = create<NutritionDayNotesState>()(
  persist(
    (set, get) => ({
      notes: {},
      setNote: (dayKey, note) =>
        set((state) => {
          const next = { ...state.notes };
          const trimmed = note.trim();
          if (trimmed.length === 0) delete next[dayKey];
          else next[dayKey] = trimmed;
          return { notes: next };
        }),
      getNote: (dayKey) => get().notes[dayKey] ?? "",
    }),
    {
      name: "nutrition-day-notes",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ notes: state.notes }),
    }
  )
);
