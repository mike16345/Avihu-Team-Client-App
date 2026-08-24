import { avihuTenant } from "./avihu";
import { tenantConfigSchema } from "./schema";
import type { TenantConfig } from "./types";

const tenantRegistry = tenantConfigSchema.array().parse([avihuTenant]);

export const listTenants = (): TenantConfig[] => [...tenantRegistry];

export const getTenant = (tenantId: string): TenantConfig => {
  const tenant = tenantRegistry.find(({ id }) => id === tenantId);

  if (!tenant) {
    throw new Error(`Unknown tenant "${tenantId}"`);
  }

  return tenant;
};
