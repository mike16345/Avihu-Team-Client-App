import type { CheckDefinition, CheckResult } from "../types";
import type { ConfigurationPreflightContext } from "../contexts";

const runEnvironmentCheck = (context: Readonly<ConfigurationPreflightContext>): CheckResult => {
  const requiredNames = context.tenantConfig.requiredEnvironmentVariables[context.environment];
  const missingNames = [...requiredNames]
    .filter((name) => !context.processEnv[name]?.trim())
    .sort((left, right) => left.localeCompare(right));

  if (missingNames.length > 0) {
    return {
      status: "fail",
      check: "tenant.environment",
      summary: "Required environment variables are missing",
      details: missingNames.map((name) => `Missing: ${name}`),
      remediation: "Set the listed symbolic environment names, then run preflight again.",
    };
  }

  return {
    status: "pass",
    check: "tenant.environment",
    summary: "Required environment variables are present",
    details: requiredNames.map((name) => `Present: ${name}`).sort(),
  };
};

export const environmentCheck: CheckDefinition<ConfigurationPreflightContext> = {
  check: "tenant.environment",
  run: runEnvironmentCheck,
};
