import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface PinnedArticlesState {
  pinnedIds: string[];
  togglePin: (articleId: string) => void;
  isPinned: (articleId: string) => boolean;
}

export const usePinnedArticlesStore = create<PinnedArticlesState>()(
  persist(
    (set, get) => ({
      pinnedIds: [],
      togglePin: (articleId) =>
        set((state) => ({
          pinnedIds: state.pinnedIds.includes(articleId)
            ? state.pinnedIds.filter((id) => id !== articleId)
            : [articleId, ...state.pinnedIds],
        })),
      isPinned: (articleId) => get().pinnedIds.includes(articleId),
    }),
    {
      name: "pinned-articles",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ pinnedIds: state.pinnedIds }),
    }
  )
);
