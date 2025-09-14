import z from "zod";

const MAX_WEIGH_IN = 500;

const weighInSchema = z.object({
  weight: z
    .number({
      required_error: "יש להזין מספר",
      invalid_type_error: "הערך חייב להיות מספר",
    })
    .positive("המספר חייב להיות גדול מ-0")
    .max(MAX_WEIGH_IN, `המספר חייב להיות קטן מ-${MAX_WEIGH_IN}`),
});

export default weighInSchema;
