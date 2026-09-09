import { z } from "zod";
import { tenantFeatureDefaultsSchema } from "../../config/tenants/features";
import {
  tenantLocalizationSchema,
  tenantNativeCapabilitiesSchema,
} from "../../config/tenants/schema";
import { tenantThemeSchema } from "../../config/tenants/theme";

const runtimeTenantSchema = z
  .object({
    id: z.string().regex(/^[a-z][a-z0-9-]*$/),
    displayName: z.string().trim().min(1),
    environment: z.enum(["development", "preview", "production"]),
    brand: z
      .object({
        primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
        backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
      })
      .strict(),
    theme: tenantThemeSchema,
    localization: tenantLocalizationSchema,
    featureDefaults: tenantFeatureDefaultsSchema,
    nativeCapabilities: tenantNativeCapabilitiesSchema,
    showEnvironmentBadge: z.boolean(),
  })
  .strict();

export type PublicTenantRuntimeConfig = z.infer<typeof runtimeTenantSchema>;

export interface RuntimeConstantsLike {
  expoConfig?: {
    extra?: Record<string, unknown>;
  } | null;
}

export const getRuntimeTenant = (constants: RuntimeConstantsLike): PublicTenantRuntimeConfig => {
  const result = runtimeTenantSchema.safeParse(constants.expoConfig?.extra?.tenant);
  if (!result.success) {
    throw new Error("Runtime tenant configuration is invalid or missing");
  }
  return result.data;
};

export const isTenantEnvironmentBadgeVisible = (tenant: PublicTenantRuntimeConfig) =>
  tenant.showEnvironmentBadge;

export const getRuntimeTenantDisplayName = (constants: RuntimeConstantsLike): string =>
  getRuntimeTenant(constants).displayName;

export { getResolvedTenantFeatures } from "./tenantFeatures";
