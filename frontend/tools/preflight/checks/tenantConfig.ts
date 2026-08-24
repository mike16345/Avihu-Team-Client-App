import { createExpoConfig } from "../../../config/createExpoConfig";
import { tenantConfigSchema } from "../../../config/tenants/schema";
import type { CheckDefinition, CheckResult } from "../types";
import type { ConfigurationPreflightContext } from "../contexts";

const formatIssues = (issues: readonly { path: PropertyKey[]; message: string }[]) =>
  issues.map((issue) => {
    const field = issue.path.length > 0 ? issue.path.join(".") : "tenant";
    return `${field}: ${issue.message}`;
  });

const runTenantConfigCheck = (context: Readonly<ConfigurationPreflightContext>): CheckResult => {
  const parsedTenant = tenantConfigSchema.safeParse(context.tenantConfig);

  if (!parsedTenant.success) {
    return {
      status: "fail",
      check: "tenant.config",
      summary: "Tenant configuration is invalid",
      details: formatIssues(parsedTenant.error.issues),
      remediation: "Correct the selected tenant module and run preflight again.",
    };
  }

  try {
    createExpoConfig({
      baseConfig: {},
      tenant: parsedTenant.data,
      environment: context.environment,
      processEnv: context.processEnv,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    return {
      status: "fail",
      check: "tenant.config",
      summary: "Tenant configuration could not resolve Expo configuration",
      details: [message],
      remediation: "Correct the selected tenant configuration and run preflight again.",
    };
  }

  return {
    status: "pass",
    check: "tenant.config",
    summary: "Tenant configuration is valid",
    details: [
      `Tenant: ${parsedTenant.data.id}`,
      "Shared store identities are explicitly declared where used.",
    ],
  };
};

export const tenantConfigCheck: CheckDefinition<ConfigurationPreflightContext> = {
  check: "tenant.config",
  run: runTenantConfigCheck,
};
