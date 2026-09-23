import type { CheckDefinition, CheckResult } from "../types";
import type { ConfigurationPreflightContext } from "../contexts";
import type { ProcessPreflightContext } from "../processCheck";
import { EAS_CLI_ARGS } from "../../eas/constants";

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

export const easEnvironmentCheck: CheckDefinition<ProcessPreflightContext> = {
  check: "eas.environment",
  run: async (context) => {
    const requiredNames = context.tenantConfig.requiredEnvironmentVariables[context.environment];
    const probe = [
      `const names=${JSON.stringify(requiredNames)};`,
      "const missing=names.filter((name)=>!process.env[name]?.trim());",
      'console.log("REMOTE_ENV_MISSING:"+JSON.stringify(missing));',
      "process.exitCode=missing.length>0?1:0;",
    ].join("");
    const result = await context.runner({
      command: "npx",
      args: [
        ...EAS_CLI_ARGS,
        "env:exec",
        context.environment,
        `node -e '${probe}'`,
        "--non-interactive",
      ],
      cwd: context.projectRoot,
      env: {
        APP_TENANT: context.tenant,
        APP_ENV: context.environment,
        ...Object.fromEntries(requiredNames.map((name) => [name, ""])),
      },
      timeoutMs: 60_000,
    });

    if (result.exitCode === 0) {
      return {
        status: "pass",
        check: "eas.environment",
        summary: "Required EAS environment variables are present",
        details: requiredNames.map((name) => `Present: ${name}`).sort(),
      };
    }

    const missing = result.stdout.match(/REMOTE_ENV_MISSING:(\[[^\r\n]*\])/u);
    const missingNames = missing ? (JSON.parse(missing[1]) as string[]) : [];
    return {
      status: "fail",
      check: "eas.environment",
      summary: "Required EAS environment variables are missing or could not be verified",
      details: missingNames.map((name) => `Missing: ${name}`).sort(),
      remediation: `Check ${context.tenant}'s ${context.environment} environment on EAS, then rerun preflight.`,
    };
  },
};
