import { z } from "zod";
import { TENANT_ENVIRONMENTS, type TenantEnvironment } from "./types";
import { tenantFeatureDefaultsSchema } from "./features";
import { tenantThemeSchema } from "./theme";

const tenantIdSchema = z.string().regex(/^[a-z][a-z0-9-]*$/);
const semanticVersionSchema = z
  .string()
  .regex(
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*))*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/
  );
const appleBundleIdentifierSchema = z.string().regex(/^[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/);
const androidPackageSchema = z
  .string()
  .regex(/^[A-Za-z][A-Za-z0-9_]*(?:\.[A-Za-z][A-Za-z0-9_]*)+$/);
const schemeSchema = z.string().regex(/^[a-z][a-z0-9+.-]*$/);
const assetPathSchema = z
  .string()
  .regex(/^\.\/[^\0\\]+$/)
  .refine((assetPath) => !assetPath.split("/").includes(".."), {
    message: "Asset paths cannot contain traversal segments",
  });
const permissionDescriptionSchema = z.string().trim().min(1);
const environmentVariableNameSchema = z.string().regex(/^[A-Z][A-Z0-9_]*$/);
const hexColorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/);

export const tenantLocalizationSchema = z
  .object({
    supportsRtl: z.boolean(),
    forcesRtl: z.boolean(),
  })
  .strict();

export const tenantNativeCapabilitiesSchema = z
  .object({
    camera: z.boolean(),
    photoLibrary: z.boolean(),
    notifications: z.boolean(),
    backgroundTasks: z.boolean(),
    appleHealth: z.boolean(),
    healthConnect: z.boolean(),
    liveActivities: z.boolean(),
  })
  .strict();

const environmentIdentitySchema = z
  .object({
    iosBundleIdentifier: appleBundleIdentifierSchema,
    androidPackage: androidPackageSchema,
    scheme: schemeSchema,
    allowSharedStoreIdentity: z.boolean(),
  })
  .strict();

const tenantEnvironmentsSchema = z
  .object({
    development: environmentIdentitySchema,
    preview: environmentIdentitySchema,
    production: environmentIdentitySchema,
  })
  .strict()
  .superRefine((environments, context) => {
    for (let leftIndex = 0; leftIndex < TENANT_ENVIRONMENTS.length; leftIndex += 1) {
      for (
        let rightIndex = leftIndex + 1;
        rightIndex < TENANT_ENVIRONMENTS.length;
        rightIndex += 1
      ) {
        const leftName = TENANT_ENVIRONMENTS[leftIndex];
        const rightName = TENANT_ENVIRONMENTS[rightIndex];
        const left = environments[leftName];
        const right = environments[rightName];
        const sharesStoreIdentity =
          left.iosBundleIdentifier === right.iosBundleIdentifier ||
          left.androidPackage === right.androidPackage;

        if (
          sharesStoreIdentity &&
          (!left.allowSharedStoreIdentity || !right.allowSharedStoreIdentity)
        ) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: [rightName, "allowSharedStoreIdentity"],
            message:
              `${leftName} and ${rightName} share a store identity; ` +
              "both must set allowSharedStoreIdentity to true",
          });
        }
      }
    }
  });

const requiredEnvironmentVariablesSchema = z
  .object({
    development: z.array(environmentVariableNameSchema),
    preview: z.array(environmentVariableNameSchema),
    production: z.array(environmentVariableNameSchema),
  })
  .strict();

