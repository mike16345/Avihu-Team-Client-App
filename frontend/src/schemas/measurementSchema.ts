import z from "zod";

const MAX_MEASUREMENT = 160;

const measurementSchema = z.object({
  measurement: z
    .number({
      required_error: "יש להזין מספר",
      invalid_type_error: "אנא הזינו מספר תקין",
    })
    .positive("המספר חייב להיות גדול מ-0")
    .max(MAX_MEASUREMENT, `המספר חייב להיות קטן מ-${MAX_MEASUREMENT}`),
});

export default measurementSchema;
