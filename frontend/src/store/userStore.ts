import { IUser } from "@/interfaces/User";
import { create } from "zustand";

interface IUserStore {
  currentUser: IUser | null;
  setCurrentUser: (user: IUser) => void;
}

export const useUserStore = create<IUserStore>((set) => ({
  currentUser: null,
  setCurrentUser: (user: IUser) => set({ currentUser: user }),
}));