export const tenantConfigSchema = z
  .object({
    kind: z.enum(["repository", "local"]),
    id: tenantIdSchema,
    displayName: z.string().trim().min(1),
    slug: tenantIdSchema,
    owner: tenantIdSchema,
    version: semanticVersionSchema,
    projectId: z.string().uuid(),
    updateUrl: z.string().url(),
    runtimeVersion: z.object({ policy: z.literal("appVersion") }).strict(),
    orientation: z.enum(["default", "portrait", "landscape"]),
    platforms: z
      .array(z.enum(["ios", "android"]))
      .min(1)
      .max(2)
      .refine((platforms) => new Set(platforms).size === platforms.length, {
        message: "Supported platforms must be unique",
      }),
    assets: z
      .object({
        legacy: z.boolean(),
        icon: assetPathSchema,
        adaptiveIconForeground: assetPathSchema,
        adaptiveIconBackgroundImage: assetPathSchema,
        adaptiveIconBackgroundColor: hexColorSchema,
        notificationIcon: assetPathSchema,
        notificationColor: hexColorSchema,
        splash: assetPathSchema,
        splashBackgroundColor: hexColorSchema,
      })
      .strict(),
    brand: z
      .object({
        primaryColor: hexColorSchema,
        backgroundColor: hexColorSchema,
      })
      .strict(),
    theme: tenantThemeSchema,
    permissions: z
      .object({
        camera: permissionDescriptionSchema,
        photos: permissionDescriptionSchema,
        healthShare: permissionDescriptionSchema,
        healthUpdate: permissionDescriptionSchema,
        android: z.array(z.string().regex(/^android\.permission\.[A-Za-z0-9_.]+$/)),
      })
      .strict(),
    androidBuildProperties: z
      .object({
        compileSdkVersion: z.number().int().positive(),
        targetSdkVersion: z.number().int().positive(),
        minSdkVersion: z.number().int().positive(),
        enableProguardInReleaseBuilds: z.boolean(),
        enableShrinkResourcesInReleaseBuilds: z.boolean(),
      })
      .strict(),
    localization: tenantLocalizationSchema,
    featureDefaults: tenantFeatureDefaultsSchema,
    nativeCapabilities: tenantNativeCapabilitiesSchema,
    requiredEnvironmentVariables: requiredEnvironmentVariablesSchema,
    environments: tenantEnvironmentsSchema,
  })
  .strict()
  .superRefine((tenant, context) => {
    if (tenant.kind === "repository") {
      for (const environment of TENANT_ENVIRONMENTS) {
        if (tenant.requiredEnvironmentVariables[environment].length === 0) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["requiredEnvironmentVariables", environment],
            message: "Repository tenants must declare required environment variables",
          });
        }
      }
    }
    const requireCapability = (
      enabled: boolean,
      capability: boolean,
      feature: keyof typeof tenant.featureDefaults,
      capabilityName: keyof typeof tenant.nativeCapabilities
    ) => {
      if (enabled && !capability) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["featureDefaults", feature],
          message: `${feature} requires the ${capabilityName} native capability`,
        });
      }
    };

    requireCapability(
      tenant.featureDefaults.mediaCapture,
      tenant.nativeCapabilities.camera,
      "mediaCapture",
      "camera"
    );
    requireCapability(
      tenant.featureDefaults.mediaCapture,
      tenant.nativeCapabilities.photoLibrary,
      "mediaCapture",
      "photoLibrary"
    );
    requireCapability(
      tenant.featureDefaults.notifications,
      tenant.nativeCapabilities.notifications,
      "notifications",
      "notifications"
    );
    requireCapability(
      tenant.featureDefaults.stepTracking && tenant.platforms.includes("ios"),
      tenant.nativeCapabilities.appleHealth,
      "stepTracking",
      "appleHealth"
    );
    requireCapability(
      tenant.featureDefaults.stepTracking && tenant.platforms.includes("android"),
      tenant.nativeCapabilities.healthConnect,
      "stepTracking",
      "healthConnect"
    );
  });

export const parseTenantEnvironment = (value: string | undefined): TenantEnvironment => {
  if (!value) {
    throw new Error("APP_ENV is required and must be one of: development, preview, production");
  }

  if (!TENANT_ENVIRONMENTS.includes(value as TenantEnvironment)) {
    throw new Error(
      `Invalid APP_ENV "${value}". Expected one of: development, preview, production`
    );
  }

  return value as TenantEnvironment;
};
