import { box, cancel, confirm, isCancel, multiselect, select, text } from "@clack/prompts";
import { avihuTenant } from "../../config/tenants/avihu";
import { TENANT_FEATURE_KEYS } from "../../config/tenants/features";
import type { TenantFeatureDefaults, TenantNativeCapabilities } from "../../config/tenants/types";
import type { TenantAddAnswers, TenantAddMode } from "./types";

const DEFAULT_PALETTE = {
  primaryColor: "#5B21B6",
  onPrimaryColor: "#FFFFFF",
  accentColor: "#F59E0B",
  onAccentColor: "#1F1300",
  backgroundColor: "#FFF7ED",
  onBackgroundColor: "#2E1065",
};

const cancelled = (value: unknown): value is symbol => isCancel(value);
const askText = async (message: string, initialValue?: string, required = true) => {
  const value = await text({
    message,
    initialValue,
    validate: (input) => (required && !(input ?? "").trim() ? "This value is required" : undefined),
  });
  return cancelled(value) ? null : (value ?? "").trim();
};

export const collectTenantAnswers = async (): Promise<TenantAddAnswers | null> => {
  const mode = await select({
    message: "Where should this tenant live?",
    options: [
      { value: "local" as const, label: "Local test (Git-ignored)" },
      { value: "repository" as const, label: "Repository tenant" },
    ],
  });
  if (cancelled(mode)) return null;
  const id = await askText("Tenant ID (lowercase letters, numbers, hyphens)", "test-tenant");
  const displayName = await askText("App display name", "Test Tenant");
  const logoPath = await askText("Logo path (leave blank for geometric fallback)", "", false);
  if (id === null || displayName === null || logoPath === null) return null;

  let owner: string | undefined;
  let projectId: string | undefined;
  let identifierBase: string | undefined;
  if (mode === "repository") {
    owner = (await askText("Expo owner")) ?? undefined;
    projectId = (await askText("Expo project UUID")) ?? undefined;
    identifierBase = (await askText("Bundle/package base (for example com.company)")) ?? undefined;
    if (!owner || !projectId || !identifierBase) return null;
  }

  const palette = { ...DEFAULT_PALETTE };
  for (const key of Object.keys(palette) as (keyof typeof palette)[]) {
    const value = await askText(key.replace(/Color$/u, " color"), palette[key]);
    if (value === null) return null;
    palette[key] = value;
  }

  const supportsRtl = await confirm({
    message: "Support right-to-left layouts?",
    initialValue: true,
  });
  if (cancelled(supportsRtl)) return null;
  const forcesRtl = supportsRtl
    ? await confirm({ message: "Force right-to-left layout?", initialValue: true })
    : false;
  if (cancelled(forcesRtl)) return null;

  const selectedFeatures = await multiselect({
    message: "Default JavaScript features",
    options: TENANT_FEATURE_KEYS.map((value) => ({ value, label: value })),
    initialValues: [...TENANT_FEATURE_KEYS],
    required: false,
  });
  if (cancelled(selectedFeatures)) return null;
  const featureDefaults = Object.fromEntries(
    TENANT_FEATURE_KEYS.map((key) => [key, selectedFeatures.includes(key)])
  ) as TenantFeatureDefaults;

  const capabilityKeys = Object.keys(
    avihuTenant.nativeCapabilities
  ) as (keyof TenantNativeCapabilities)[];
  const selectedCapabilities = await multiselect({
    message: "Native capabilities present in the compatible binary",
    options: capabilityKeys.map((value) => ({ value, label: value })),
    initialValues: capabilityKeys,
    required: false,
  });
  if (cancelled(selectedCapabilities)) return null;
  const nativeCapabilities = Object.fromEntries(
    capabilityKeys.map((key) => [key, selectedCapabilities.includes(key)])
  ) as TenantNativeCapabilities;

  const answers: TenantAddAnswers = {
    mode: mode as TenantAddMode,
    id,
    displayName,
    ...(logoPath ? { logoPath } : {}),
    ...(owner ? { owner } : {}),
    ...(projectId ? { projectId } : {}),
    ...(identifierBase ? { identifierBase } : {}),
    ...palette,
    supportsRtl,
    forcesRtl,
    featureDefaults,
    nativeCapabilities,
  };
  box(
    [
      `Mode: ${answers.mode}`,
      `Tenant: ${answers.displayName} (${answers.id})`,
      `Logo: ${answers.logoPath ?? "generated fallback"}`,
      `JavaScript features: ${selectedFeatures.join(", ") || "none"}`,
      `Native capabilities: ${selectedCapabilities.join(", ") || "none"}`,
    ].join("\n"),
    "Tenant summary"
  );
  const approved = await confirm({ message: "Create this tenant?", initialValue: false });
  if (cancelled(approved) || !approved) {
    cancel("Tenant creation cancelled; no files changed.");
    return null;
  }
  return answers;
};
