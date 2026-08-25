import { resolveTenantFeatures, type TenantFeatureOverrides } from "../../config/tenants/features";
import type { PublicTenantRuntimeConfig } from "./runtimeTenant";

export const getResolvedTenantFeatures = (
  tenant: PublicTenantRuntimeConfig,
  overrides?: TenantFeatureOverrides
) => resolveTenantFeatures(tenant.featureDefaults, overrides);
