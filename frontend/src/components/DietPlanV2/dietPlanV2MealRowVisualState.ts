export interface DietPlanV2MealRowVisualState {
  layout: {
    borderWidth: number;
    badgeWidth: number;
    badgeHeight: number;
  };
  badgeOpacity: number;
}

export const getDietPlanV2MealRowVisualState = (
  consumed: boolean
): DietPlanV2MealRowVisualState => ({
  layout: {
    borderWidth: 1,
    badgeWidth: 62,
    badgeHeight: 23,
  },
  badgeOpacity: consumed ? 1 : 0,
});
