import { box, cancel, confirm, isCancel, multiselect, select, text } from "@clack/prompts";
import { avihuTenant } from "../../config/tenants/avihu";
import { TENANT_FEATURE_KEYS } from "../../config/tenants/features";
import { getContrastRatio } from "../../config/tenants/themeRecipe";
import type { ThemePresetId } from "../../config/tenants/themePresets";
import type { TenantFeatureDefaults, TenantNativeCapabilities } from "../../config/tenants/types";
import { loadThemeSelection } from "./themeInput";
import type { TenantAddAnswers, TenantAddMode, TenantThemeSelection } from "./types";
import type { TenantEasSelection } from "./eas/types";

export interface TenantPromptApi {
  select: typeof select;
  text: typeof text;
  multiselect: typeof multiselect;
  confirm: typeof confirm;
  box: typeof box;
  cancel: typeof cancel;
  isCancel: typeof isCancel;
}

const defaultTenantPromptApi: TenantPromptApi = {
  select,
  text,
  multiselect,
  confirm,
  box,
  cancel,
  isCancel,
};

export const collectTenantEasSelection = async (
  mode: TenantAddMode,
  tenantSlug: string,
  promptApi: TenantPromptApi = defaultTenantPromptApi,
  getAuthenticatedUser: () => Promise<string> = async () => {
    throw new Error("Expo authentication lookup is unavailable");
  }
): Promise<TenantEasSelection | null> => {
  if (mode === "local") return { kind: "skip" };
  const action = await promptApi.select({
    message: "EAS project setup",
    options: [
      { value: "create", label: "Create a new Expo project" },
      { value: "link", label: "Link an existing Expo project" },
      { value: "skip", label: "Skip for now" },
    ],
  });
  if (promptApi.isCancel(action)) return null;
  if (action === "skip") return { kind: "skip" };
  if (action === "link") {
    const projectId = await askText(promptApi, "Expo project UUID");
    if (!projectId) return null;
    promptApi.box(`Existing Expo project UUID: ${projectId}\nTenant slug: ${tenantSlug}`, "Confirm EAS link");
    const approved = await promptApi.confirm({
      message: `Link ${tenantSlug} to this Expo project?`,
      initialValue: false,
    });
    return approved === true ? { kind: "link", projectId } : null;
  }
  const authenticatedUser = await getAuthenticatedUser();
  const owner = await askText(promptApi, "Expo owner", authenticatedUser);
  if (!owner) return null;
  promptApi.box(`Expo project to create: ${owner}/${tenantSlug}`, "External EAS action");
  const approved = await promptApi.confirm({
    message: `Create Expo project ${owner}/${tenantSlug} now?`,
    initialValue: false,
  });
  return approved === true ? { kind: "create", owner } : null;
};

const askText = async (
  promptApi: TenantPromptApi,
  message: string,
  initialValue?: string,
  required = true
) => {
  const value = await promptApi.text({
    message,
    initialValue,
    validate: (input) => (required && !(input ?? "").trim() ? "This value is required" : undefined),
  });
  return promptApi.isCancel(value) ? null : String(value ?? "").trim();
};

const selectTheme = async (promptApi: TenantPromptApi): Promise<TenantThemeSelection | null> => {
  const selected = await promptApi.select({
    message: "Choose a semantic theme",
    options: [
      { value: "avihu", label: "Avihu" },
      { value: "ivory-orange-blue", label: "Ivory / Orange / Blue" },
      { value: "violet-amber", label: "Violet / Amber" },
      { value: "recipe-file", label: "Import JSON recipe" },
    ],
  });
  if (promptApi.isCancel(selected)) return null;
  if (selected !== "recipe-file") {
    return { kind: "preset", presetId: selected as ThemePresetId };
  }
  const recipePath = await askText(promptApi, "Path to versioned JSON theme recipe");
  return recipePath ? { kind: "recipe-file", path: recipePath } : null;
};

