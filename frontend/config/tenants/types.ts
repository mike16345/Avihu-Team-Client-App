import type { z } from "zod";
import type {
  tenantConfigSchema,
  tenantLocalizationSchema,
  tenantNativeCapabilitiesSchema,
} from "./schema";
import type { tenantFeatureDefaultsSchema } from "./features";
import type { tenantThemeSchema } from "./theme";

export const TENANT_ENVIRONMENTS = ["development", "preview", "production"] as const;

export type TenantEnvironment = (typeof TENANT_ENVIRONMENTS)[number];
export type TenantConfig = z.infer<typeof tenantConfigSchema>;
export type TenantLocalization = z.infer<typeof tenantLocalizationSchema>;
export type TenantFeatureDefaults = z.infer<typeof tenantFeatureDefaultsSchema>;
export type TenantNativeCapabilities = z.infer<typeof tenantNativeCapabilitiesSchema>;
export type TenantTheme = z.infer<typeof tenantThemeSchema>;
