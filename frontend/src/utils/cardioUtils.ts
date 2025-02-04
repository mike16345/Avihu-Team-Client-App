import { ISimpleCardioType } from "@/interfaces/Workout";

export function translateWorkoutKeys(obj: ISimpleCardioType) {
  return [
    { title: "דקות אירובי בשבוע", value: obj.minsPerWeek },
    { title: "פעמים בשבוע", value: obj.timesPerWeek },
    { title: "דקות לאימון", value: obj.minsPerWorkout },
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
