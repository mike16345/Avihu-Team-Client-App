import { ISimpleCardioType } from "@/interfaces/Workout";

export const useCardioData = (cardioPlan: ISimpleCardioType) => {
  return [
    { title: "דקות אירובי בשבוע", value: cardioPlan.minsPerWeek },
    { title: "פעמים בשבוע", value: cardioPlan.timesPerWeek },
    { title: "דקות לאימון", value: cardioPlan.minsPerWorkout },
  ];
};
