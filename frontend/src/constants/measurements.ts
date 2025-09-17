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
