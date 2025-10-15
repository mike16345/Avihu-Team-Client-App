import { MAX_REPS, MAX_WEIGHT } from "@/constants/Constants";
import { z } from "zod";

const setSchema = z
  .object({
    setNumber: z
      .number({
        required_error: "נדרש מספר סט",
        invalid_type_error: "מספר הסט חייב להיות מספר",
      })
      .int({ message: "מספר הסט חייב להיות שלם" })
      .min(1, { message: "מספר הסט חייב להיות 1 ומעלה" })
      .optional(),

    weight: z
      .number({
        required_error: "נדרש משקל",
        invalid_type_error: "המשקל חייב להיות מספר",
      })
      .min(0, { message: "המשקל לא יכול להיות שלילי" })
      .max(MAX_WEIGHT, { message: `המשקל לא יכול לעלות על ${MAX_WEIGHT}` }),

    repsDone: z
      .number({
        required_error: "נדרש מספר חזרות",
        invalid_type_error: "מספר החזרות חייב להיות מספר",
      })
      .int({ message: "מספר החזרות חייב להיות שלם" })
      .min(1, { message: "מספר החזרות חייב להיות 1 ומעלה" })
      .max(MAX_REPS, { message: `מספר החזרות לא יכול לעלות על ${MAX_REPS}` }),
  })
  .strict();

export type SetInput = z.infer<typeof setSchema>;

// שימושי לעדכון מתוך המודל (ללא setNumber)
export const UpdateSetSchema = setSchema.pick({ weight: true, repsDone: true });

// ייבוא בשם, אם אתה מעדיף: import { SetInputSchema } from "@schema/setSchema"
export const SetInputSchema = setSchema;

export default setSchema;
