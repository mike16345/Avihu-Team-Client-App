import { ISimpleCardioType } from "@/interfaces/Workout";

export function translateWorkoutKeys(obj: ISimpleCardioType) {
  return [
    { title: "דקות אירובי בשבוע", value: obj.minsPerWeek },
    { title: "דקות לאימון", value: obj.minsPerWorkout },
    { title: "פעמים בשבוע", value: obj.timesPerWeek },
  ];
}

export const aerobicActivities = [
  "הליכה מהירה",
  "ריצה קלה",
  "אופניים",
  "אליפטיקל",
  "מדרגות",
  "קפיצה בחבל",
  "הליכון",
  "שחייה",
  "כל פעילות אירובית בדופק קבוע.",
];
