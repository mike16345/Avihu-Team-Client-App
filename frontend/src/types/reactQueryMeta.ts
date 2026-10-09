import "@tanstack/react-query";

export interface ReportingMeta extends Record<string, unknown> {
  errorReporting?: {
    owner: "feature" | "query-cache";
    operation?: string;
    expectedStatuses?: number[];
  };
}

declare module "@tanstack/react-query" {
  interface Register {
    queryMeta: ReportingMeta;
    mutationMeta: ReportingMeta;
  }
}
