import { SetInput } from "@/components/WorkoutPlan/RecordExercise/SetInputContainer";
import { Platform } from "react-native";

export const IS_IOS = Platform.OS === "ios";
export const IS_ANDROID = Platform.OS === "android";

export const DEFAULT_PAGE_TOP_PADDING = 36;
export const DEFAULT_INITIAL_WEIGHT = 60;
export const DEFAULT_INITIAL_WEIGHT_DECIMAL = 50;
export const DEFAULT_MESSAGE_TO_TRAINER = "מה קורה אחי?";
export const BOTTOM_BAR_HEIGHT = 20;
export const TOP_BAR_HEIGHT = 40;
export const GRAPH_HEIGHT = 250;
export const RECORD_SET_SHEET_MAX_PEEK_HEIGHT = 240;

export const STREAM_ENABLED = false;
export const EMAIL_ERROR = "אנא הכניסו כתובת מייל תקינה";
export const INVALID_PASSWORD_MATCH = `סיסמאות לא תואמות`;
export const INVALID_PASSWORD = `סיסמה לא תקינה`;
export const NO_PASSWORD = `אנא הזינו סיסמה`;
export const NO_ACCESS = `אין למשתמש גישה!`;
export const SESSION_EXPIRED = `נא להיכנס שוב`;
export const CARDIO_VALUE = "אירובי";

export const AVG_PROTEIN_CALORIES = 150;
export const AVG_FAT_CALORIES = 100;
export const AVG_CARB_CALORIES = 115;
export const AVG_VEGGIE_CALORIES = 30;

export const MIN_REPS = 0;
export const MAX_REPS = 125;
export const MIN_WEIGHT = 0;
export const MAX_WEIGHT = 250;

export const INVALID_OPTIONS_MESSAGE = "שגיאת נתונים בטופס.";
export const REQUIRED_MESSAGE = "אנא מלא/י את השאלה.";

export const DEFAULT_SET: Omit<SetInput, "setNumber"> = {
  repsDone: 0,
  weight: 0,
};
