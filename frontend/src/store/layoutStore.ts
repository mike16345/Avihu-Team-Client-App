import { create } from "zustand";

interface ILayoutStore {
  isNavbarOpen: boolean;
  isTopBarVisible: boolean;
  setIsTopBarVisible: (isVisible: boolean) => void;
  setIsNavbarOpen: (isOpen: boolean) => void;
}

export const useLayoutStore = create<ILayoutStore>((set) => ({
  isNavbarOpen: true,
  isTopBarVisible: true,
  setIsTopBarVisible: (isVisible: boolean) => {
    set({ isTopBarVisible: isVisible });
  },
  setIsNavbarOpen: (isOpen: boolean) => set({ isNavbarOpen: isOpen }),
}));
