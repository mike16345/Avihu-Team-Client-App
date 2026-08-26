import { box, cancel, confirm, isCancel, multiselect, select, text } from "@clack/prompts";
import { avihuTenant } from "../../config/tenants/avihu";
import { TENANT_FEATURE_KEYS } from "../../config/tenants/features";
import { getContrastRatio } from "../../config/tenants/themeRecipe";
import type { ThemePresetId } from "../../config/tenants/themePresets";
import type { TenantFeatureDefaults, TenantNativeCapabilities } from "../../config/tenants/types";
import { loadThemeSelection } from "./themeInput";
import type { TenantAddAnswers, TenantAddMode, TenantThemeSelection } from "./types";
import type { TenantEasSelection } from "./eas/types";
import { createIdentifierBaseSuggestion } from "./validation";
import type { TenantAddDraft } from "./draft";

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

interface TenantAnswerCollectionOptions {
  initialAnswers?: Partial<TenantAddAnswers>;
  onProgress?: (answers: Partial<TenantAddAnswers>) => Promise<void>;
  getExpoAccounts?: () => Promise<{ username: string; accounts: string[] }>;
}

export type TenantDraftSelection =
  | { kind: "new" }
  | { kind: "resume"; draft: TenantAddDraft }
  | { kind: "start-over"; tenantId: string }
  | { kind: "delete"; tenantId: string };

export const collectTenantDraftSelection = async (
  drafts: TenantAddDraft[],
  promptApi: TenantPromptApi = defaultTenantPromptApi
): Promise<TenantDraftSelection | null> => {
  if (drafts.length === 0) return { kind: "new" };
  const tenantId = await promptApi.select({
    message: "Saved tenant draft",
    options: drafts.map((draft) => ({
      value: draft.tenantId,
      label: `${draft.answers.displayName ?? draft.tenantId} (${draft.tenantId})`,
    })),
  });
  if (promptApi.isCancel(tenantId)) return null;
  const draft = drafts.find((candidate) => candidate.tenantId === tenantId);
  if (!draft) throw new Error(`Saved tenant draft not found: ${String(tenantId)}`);
  const action = await promptApi.select({
    message: `What should happen with ${draft.tenantId}?`,
    options: [
      { value: "resume" as const, label: "Resume draft" },
      { value: "start-over" as const, label: "Start over" },
      { value: "delete" as const, label: "Delete draft" },
    ],
  });
  if (promptApi.isCancel(action)) return null;
  if (action === "resume") return { kind: "resume", draft };
  return { kind: action, tenantId: draft.tenantId };
};

