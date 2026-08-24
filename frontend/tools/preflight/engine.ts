import {
  checkResultSchema,
  type CheckDefinition,
  type CheckInput,
  type CheckResult,
  type CheckRunner,
  type PreflightContext,
  type PreflightCounts,
  type PreflightReport,
} from "./types";

const DEFAULT_CONTEXT: PreflightContext = {
  tenant: "unknown",
  environment: "unknown",
};

const getCheckId = <TContext extends PreflightContext>(
  definition: CheckInput<TContext>,
  index: number
) => {
  if (typeof definition === "function") {
    return definition.check || definition.id || definition.name || `check-${index + 1}`;
  }

  return definition.check;
};

const getRunner = <TContext extends PreflightContext>(
  definition: CheckInput<TContext>
): CheckRunner<TContext> => {
  if (typeof definition === "function") {
    return definition;
  }

  return definition.run;
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return String(error);
};

const createFailureResult = (check: string, summary: string, detail: string): CheckResult => ({
  status: "fail",
  check,
  summary,
  details: [detail],
});

const countResults = (results: readonly CheckResult[]): PreflightCounts =>
  results.reduce<PreflightCounts>(
    (counts, result) => ({ ...counts, [result.status]: counts[result.status] + 1 }),
    { pass: 0, warn: 0, fail: 0 }
  );

const runCheck = async <TContext extends PreflightContext>(
  definition: CheckInput<TContext>,
  index: number,
  context: Readonly<TContext>
): Promise<CheckResult> => {
  const check = getCheckId(definition, index);

  try {
    const result = await getRunner(definition)(context);
    const parsedResult = checkResultSchema.safeParse(result);

    if (!parsedResult.success) {
      return createFailureResult(
        check,
        "Check returned an invalid result",
        parsedResult.error.message
      );
    }

    return parsedResult.data;
  } catch (error) {
    return createFailureResult(check, "Check threw an unexpected error", getErrorMessage(error));
  }
};

export const runChecks = async <TContext extends PreflightContext = PreflightContext>(
  definitions: readonly CheckInput<TContext>[],
  context: TContext = DEFAULT_CONTEXT as TContext
): Promise<PreflightReport> => {
  const immutableContext = Object.freeze({ ...DEFAULT_CONTEXT, ...context });
  const results = await Promise.all(
    definitions.map((definition, index) => runCheck(definition, index, immutableContext))
  );
  const counts = countResults(results);

  return {
    schemaVersion: 1,
    tenant: immutableContext.tenant,
    environment: immutableContext.environment,
    timestamp: immutableContext.timestamp ?? new Date().toISOString(),
    counts,
    results,
    exitCode: counts.fail > 0 ? 1 : 0,
  };
};

export type { CheckDefinition };
