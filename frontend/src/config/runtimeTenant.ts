import { z } from "zod";

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
    featureFlags: z
      .object({
        supportsRtl: z.boolean(),
        forcesRtl: z.boolean(),
      })
      .strict(),
    showEnvironmentBadge: z.boolean(),
  })
  .strict();

export type PublicTenantRuntimeConfig = z.infer<typeof runtimeTenantSchema>;

interface RuntimeConstantsLike {
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
