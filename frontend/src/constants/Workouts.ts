import { WorkoutPlans } from "../enums/WorkoutPlans";
import { WorkoutType } from "../enums/WorkoutTypes";
import { IDetailedWorkoutPlan, IWorkout, IWorkoutPlan } from "../interfaces/Workout";

export const workoutPlanToName = (workoutPlan: WorkoutPlans | string) => {
  switch (Number(workoutPlan)) {
    case WorkoutPlans.WORKOUT_A:
      return "אימון A";
    case WorkoutPlans.WORKOUT_B:
      return "אימון B";
    case WorkoutPlans.FULL_BODY:
      return "אימון C - פול בודי";
    default:
      return "אימון A";
  }
};

export const workoutTypeToName = (workoutType: WorkoutType) => {
  switch (workoutType) {
    case WorkoutType.CHEST:
      return "חזה";
    case WorkoutType.LEGS:
      return "רגלים";
    case WorkoutType.BICEPS:
      return "יד קדמית";
    case WorkoutType.BACK:
      return "גב";
    case WorkoutType.SHOULDERS:
      return "כתפיים";
    case WorkoutType.TRICEPS:
      return "יד אחורית";
    case WorkoutType.ABS:
      return "אימון בטן";
    case WorkoutType.CARDIO:
      return "אירובי";
    default:
      return "";
  }
};

