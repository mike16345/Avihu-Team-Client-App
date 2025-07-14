import { FoodGroup } from "@/types/foodTypes";
import { create } from "zustand";

interface IFoodGroupStore {
  foodGroupToDisplay: FoodGroup | null;
  setFoodGroupToDisplay: (foodgroup: FoodGroup | null) => void;
}

export const useFoodGroupStore = create<IFoodGroupStore>((set) => ({
  foodGroupToDisplay: null,
  setFoodGroupToDisplay: (foodgroup: FoodGroup | null) => set({ foodGroupToDisplay: foodgroup }),
}));
