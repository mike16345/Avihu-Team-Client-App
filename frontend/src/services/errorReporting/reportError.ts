import { sanitizeDiagnostics, sanitizeText } from "./sanitize";
import type { ErrorReportContext, ErrorReporter } from "./types";

let reporter: ErrorReporter | null = null;
let reportedErrors = new WeakSet<Error>();

export const setErrorReporter = (adapter: ErrorReporter | null): void => {
  reporter = adapter;
  reportedErrors = new WeakSet();
};

export const reportError = (error: unknown, context: ErrorReportContext): string | undefined => {
  try {
    if (!reporter) return undefined;
    const exception =
      error instanceof Error
        ? error
        : new Error(
            typeof error === "string" ? sanitizeText(error) : "Unexpected non-Error exception"
          );
    if (reportedErrors.has(exception)) return undefined;
    const clean = sanitizeDiagnostics({
      ...context,
      diagnostics: {
        ...context.diagnostics,
        ...(error instanceof Error ? {} : { thrownValue: error }),
      },
    }) as ErrorReportContext;
    const eventId = reporter(exception, clean);
    if (eventId) reportedErrors.add(exception);
    return eventId;
  } catch {
    return undefined;
  }
};

export type { ErrorReportContext, ErrorReporter } from "./types";
