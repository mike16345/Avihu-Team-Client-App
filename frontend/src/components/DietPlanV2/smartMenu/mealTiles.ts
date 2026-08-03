import { FC } from "react";
import { MoonIcon, SunIcon, SunriseIcon } from "../dietV2Icons";

export interface MealTile {
  id: string;
  label: string;
  Icon: FC<{ size?: number; color?: string }>;
}

const MEAL_ICON_CYCLE: FC<{ size?: number; color?: string }>[] = [
  SunriseIcon,
  SunIcon,
  MoonIcon,
];

export const buildMealTiles = (mealCount: number): MealTile[] => {
  const count = Math.max(1, mealCount);
  const tiles: MealTile[] = [];
  for (let i = 0; i < count; i++) {
    tiles.push({
      id: `meal-${i + 1}`,
      label: `ארוחה ${i + 1}`,
      Icon: MEAL_ICON_CYCLE[i % MEAL_ICON_CYCLE.length],
    });
  }
  return tiles;
};

export const nextMealTile = (existing: MealTile[]): MealTile => {
  const next = existing.length + 1;
  return {
    id: `meal-extra-${next}`,
    label: `ארוחה ${next}`,
    Icon: MEAL_ICON_CYCLE[(next - 1) % MEAL_ICON_CYCLE.length],
  };
};

