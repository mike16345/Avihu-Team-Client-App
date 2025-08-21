import armFlex from "@assets/muscles/arm_flex.svg";
import calves from "@assets/muscles/calves.svg";
import gluteus_maximus from "@assets/muscles/gluteus_maximus.svg";
import legs from "@assets/muscles/legs.svg";
import torsoBack from "@assets/muscles/torso_back.svg";
import torsoFront from "@assets/muscles/torso_front.svg";

export const muscleImages = {
  chest: torsoFront,
  shoulders: torsoFront,
  abs: torsoFront,
  tricep: torsoBack,
  back: torsoBack,
  trapezoids: torsoBack,
  bicep: armFlex,
  calves,
  legs,
  glutes: gluteus_maximus,
} as const;

export type muscleImageName = keyof typeof muscleImages;

export const MUSCLE_GROUPS = [
  "חזה",
  "כתפיים",
  "גב",
  "יד קדמית",
  "יד אחורית",
  "בטן",
  "רגליים",
  "ישבן",
  "תאומים",
  "טרפזים",
] as const;

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

export const MUSCLE_GROUPS_ENGLISH: Record<MuscleGroup, muscleImageName> = {
  חזה: "chest",
  כתפיים: "shoulders",
  גב: "back",
  "יד קדמית": "bicep",
  "יד אחורית": "tricep",
  בטן: "abs",
  רגליים: "legs",
  ישבן: "glutes",
  תאומים: "calves",
  טרפזים: "trapezoids",
};
