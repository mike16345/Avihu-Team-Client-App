import { randomBytes, randomUUID } from "node:crypto";
import { avihuTenant } from "../../config/tenants/avihu";
import { tenantConfigSchema } from "../../config/tenants/schema";
import type { TenantConfig } from "../../config/tenants/types";
import type { TenantAddAnswers } from "./types";

const TENANT_ID = /^[a-z][a-z0-9-]*$/u;
const HEX = /^#[0-9A-Fa-f]{6}$/u;

export const toExportName = (tenantId: string) =>
  `${tenantId.replace(/-([a-z0-9])/gu, (_, character: string) => character.toUpperCase())}Tenant`;

const requireColor = (name: string, value: string) => {
  if (!HEX.test(value)) throw new Error(`${name} must be a six-digit hex color`);
  return value.toUpperCase();
};

const luminance = (color: string) => {
  const channels = [1, 3, 5].map(
    (index) => Number.parseInt(color.slice(index, index + 2), 16) / 255
  );
  const linear = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  );
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
};

export const assertContrast = (foreground: string, background: string, label: string) => {
  const foregroundLuminance = luminance(requireColor(label, foreground));
  const backgroundLuminance = luminance(requireColor(label, background));
  const ratio =
    (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) /
    (Math.min(foregroundLuminance, backgroundLuminance) + 0.05);
  if (ratio < 4.5) throw new Error(`${label} must have at least 4.5:1 contrast`);
};

const normalizeIdentifierSegment = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9_]/gu, "")
    .replace(/^[^a-z]+/u, "t");

export const createTenantConfig = (
  answers: TenantAddAnswers,
  randomSuffix = randomBytes(3).toString("hex")
): TenantConfig => {
  if (!TENANT_ID.test(answers.id)) {
    throw new Error(
      "Tenant ID must start with a letter and use lowercase letters, numbers, or hyphens"
    );
  }
  if (!answers.displayName.trim()) throw new Error("Display name is required");

  const primary = requireColor("Primary color", answers.primaryColor);
  const onPrimary = requireColor("On-primary color", answers.onPrimaryColor);
  const accent = requireColor("Accent color", answers.accentColor);
  const onAccent = requireColor("On-accent color", answers.onAccentColor);
  const background = requireColor("Background color", answers.backgroundColor);
  const onBackground = requireColor("On-background color", answers.onBackgroundColor);
  assertContrast(onPrimary, primary, "Primary text");
  assertContrast(onAccent, accent, "Accent text");
  assertContrast(onBackground, background, "Background text");
  if (
    primary.toLowerCase() === avihuTenant.theme.colors.primary.toLowerCase() &&
    accent.toLowerCase() === avihuTenant.theme.colors.accent.toLowerCase()
  ) {
    throw new Error("Choose a primary or accent palette visibly different from Avihu");
  }
  const idSegment = normalizeIdentifierSegment(answers.id);

  if (
    answers.mode === "repository" &&
    (!answers.owner || !answers.projectId || !answers.identifierBase)
  ) {
    throw new Error("Repository tenants require Expo owner, project ID, and identifier base");
  }

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
  const assetRoot =
    answers.mode === "local"
      ? `./config/tenants/assets/.local/${answers.id}`
      : `./config/tenants/assets/${answers.id}`;
  const theme = structuredClone(avihuTenant.theme);
  Object.assign(theme.colors, {
    primary,
    onPrimary,
    accent,
    onAccent,
    background,
    onBackground,
    surface: background,
    onSurface: onBackground,
    selected: `${accent}22`,
    pressed: `${primary}12`,
  });

  const tenant = {
    ...structuredClone(avihuTenant),
    kind: answers.mode,
    id: answers.id,
    displayName: answers.displayName.trim(),
    slug: answers.id,
    owner: answers.mode === "local" ? "local-test" : answers.owner!,
    projectId: answers.mode === "local" ? randomUUID() : answers.projectId!,
    updateUrl:
      answers.mode === "local"
        ? `https://u.expo.dev/${randomUUID()}`
        : `https://u.expo.dev/${answers.projectId}`,
    version: "1.0.0",
    assets: {
      ...avihuTenant.assets,
      icon: `${assetRoot}/generated/apple-icon.png`,
      adaptiveIconForeground: `${assetRoot}/generated/android-adaptive-foreground.png`,
      adaptiveIconBackgroundImage: `${assetRoot}/generated/android-adaptive-background.png`,
      adaptiveIconBackgroundColor: background,
      notificationIcon: `${assetRoot}/generated/notification-icon.png`,
      notificationColor: accent,
      splash: `${assetRoot}/generated/splash.png`,
      splashBackgroundColor: background,
    },
    brand: { primaryColor: primary, backgroundColor: background },
    theme,
    featureDefaults: { ...avihuTenant.featureDefaults },
    nativeCapabilities: { ...answers.nativeCapabilities },
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

  return tenantConfigSchema.parse(tenant);
};
