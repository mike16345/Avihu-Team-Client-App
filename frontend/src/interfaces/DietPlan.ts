export interface ICustomItem {
  _id: string;
  name: string;
  dietaryType: string[];
  foodGroup: string;
  oneServing: IServingItem;
}

export interface ICustomMenuItem {
  item: string;
  quantity: number;
}

export interface IDietItem {
  quantity: number;
  customItems?: ICustomItem[];
  extraItems: string[];
}

export interface IMeal {
  _id: string;
  totalProtein: IDietItem;
  totalCarbs: IDietItem;
}

export interface IDietPlan {
  meals: IMeal[];
  totalCalories?: number;
  freeCalories: number;
  fatsPerDay?: number;
  veggiesPerDay?: number;
  customInstructions?: string[];
  supplements?: string[];
}

export interface IDietPlanPreset extends IDietPlan {
  name: string;
}

export type DietItemUnit =
  | "grams"
  | "spoons"
  | "pieces"
  | "scoops"
  | "cups"
  | "units"
  | "teaSpoons";

export interface IServingItem {
  grams?: number;
  spoons?: number;
  scoops?: number;
  cups?: number;
  teaSpoons?: number;
  pieces?: number;
  units?: number;
}

export interface IMenuItem {
  _id: string;
  name: string;
  dietaryType: string[];
  foodGroup: string;
  oneServing: IServingItem;
}

export interface IMenue {
  menuName: string;
  menuItems: IMenuItem[];
}

export type CustomItems = {
  fats: ICustomItem[];
  carbs: ICustomItem[];
  vegetables: ICustomItem[];
  protein: ICustomItem[];
};
