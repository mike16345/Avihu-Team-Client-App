import { create } from "zustand";

interface ILayoutStore {
  isNavbarOpen: boolean;
  setIsNavbarOpen: (isOpen: boolean) => void;
}

export const useLayoutStore = create<ILayoutStore>((set) => ({
  isNavbarOpen: false,
  setIsNavbarOpen: (isOpen: boolean) => set({ isNavbarOpen: isOpen }),
}));
