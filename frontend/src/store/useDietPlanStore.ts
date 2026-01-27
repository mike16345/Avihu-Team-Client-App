import { create } from "zustand";

interface IUserStore {
  totalCaloriesEaten: number;
  setTotalCaloriesEaten: (calories: number, override?: boolean) => void;
}

export const useDietPlanStore = create<IUserStore>((set, get) => ({
  totalCaloriesEaten: 0,
  setTotalCaloriesEaten: (calories, override = true) => {
    const totalCalories = get().totalCaloriesEaten;
    const caloriesToSet = override ? calories : totalCalories + calories;

    set({ totalCaloriesEaten: caloriesToSet <= 0 ? 0 : caloriesToSet });
  },
}));
