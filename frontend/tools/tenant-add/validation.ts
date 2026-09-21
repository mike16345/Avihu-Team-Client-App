import { randomBytes } from "node:crypto";
import { avihuTenant } from "../../config/tenants/avihu";
import { tenantConfigSchema } from "../../config/tenants/schema";
import {
  createTenantTheme,
  themeRecipeV1Schema,
  type ThemeRecipeV1,
} from "../../config/tenants/themeRecipe";
import type { TenantConfig } from "../../config/tenants/types";
import type { TenantAddAnswers } from "./types";

const TENANT_ID = /^[a-z][a-z0-9-]*$/u;

export const toExportName = (tenantId: string) =>
  `${tenantId.replace(/-([a-z0-9])/gu, (_, character: string) => character.toUpperCase())}Tenant`;

const normalizeIdentifierSegment = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9_]/gu, "")
    .replace(/^[^a-z]+/u, "t");

export const createIdentifierBaseSuggestion = (expoOwner: string) =>
  `com.${normalizeIdentifierSegment(expoOwner)}`;

type TenantIdentityFields = Omit<
  TenantConfig,
  "eas" | "assets" | "brand" | "theme" | "featureDefaults" | "nativeCapabilities"
>;

export const createTenantIdentityFields = (
  answers: TenantAddAnswers,
  randomSuffix: string
): TenantIdentityFields => {
  if (!TENANT_ID.test(answers.id)) {
    throw new Error(
      "Tenant ID must start with a letter and use lowercase letters, numbers, or hyphens"
    );
  }
  if (!answers.displayName.trim()) throw new Error("Display name is required");
  if (answers.mode === "repository" && !answers.identifierBase) {
    throw new Error("Repository tenants require a bundle/package base");
  }
  const idSegment = normalizeIdentifierSegment(answers.id);
  const identifierBase =
    answers.mode === "local"
      ? `local.test.${idSegment}.t${randomSuffix}`
      : `${answers.identifierBase}.${idSegment}`;
  const environmentIdentity = (environment: "development" | "preview" | "production") => {
    const suffix = environment === "production" ? "" : `.${environment}`;
    const schemeSuffix = environment === "production" ? "" : `-${environment}`;
    return {
      iosBundleIdentifier: `${identifierBase}${suffix}`,
      androidPackage: `${identifierBase}${suffix}`,
      scheme: `${answers.id}-${randomSuffix}${schemeSuffix}`,
      allowSharedStoreIdentity: false,
    };
  };
  const {
    eas: _eas,
    assets: _assets,
    brand: _brand,
    theme: _theme,
    featureDefaults: _features,
    nativeCapabilities: _capabilities,
    ...identityDefaults
  } = structuredClone(avihuTenant);
  return {
    ...identityDefaults,
    kind: answers.mode,
    id: answers.id,
    displayName: answers.displayName.trim(),
    slug: answers.id,
    version: "1.0.0",
    permissions: {
      camera: "Allow $(PRODUCT_NAME) to use the camera for scanning and photos.",
      photos: "Allow $(PRODUCT_NAME) to select photos from your library.",
      healthShare: "Allow $(PRODUCT_NAME) to read step and activity data.",
      healthUpdate: "$(PRODUCT_NAME) does not modify your health data.",
      android: [...avihuTenant.permissions.android],
    },
    localization: {
      supportsRtl: answers.supportsRtl ?? true,
      forcesRtl: answers.forcesRtl ?? true,
    },
    requiredEnvironmentVariables:
      answers.mode === "local"
        ? { development: [], preview: [], production: [] }
        : structuredClone(avihuTenant.requiredEnvironmentVariables),
    environments: {
      development: environmentIdentity("development"),
      preview: environmentIdentity("preview"),
      production: environmentIdentity("production"),
    },
  };
};

export const createTenantAssetDeclarations = (
  answers: TenantAddAnswers,
  colors: { accent: string; background: string }
): TenantConfig["assets"] => {
  const assetRoot =
    answers.mode === "local"
      ? `./config/tenants/assets/.local/${answers.id}`
      : `./config/tenants/assets/${answers.id}`;
  return {
    legacy: false,
    icon: `${assetRoot}/generated/apple-icon.png`,
    adaptiveIconForeground: `${assetRoot}/generated/android-adaptive-foreground.png`,
    adaptiveIconBackgroundImage: `${assetRoot}/generated/android-adaptive-background.png`,
    adaptiveIconBackgroundColor: colors.background,
    notificationIcon: `${assetRoot}/generated/notification-icon.png`,
    notificationColor: colors.accent,
    splash: `${assetRoot}/generated/splash.png`,
    splashBackgroundColor: colors.background,
  };
};

export const createTenantConfig = (
  answers: TenantAddAnswers,
  recipe: ThemeRecipeV1,
  randomSuffix = randomBytes(3).toString("hex")
): TenantConfig => {
  const parsedRecipe = themeRecipeV1Schema.parse(recipe);
  const theme = createTenantTheme(parsedRecipe);
  const { primary, accent, background } = parsedRecipe.foundation;
  return tenantConfigSchema.parse({
    ...createTenantIdentityFields(answers, randomSuffix),
    eas: { status: "pending" },
    brand: { primaryColor: primary, backgroundColor: background },
    theme,
    assets: createTenantAssetDeclarations(answers, { accent, background }),
    featureDefaults: answers.featureDefaults ?? { ...avihuTenant.featureDefaults },
    nativeCapabilities: { ...answers.nativeCapabilities },
  });
};
