import { create } from "zustand";

interface IUserDrawerStore {
  openUserDrawer: boolean;
  setOpenUserDrawer: (value: boolean) => void;
}

export const useUserDrawer = create<IUserDrawerStore>((set) => ({
  openUserDrawer: false,
  setOpenUserDrawer: (value: boolean) => set({ openUserDrawer: value }),
}));
