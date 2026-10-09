export interface ErrorReportContext {
  operation: string;
  tags?: Record<string, string>;
  diagnostics?: Record<string, unknown>;
}

export type ErrorReporter = (error: Error, context: ErrorReportContext) => string | undefined;
