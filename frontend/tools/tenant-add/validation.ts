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

const withAlpha = (color: string, alpha: string) => `${color}${alpha}`;

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
  Object.assign(theme.colors.app, {
    textStrong: onBackground,
    textDefault: withAlpha(onBackground, "E6"),
    textMuted: withAlpha(onBackground, "B3"),
    textSubtle: withAlpha(onBackground, "80"),
    textSlate: withAlpha(onBackground, "CC"),
    textForm: onBackground,
    textPlaceholder: withAlpha(onBackground, "73"),
    textAgreement: withAlpha(onBackground, "C2"),
    surfaceRaised: background,
    surfacePanel: withAlpha(primary, "08"),
    surfaceSoft: withAlpha(primary, "0D"),
    surfaceCool: withAlpha(accent, "0D"),
    surfaceWarm: withAlpha(accent, "14"),
    borderSoft: withAlpha(primary, "24"),
    borderControl: withAlpha(primary, "33"),
    borderHandle: withAlpha(primary, "4D"),
    formBorder: withAlpha(primary, "52"),
    brandStrong: primary,
    brandAction: primary,
    brandSuccess: accent,
    brandPressed: withAlpha(primary, "D9"),
    articleLiked: withAlpha(accent, "1F"),
    notificationAccent: accent,
    graphIndicator: accent,
    shadowHairline: withAlpha(primary, "0D"),
    shadowSoft: withAlpha(primary, "14"),
    shadowMedium: withAlpha(primary, "1A"),
    shadowStrong: withAlpha(primary, "1F"),
    drawerOverlay: withAlpha(primary, "80"),
  });
  Object.assign(theme.colors.diet, {
    primaryText: onBackground,
    secondaryText: withAlpha(onBackground, "B3"),
    tertiaryText: primary,
    card: background,
    cardSubtle: withAlpha(primary, "0D"),
    border: withAlpha(primary, "1A"),
    borderStrong: withAlpha(accent, "99"),
    mint: withAlpha(accent, "24"),
    mintStrong: withAlpha(accent, "14"),
    consumedBackground: withAlpha(accent, "29"),
    consumedBorder: withAlpha(accent, "66"),
    consumedText: onBackground,
  });
  Object.assign(theme.colors.steps, {
    aboveGoalDark: primary,
    aboveGoal: accent,
    aboveGoalLight: withAlpha(accent, "4D"),
    belowGoalDark: withAlpha(primary, "D9"),
    belowGoal: withAlpha(primary, "B3"),
    belowGoalLight: withAlpha(primary, "4D"),
    ringTrack: withAlpha(primary, "24"),
    ringGradientStart: primary,
    ringGradientEnd: accent,
    selectedPill: withAlpha(primary, "14"),
  });
  Object.assign(theme.colors.graph, {
    line: accent,
    lineSecondary: primary,
    gradientStart: accent,
    gradientEnd: primary,
    gradientStartTransparent: withAlpha(accent, "33"),
    gradientEndTransparent: withAlpha(primary, "0D"),
    dot: accent,
    dotBorder: background,
    tooltip: accent,
    tooltipText: onAccent,
    tooltipShadow: withAlpha(primary, "59"),
  });
  Object.assign(theme.colors.calendar, {
    dayHeader: onBackground,
    today: withAlpha(primary, "1F"),
    agendaText: onBackground,
    selected: primary,
    dot: accent,
    dotSelected: primary,
  });
  Object.assign(theme.colors.scanner, {
    background: onBackground,
    viewfinder: accent,
    scanLine: accent,
    panel: background,
    panelText: onBackground,
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
    featureDefaults: answers.featureDefaults ?? { ...avihuTenant.featureDefaults },
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
