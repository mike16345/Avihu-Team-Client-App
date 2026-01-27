import Chest from "@assets/measurements/masurement-chest.jpg";
import Hip from "@assets/measurements/measurement-hips.png";
import Arm from "@assets/measurements/masurement-arm.jpg";
import Thigh from "@assets/measurements/measurement-thigh.png";
import Glutes from "@assets/measurements/measurement-glutes.png";
import Calf from "@assets/measurements/measurement-calf.png";

export const MEASUREMENT_MUSCLE_GROUPS = ["חזה", "זרוע", "מותן", "ישבן", "ירך", "תאומים"] as const;

export type MeasurementMuscle = (typeof MEASUREMENT_MUSCLE_GROUPS)[number];

export const MEASUREMENT_DESCRIPTIONS: Record<MeasurementMuscle, string> = {
  חזה: "נמדד בקו הפטמות, תוך שמירה שהסרט מאוזן.",
  זרוע: " לרוב נמדד באמצע הזרוע העליונה (בכיפוף או רפוי – העיקר להיות עקבי).",
  מותן: "באזור הצר ביותר של המותניים או בקו הטבור, חשוב למדוד תמיד באותה נקודה.",
  ישבן: "בנקודה הרחבה ביותר של הישבן.",
  ירך: " באמצע הירך בנקודה הכי רחבה .",
  תאומים: "בנקודה הרחבה ביותר של שריר התאומים.",
};

export const MEASUREMENT_GROUPS_ENGLISH: Record<MeasurementMuscle, string> = {
  חזה: "chest",
  ישבן: "glutes",
  תאומים: "calf",
  זרוע: "arm",
  ירך: "thigh",
  מותן: "waist",
};

export const muscleImages: Record<string, any> = {
  חזה: Chest,
  ישבן: Glutes,
  תאומים: Calf,
  זרוע: Arm,
  ירך: Thigh,
  מותן: Hip,
} as const;
