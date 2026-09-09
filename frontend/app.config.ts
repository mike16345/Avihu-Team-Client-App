import "dotenv/config";
import "tsx/cjs";
import type { ConfigContext, ExpoConfig } from "@expo/config";
import { createExpoConfig } from "./config/createExpoConfig";
import { getTenant } from "./config/tenants/registry";
import { parseTenantEnvironment } from "./config/tenants/schema";

export default ({ config }: ConfigContext): ExpoConfig => {
  const tenantId = process.env.APP_TENANT;

  if (!tenantId) {
    throw new Error("APP_TENANT is required. Run `npm run app` to select a tenant.");
  }

  return createExpoConfig({
    baseConfig: config,
    tenant: getTenant(tenantId),
    environment: parseTenantEnvironment(process.env.APP_ENV),
    processEnv: process.env,
  });
};
