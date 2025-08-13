import { create } from "zustand";

interface IUserStore {
  totalCaloriesEaten: number;
  setTotalCaloriesEaten: (calories: number) => void;
}

export const useDietPlanStore = create<IUserStore>((set) => ({
  totalCaloriesEaten: 0,
  setTotalCaloriesEaten: (calories) => set({ totalCaloriesEaten: calories }),
}));