export const workoutPlans: Record<WorkoutPlans, Record<number, IWorkout[]>> = {
  [WorkoutPlans.WORKOUT_A]: {
    [WorkoutType.CHEST]: [
      {
        id: "4",
        tipFromTrainer: "",
        linkToVideo: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        name: "לחיצת חזה עם מוט",
        sets: [
          { minReps: 15, restTime: 40 },
          { minReps: 10, restTime: 40 },
          { minReps: 8, restTime: 40 },
          { minReps: 8, restTime: 40 },
        ],
      },
      {
        id: "5",
        tipFromTrainer: "",
        linkToVideo: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        name: "לחיצת חזה עם משקולות חופשי",
        sets: [
          { minReps: 15, restTime: 40 },
          { minReps: 10, restTime: 40 },
          { minReps: 8, restTime: 40 },
          { minReps: 8, restTime: 40 },
        ],
      },
      {
        id: "6",
        tipFromTrainer: "",
        linkToVideo: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        name: "פרפר בכבל קרוס / פרפר על ספסל",
        sets: [
          { minReps: 15, maxReps: 20, restTime: 40 },
          { minReps: 15, maxReps: 20, restTime: 40 },
          { minReps: 15, maxReps: 20, restTime: 40 },
          { minReps: 15, maxReps: 20, restTime: 40 },
        ],
      },
    ],
    [WorkoutType.SHOULDERS]: [
      {
        id: "4",
        tipFromTrainer: "",
        linkToVideo: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        name: "הרחקת כתף בישיבה / עמידה",
        sets: [
          { minReps: 12, restTime: 40 },
          { minReps: 12, restTime: 40 },
          { minReps: 12, restTime: 40 },
          { minReps: 12, restTime: 40 },
        ],
      },
      {
        id: "4",
        tipFromTrainer: "",
        linkToVideo: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        name: "לחיצת כתפיים משקולות חופשי",
        sets: [
          { minReps: 10, restTime: 40 },
          { minReps: 10, restTime: 40 },
          { minReps: 10, restTime: 40 },
          { minReps: 10, restTime: 40 },
        ],
      },
      {
        id: "4",
        tipFromTrainer: "",
        linkToVideo: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        name: "כפיפת כתף עם משקולות חופשי יד יד",
        sets: [
          { minReps: 12, restTime: 40 },
          { minReps: 12, restTime: 40 },
        ],
      },
    ],
    [WorkoutType.TRICEPS]: [
      {
        id: "4",
        tipFromTrainer: "",
        linkToVideo: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        name: "פשיטת מרפק בפולי עליון עם- חבל או מוט",
        sets: [
          { minReps: 12, restTime: 40 },
          { minReps: 12, restTime: 40 },
          { minReps: 12, restTime: 40 },
          { minReps: 12, restTime: 40 },
        ],
      },
      {
        id: "4",
        tipFromTrainer: "",
        linkToVideo: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        name: "פשיטה מרפק מאחורי הראש או בפולי עליון",
        sets: [
          { minReps: 12, maxReps: 15, restTime: 40 },
          { minReps: 12, maxReps: 15, restTime: 40 },
          { minReps: 12, maxReps: 15, restTime: 40 },
        ],
      },
      {
        id: "4",
        tipFromTrainer: "",
        linkToVideo: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        name: "פשיטת מרפק יד יד",
        sets: [
          { minReps: 15, restTime: 40 },
          { minReps: 15, restTime: 40 },
          { minReps: 15, restTime: 40 },
        ],
      },
    ],
  },
  [WorkoutPlans.WORKOUT_B]: {
    [WorkoutType.CHEST]: [
      {
        id: "1",
        tipFromTrainer: "",
        linkToVideo: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        name: "Triceps",
        sets: [
          { minReps: 15, restTime: 40 },
          { minReps: 10, restTime: 40 },
          { minReps: 8, restTime: 40 },
          { minReps: 8, restTime: 40 },
        ],
      },
    ],
    [WorkoutType.LEGS]: [
      {
        id: "2",
        tipFromTrainer: "",
        linkToVideo: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        name: "Biceps",
        sets: [
          { minReps: 15, restTime: 40 },
          { minReps: 10, restTime: 40 },
          { minReps: 8, restTime: 40 },
          { minReps: 8, restTime: 40 },
        ],
      },
    ],
  },
  [WorkoutPlans.FULL_BODY]: {
    [WorkoutType.CHEST]: [
      {
        id: "4",
        tipFromTrainer: "",
        linkToVideo: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        name: "לחיצת חזה עם מוט",
        sets: [
          { minReps: 15, restTime: 40 },
          { minReps: 10, restTime: 40 },
          { minReps: 8, restTime: 40 },
          { minReps: 8, restTime: 40 },
        ],
      },
    ],
    [WorkoutType.SHOULDERS]: [
      {
        id: "4",
        tipFromTrainer: "",
        linkToVideo: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        name: "הרחקת כתף",
        sets: [
          { minReps: 12, restTime: 40 },
          { minReps: 12, restTime: 40 },
          { minReps: 12, restTime: 40 },
          { minReps: 12, restTime: 40 },
        ],
      },
    ],
    [WorkoutType.TRICEPS]: [
      {
        id: "4",
        tipFromTrainer: "",
        linkToVideo: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        name: "פשיטת מרפק בפולי עליון עם- חבל או מוט",
        sets: [
          { minReps: 12, maxReps: 15, restTime: 40 },
          { minReps: 12, maxReps: 15, restTime: 40 },
          { minReps: 12, maxReps: 15, restTime: 40 },
          { minReps: 12, maxReps: 15, restTime: 40 },
        ],
      },
    ],
    [WorkoutType.BICEPS]: [
      {
        id: "4",
        tipFromTrainer: "",
        linkToVideo: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        name: "פטישים בישיבה יד יד ",
        sets: [
          { minReps: 12, maxReps: 15, restTime: 40 },
          { minReps: 12, maxReps: 15, restTime: 40 },
          { minReps: 12, maxReps: 15, restTime: 40 },
          { minReps: 12, maxReps: 15, restTime: 40 },
        ],
      },
    ],
    [WorkoutType.BACK]: [
      {
        id: "4",
        tipFromTrainer: "",
        linkToVideo: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        name: "מתח בפולי עליון אחיזה רחבה",
        sets: [
          { minReps: 10, maxReps: 12, restTime: 40 },
          { minReps: 10, maxReps: 12, restTime: 40 },
          { minReps: 10, maxReps: 12, restTime: 40 },
          { minReps: 10, maxReps: 12, restTime: 40 },
        ],
      },
    ],
    [WorkoutType.LEGS]: [
      {
        id: "2",
        tipFromTrainer: "",
        linkToVideo: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        name: "לחיצת רגלים במכונה יעודית",
        sets: [
          { minReps: 10, maxReps: 12, restTime: 40 },
          { minReps: 10, maxReps: 12, restTime: 40 },
          { minReps: 10, maxReps: 12, restTime: 40 },
          { minReps: 10, maxReps: 12, restTime: 40 },
        ],
      },
      {
        id: "2",
        tipFromTrainer: "",
        linkToVideo: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        name: "כפיפת ברכיים במכונה יעודית",
        sets: [
          { minReps: 12, restTime: 40 },
          { minReps: 12, restTime: 40 },
          { minReps: 12, restTime: 40 },
          { minReps: 12, restTime: 40 },
        ],
      },
      {
        id: "2",
        tipFromTrainer: "",
        linkToVideo: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        name: "הרמת עקבים בסמיט משין",
        sets: [
          { minReps: 12, maxReps: 15, restTime: 40 },
          { minReps: 12, maxReps: 15, restTime: 40 },
          { minReps: 12, maxReps: 15, restTime: 40 },
          { minReps: 12, maxReps: 15, restTime: 40 },
        ],
      },
    ],
  },
};
