import { realpath } from "node:fs/promises";
import type { ExpoConfig } from "@expo/config";
import { createExpoConfig } from "../../config/createExpoConfig";
import { getTenant } from "../../config/tenants/registry";
import type { TenantConfig, TenantEnvironment } from "../../config/tenants/types";
import type { PreflightContext } from "./types";

export type ProcessEnvironment = Readonly<Record<string, string | undefined>>;

export interface ConfigurationPreflightContext extends PreflightContext {
  tenant: string;
  environment: TenantEnvironment;
  projectRoot: string;
  processEnv: ProcessEnvironment;
  tenantConfig: TenantConfig;
  expoConfig: ExpoConfig;
}

export interface CreatePreflightContextOptions {
  projectRoot: string;
  tenantId: string;
  environment: TenantEnvironment;
  processEnv?: ProcessEnvironment;
  baseConfig?: Partial<ExpoConfig>;
  timestamp?: string;
}

export const createPreflightContext = async ({
  projectRoot,
  tenantId,
  environment,
  processEnv = process.env,
  baseConfig = {},
  timestamp,
}: CreatePreflightContextOptions): Promise<ConfigurationPreflightContext> => {
  const resolvedProjectRoot = await realpath(projectRoot);
  const tenantConfig = getTenant(tenantId);
  const environmentSnapshot = Object.freeze({ ...processEnv });
  const expoConfig = createExpoConfig({
    baseConfig,
    tenant: tenantConfig,
    environment,
    processEnv: environmentSnapshot,
  });

  return {
    tenant: tenantId,
    environment,
    projectRoot: resolvedProjectRoot,
    processEnv: environmentSnapshot,
    tenantConfig,
    expoConfig,
    ...(timestamp ? { timestamp } : {}),
  };
};
