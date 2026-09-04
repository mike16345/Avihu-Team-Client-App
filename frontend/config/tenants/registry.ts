import { avihuTenant } from "./avihu";
import { loadLocalTenants } from "./localRegistry";
import { tenantConfigSchema } from "./schema";
import type { TenantConfig } from "./types";

// tenant:add imports:start
// tenant:add imports:end

// tenant:add entries:start
const committedTenants = [avihuTenant];
// tenant:add entries:end

const transientTenants = new Map<string, TenantConfig>();

export const registerTransientTenant = (tenant: TenantConfig): (() => void) => {
  if (transientTenants.has(tenant.id)) throw new Error(`Tenant ${tenant.id} is already staged`);
  transientTenants.set(tenant.id, tenant);
  return () => transientTenants.delete(tenant.id);
};

export const assertUniqueTenants = (tenants: TenantConfig[]) => {
  const claims = new Map<string, string>();
  const claim = (kind: string, value: string, tenantId: string) => {
    const key = `${kind}:${value}`;
    const existing = claims.get(key);
    if (existing && existing !== tenantId) {
      throw new Error(`Tenant ${tenantId} conflicts with ${existing} on ${kind} "${value}"`);
    }
    claims.set(key, tenantId);
  };

  for (const tenant of tenants) {
    claim("id", tenant.id, tenant.id);
    claim("slug", tenant.slug, tenant.id);
    if (tenant.eas.status === "linked") claim("project ID", tenant.eas.projectId, tenant.id);
    for (const environment of Object.values(tenant.environments)) {
      claim("scheme", environment.scheme, tenant.id);
      claim("iOS bundle identifier", environment.iosBundleIdentifier, tenant.id);
      claim("Android package", environment.androidPackage, tenant.id);
    }
  }
};

const getTenantRegistry = () => {
  const tenantRegistry = tenantConfigSchema
    .array()
    .parse([...committedTenants, ...loadLocalTenants(), ...transientTenants.values()]);
  assertUniqueTenants(tenantRegistry);
  return tenantRegistry;
};

export const listTenants = (): TenantConfig[] => [...getTenantRegistry()];

export const getTenant = (tenantId: string): TenantConfig => {
  const tenant = getTenantRegistry().find(({ id }) => id === tenantId);

  if (!tenant) {
    throw new Error(`Unknown tenant "${tenantId}"`);
  }

  return tenant;
};
