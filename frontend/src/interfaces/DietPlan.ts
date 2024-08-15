import { Carbs } from "@/enums/Carbs";
import { Proteins } from "@/enums/Proteins";

export interface IDietPlan {
  id: string;
  meals: IMeal[];
  totalCalories: number;
}

export interface ICustomItemInstructions {
  item: string;
  quantity: number;
}

export interface IMealItem{
  quantity:number,
  unit:string
  customInstructions?: ICustomItemInstructions[];
}

export interface IMeal {
  id: string;
  totalProtein: IMealItem;
  totalCarbs: IMealItem;
  totalFats?: IMealItem;
  totalVeggies?: IMealItem;
}
export interface IServingItem {
  spoons: number;
  grams: number;
}

export interface IMenuItem {
  name: string;
  dietaryType: string[];
  foodGroup: string;
  oneServing: IServingItem;
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
