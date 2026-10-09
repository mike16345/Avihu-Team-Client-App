import type { ErrorReportContext } from "@/services/errorReporting/types";

export const createFormErrorContext = (input: {
  formId: string;
  formType: string;
  stage: "upload" | "submit" | "complete";
  answers: Record<string, unknown>;
  sections?: unknown;
  payload?: unknown;
  error: unknown;
  submitted: boolean;
}): ErrorReportContext => ({
  operation: `form.${input.stage}`,
  tags: { formType: input.formType },
  diagnostics: {
    formId: input.formId,
    answers: input.answers,
    sections: input.sections,
    payload: input.payload,
    submitted: input.submitted,
    failure: input.error,
  },
});
