import type { Mutation, Query } from "@tanstack/react-query";
import type { ReportingMeta } from "@/types/reactQueryMeta";
import { reportError } from "./reportError";

const shouldCapture = (error: unknown, meta?: ReportingMeta): boolean => {
  if (meta?.errorReporting?.owner === "feature") return false;
  const failure = error as { status?: number; response?: { status?: number } } | null;
  const status = failure?.response?.status ?? failure?.status;
  return status === undefined || !meta?.errorReporting?.expectedStatuses?.includes(status);
};

export const reportQueryFailure = (error: unknown, query: Query<unknown, unknown>): void => {
  if (!shouldCapture(error, query.meta)) return;
  reportError(error, {
    operation: query.meta?.errorReporting?.operation ?? "query.fetch",
    diagnostics: { queryKey: query.queryKey },
  });
};

export const reportMutationFailure = (
  error: unknown,
  _variables: unknown,
  mutation: Mutation<unknown, unknown, unknown, unknown>
): void => {
  if (!shouldCapture(error, mutation.meta)) return;
  reportError(error, {
    operation: mutation.meta?.errorReporting?.operation ?? "mutation.execute",
    diagnostics: { mutationKey: mutation.options.mutationKey },
  });
};