export const collectTenantEasSelection = async (
  mode: TenantAddMode,
  tenantSlug: string,
  promptApi: TenantPromptApi = defaultTenantPromptApi,
  getAuthenticatedUser: () => Promise<string> = async () => {
    throw new Error("Expo authentication lookup is unavailable");
  },
  suggestedOwner?: string
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
    promptApi.box(
      `Existing Expo project UUID: ${projectId}\nTenant slug: ${tenantSlug}`,
      "Confirm EAS link"
    );
    const approved = await promptApi.confirm({
      message: `Link ${tenantSlug} to this Expo project?`,
      initialValue: false,
    });
    return approved === true
      ? { kind: "link", projectId, ...(suggestedOwner ? { owner: suggestedOwner } : {}) }
      : null;
  }
  const authenticatedUser = suggestedOwner ?? (await getAuthenticatedUser());
  const owner = suggestedOwner ?? (await askText(promptApi, "Expo owner", authenticatedUser));
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
  promptApi: TenantPromptApi = defaultTenantPromptApi,
  options: TenantAnswerCollectionOptions = {}
): Promise<TenantAddAnswers | null> => {
  const working: Partial<TenantAddAnswers> = { ...options.initialAnswers };
  const saveProgress = async () => {
    if (working.id) await options.onProgress?.({ ...working });
  };
  const mode =
    working.mode ??
    (await promptApi.select({
      message: "Where should this tenant live?",
      options: [
        { value: "local" as const, label: "Local test (Git-ignored)" },
        { value: "repository" as const, label: "Repository tenant" },
      ],
    }));
  if (promptApi.isCancel(mode)) return null;
  working.mode = mode as TenantAddMode;
  const id =
    working.id ??
    (await askText(promptApi, "Tenant ID (lowercase letters, numbers, hyphens)", "test-tenant"));
  if (id === null) return null;
  working.id = id;
  const displayName =
    working.displayName ?? (await askText(promptApi, "App display name", "Test Tenant"));
  if (displayName === null) return null;
  working.displayName = displayName;
  const logoPath =
    working.logoPath !== undefined
      ? working.logoPath
      : await askText(promptApi, "Logo path (leave blank for geometric fallback)", "", false);
  if (logoPath === null) return null;
  working.logoPath = logoPath;

  let identifierBase: string | undefined;
  if (mode === "repository") {
    if (!working.expoOwner) {
      const session = await options.getExpoAccounts?.();
      if (!session) throw new Error("Expo account lookup is unavailable");
      const owner = await promptApi.select({
        message: "Expo owner",
        options: session.accounts.map((account) => ({ value: account, label: account })),
        initialValue: session.accounts.includes("avihuteam") ? "avihuteam" : session.username,
      });
      if (promptApi.isCancel(owner)) return null;
      working.expoOwner = String(owner);
    }
    identifierBase =
      working.identifierBase ??
      (await askText(
        promptApi,
        "Bundle/package base (for example com.company)",
        createIdentifierBaseSuggestion(working.expoOwner)
      )) ??
      undefined;
    if (!identifierBase) return null;
    working.identifierBase = identifierBase;
  }
  await saveProgress();

  const themeSelection = working.themeSelection ?? (await selectTheme(promptApi));
  if (!themeSelection) return null;
  working.themeSelection = themeSelection;
  const loadedTheme = await loadThemeSelection(themeSelection);
  await saveProgress();
  const supportsRtl =
    working.supportsRtl ??
    (await promptApi.confirm({
      message: "Support right-to-left layouts?",
      initialValue: true,
    }));
  if (promptApi.isCancel(supportsRtl)) return null;
  working.supportsRtl = Boolean(supportsRtl);
  const forcesRtl =
    working.forcesRtl ??
    (supportsRtl
      ? await promptApi.confirm({ message: "Force right-to-left layout?", initialValue: true })
      : false);
  if (promptApi.isCancel(forcesRtl)) return null;
  working.forcesRtl = Boolean(forcesRtl);
  await saveProgress();

  let featureDefaults = working.featureDefaults;
  if (!featureDefaults) {
    const selectedFeatures = await promptApi.multiselect({
      message: "Default JavaScript features",
      options: TENANT_FEATURE_KEYS.map((value) => ({ value, label: value })),
      initialValues: [...TENANT_FEATURE_KEYS],
      required: false,
    });
    if (promptApi.isCancel(selectedFeatures)) return null;
    const selectedValues = selectedFeatures as (keyof TenantFeatureDefaults)[];
    featureDefaults = Object.fromEntries(
      TENANT_FEATURE_KEYS.map((key) => [key, selectedValues.includes(key)])
    ) as TenantFeatureDefaults;
    working.featureDefaults = featureDefaults;
  }
  const featureValues = TENANT_FEATURE_KEYS.filter((key) => featureDefaults[key]);
  await saveProgress();

  const capabilityKeys = Object.keys(
    avihuTenant.nativeCapabilities
  ) as (keyof TenantNativeCapabilities)[];
  let nativeCapabilities = working.nativeCapabilities;
  if (!nativeCapabilities) {
    const selectedCapabilities = await promptApi.multiselect({
      message: "Native capabilities present in the compatible binary",
      options: capabilityKeys.map((value) => ({ value, label: value })),
      initialValues: capabilityKeys,
      required: false,
    });
    if (promptApi.isCancel(selectedCapabilities)) return null;
    const selectedValues = selectedCapabilities as (keyof TenantNativeCapabilities)[];
    nativeCapabilities = Object.fromEntries(
      capabilityKeys.map((key) => [key, selectedValues.includes(key)])
    ) as TenantNativeCapabilities;
    working.nativeCapabilities = nativeCapabilities;
  }
  const capabilityValues = capabilityKeys.filter((key) => nativeCapabilities[key]);
  await saveProgress();

  const { foundation, overrides } = loadedTheme.recipe;
  const contrast = (foreground: string, background: string) =>
    (getContrastRatio(foreground, background) ?? 0).toFixed(2);
  const answers: TenantAddAnswers = {
    mode: mode as TenantAddMode,
    id,
    displayName,
    ...(logoPath ? { logoPath } : {}),
    ...(working.expoOwner ? { expoOwner: working.expoOwner } : {}),
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
