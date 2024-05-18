import { Carbs } from "../enums/Carbs";
import { Proteins } from "../enums/Proteins";

export interface IDietPlan {
  id: string;
  meals: IMeal[];
  totalCalories: number;
}

export interface IMeal {
  id: string;
  totalProtein: number;
  totalCarbs: number;
  totalFats?: number;
  totalVeggies?: number;
}

export interface IRecordedMeal {
  id: string;
  protein: {
    type: Proteins; // e.g., chicken, meat, etc.
    amount: number; // in grams
  };
  carb: {
    type: Carbs; // e.g., bread, rice, etc.
    amount: number; // in grams
  };
  note: string; // e.g., "Shit was ass and I am still hungry!"
}
