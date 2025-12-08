import { create } from "zustand";

interface ILayoutStore {
  isNavbarOpen: boolean;
  isTopBarVisible: boolean;
  isSheetExpanded?: boolean;
  setIsTopBarVisible: (isVisible: boolean) => void;
  setIsNavbarOpen: (isOpen: boolean) => void;
  setIsSheetExpanded: (isExpanded: boolean) => void;

}

export const useLayoutStore = create<ILayoutStore>((set) => ({
  isNavbarOpen: true,
  isTopBarVisible: true,
  isSheetExpanded: false,
  setIsSheetExpanded: (isExpanded: boolean) => {
    set({ isSheetExpanded: isExpanded });
  },
  setIsTopBarVisible: (isVisible: boolean) => {
    set({ isTopBarVisible: isVisible });
  },
  setIsNavbarOpen: (isOpen: boolean) => set({ isNavbarOpen: isOpen }),
}));