export const collectTenantAnswers = async (
  promptApi: TenantPromptApi = defaultTenantPromptApi
): Promise<TenantAddAnswers | null> => {
  const mode = await promptApi.select({
    message: "Where should this tenant live?",
    options: [
      { value: "local" as const, label: "Local test (Git-ignored)" },
      { value: "repository" as const, label: "Repository tenant" },
    ],
  });
  if (promptApi.isCancel(mode)) return null;
  const id = await askText(
    promptApi,
    "Tenant ID (lowercase letters, numbers, hyphens)",
    "test-tenant"
  );
  if (id === null) return null;
  const displayName = await askText(promptApi, "App display name", "Test Tenant");
  if (displayName === null) return null;
  const logoPath = await askText(
    promptApi,
    "Logo path (leave blank for geometric fallback)",
    "",
    false
  );
  if (logoPath === null) return null;

  let identifierBase: string | undefined;
  if (mode === "repository") {
    identifierBase =
      (await askText(promptApi, "Bundle/package base (for example com.company)")) ?? undefined;
    if (!identifierBase) return null;
  }

  const themeSelection = await selectTheme(promptApi);
  if (!themeSelection) return null;
  const loadedTheme = await loadThemeSelection(themeSelection);
  const supportsRtl = await promptApi.confirm({
    message: "Support right-to-left layouts?",
    initialValue: true,
  });
  if (promptApi.isCancel(supportsRtl)) return null;
  const forcesRtl = supportsRtl
    ? await promptApi.confirm({ message: "Force right-to-left layout?", initialValue: true })
    : false;
  if (promptApi.isCancel(forcesRtl)) return null;

  const selectedFeatures = await promptApi.multiselect({
    message: "Default JavaScript features",
    options: TENANT_FEATURE_KEYS.map((value) => ({ value, label: value })),
    initialValues: [...TENANT_FEATURE_KEYS],
    required: false,
  });
  if (promptApi.isCancel(selectedFeatures)) return null;
  const featureValues = selectedFeatures as (keyof TenantFeatureDefaults)[];
  const featureDefaults = Object.fromEntries(
    TENANT_FEATURE_KEYS.map((key) => [key, featureValues.includes(key)])
  ) as TenantFeatureDefaults;

  const capabilityKeys = Object.keys(
    avihuTenant.nativeCapabilities
  ) as (keyof TenantNativeCapabilities)[];
  const selectedCapabilities = await promptApi.multiselect({
    message: "Native capabilities present in the compatible binary",
    options: capabilityKeys.map((value) => ({ value, label: value })),
    initialValues: capabilityKeys,
    required: false,
  });
  if (promptApi.isCancel(selectedCapabilities)) return null;
  const capabilityValues = selectedCapabilities as (keyof TenantNativeCapabilities)[];
  const nativeCapabilities = Object.fromEntries(
    capabilityKeys.map((key) => [key, capabilityValues.includes(key)])
  ) as TenantNativeCapabilities;

  const { foundation, overrides } = loadedTheme.recipe;
  const contrast = (foreground: string, background: string) =>
    (getContrastRatio(foreground, background) ?? 0).toFixed(2);
  const answers: TenantAddAnswers = {
    mode: mode as TenantAddMode,
    id,
    displayName,
    ...(logoPath ? { logoPath } : {}),
    ...(identifierBase ? { identifierBase } : {}),
    themeSelection,
    supportsRtl: Boolean(supportsRtl),
    forcesRtl: Boolean(forcesRtl),
    featureDefaults,
    nativeCapabilities,
  };
  promptApi.box(
    [
      `Mode: ${answers.mode}`,
      `Tenant: ${answers.displayName} (${answers.id})`,
      `Logo: ${answers.logoPath ?? "generated fallback"}`,
      `Theme: ${loadedTheme.sourceLabel}`,
      `Foundation: ${Object.values(foundation).join(", ")}`,
      `Contrast: primary ${contrast(foundation.onPrimary, foundation.primary)}, accent ${contrast(foundation.onAccent, foundation.accent)}, background ${contrast(foundation.onBackground, foundation.background)}`,
      `Overrides: ${overrides ? (JSON.stringify(overrides).match(/#[0-9A-Fa-f]{6,8}|rgba?\(/gu)?.length ?? 0) : 0}`,
      `JavaScript features: ${featureValues.join(", ") || "none"}`,
      `Native capabilities: ${capabilityValues.join(", ") || "none"}`,
    ].join("\n"),
    "Tenant summary"
  );
  const approved = await promptApi.confirm({ message: "Create this tenant?", initialValue: false });
  if (promptApi.isCancel(approved) || !approved) {
    promptApi.cancel("Tenant creation cancelled; no files changed.");
    return null;
  }
  return answers;
};
