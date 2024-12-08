import { create } from "zustand";

interface IFoodGroupStore {
  foodGroupToDisplay: string | null;
  setFoodGroupToDisplay: (foodgroup: string | null) => void;
}

export const useFoodGroupStore = create<IFoodGroupStore>((set) => ({
  foodGroupToDisplay: null,
  setFoodGroupToDisplay: (foodgroup: string | null) => set({ foodGroupToDisplay: foodgroup }),
}));
