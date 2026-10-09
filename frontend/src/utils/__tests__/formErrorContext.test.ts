import { expect, it } from "vitest";
import { createFormErrorContext } from "../formErrorContext";
import { sanitizeDiagnostics } from "@/services/errorReporting/sanitize";
it("retains relevant answers and distinguishes failures after accepted submission", () => {
  const context = createFormErrorContext({ formId: "form-1", formType: "onboarding", stage: "complete", answers: { q1: "כאב בברך" }, payload: { password: "PRIVATE" }, error: Object.assign(new Error("upload"), { stage: "putToS3", questionId: "q1", fileIndex: 2, fileMetadata: { size: 1024, mimeType: "image/png" } }), submitted: true });
  expect(context.operation).toBe("form.complete");
  const clean = JSON.stringify(sanitizeDiagnostics(context));
  expect(clean).toContain("כאב בברך"); expect(clean).toContain("putToS3"); expect(clean).toContain("1024");
  expect(clean).not.toContain("PRIVATE"); expect(context.diagnostics?.submitted).toBe(true);
});
