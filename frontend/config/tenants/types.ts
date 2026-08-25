import type { z } from "zod";
import type { tenantConfigSchema, tenantFeatureFlagsSchema } from "./schema";

export const TENANT_ENVIRONMENTS = ["development", "preview", "production"] as const;

export type TenantEnvironment = (typeof TENANT_ENVIRONMENTS)[number];
export type TenantConfig = z.infer<typeof tenantConfigSchema>;
export type TenantFeatureFlags = z.infer<typeof tenantFeatureFlagsSchema>;
