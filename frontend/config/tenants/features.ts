import { z } from "zod";

export const TENANT_FEATURE_KEYS = [
  "articles",
  "chat",
  "dietPlan",
  "smartFoodCatalog",
  "workoutPlan",
  "stepTracking",
  "progressTracking",
  "formsAndAgreements",
  "mediaCapture",
  "notifications",
] as const;

const featureShape = Object.fromEntries(
  TENANT_FEATURE_KEYS.map((feature) => [feature, z.boolean()])
) as Record<(typeof TENANT_FEATURE_KEYS)[number], z.ZodBoolean>;

export const tenantFeatureDefaultsSchema = z.object(featureShape).strict();
export const tenantFeatureOverridesSchema = tenantFeatureDefaultsSchema.partial().strict();

export type TenantFeatureDefaults = z.infer<typeof tenantFeatureDefaultsSchema>;
export type TenantFeatureOverrides = z.infer<typeof tenantFeatureOverridesSchema>;

export const resolveTenantFeatures = (
  defaults: TenantFeatureDefaults,
  overrides: TenantFeatureOverrides = {}
): TenantFeatureDefaults => ({ ...defaults, ...overrides });
