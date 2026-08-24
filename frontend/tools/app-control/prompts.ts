import { box, cancel, confirm, isCancel, select } from "@clack/prompts";
import { getTenant, listTenants } from "../../config/tenants/registry";
import { TENANT_ENVIRONMENTS, type TenantEnvironment } from "../../config/tenants/types";
import type {
  AppAction,
  AppPlatform,
  AppSelection,
  AssetOperation,
  ParsedAppArguments,
  PreflightMode,
  ReleaseProfile,
} from "./types";

const ACTION_OPTIONS: Array<{ value: AppAction; label: string }> = [
  { value: "start", label: "Start development server" },
  { value: "run", label: "Run on a device or simulator" },
  { value: "preflight", label: "Run preflight" },
  { value: "assets", label: "Manage tenant assets" },
  { value: "build", label: "Build with EAS" },
  { value: "update", label: "Publish an update" },
];

const isPromptCancelled = <Value>(value: Value): value is Value & symbol => isCancel(value);

const formatAction = (selection: AppSelection): string => {
  switch (selection.action) {
    case "preflight":
      return `${selection.mode} preflight`;
    case "assets":
      return `${selection.operation} assets`;
    case "build":
      return `${selection.profile} build`;
    default:
      return selection.action;
  }
};

const formatEquivalentCommand = (selection: AppSelection): string => {
  const parts = ["npm run app --", selection.action];

  if (selection.action === "run" || selection.action === "build") {
    parts.push(selection.platform);
  }

  if (selection.action === "preflight" && selection.mode === "release") {
    parts.push("release");
  }

  if (selection.action === "assets") {
    parts.push(selection.operation);
  }

  parts.push("--tenant", selection.tenantId);

  if (selection.action === "build") {
    parts.push("--profile", selection.profile);
  } else {
    parts.push("--environment", selection.environment);
  }

  parts.push("--yes");
  return parts.join(" ");
};

export const printSelectionSummary = (selection: AppSelection): void => {
  const tenant = getTenant(selection.tenantId);
  const identity = tenant.environments[selection.environment];
  const identityLines =
    selection.action === "run" || selection.action === "build"
      ? selection.platform === "android"
        ? [`Android package: ${identity.androidPackage}`]
        : [`iOS bundle ID: ${identity.iosBundleIdentifier}`]
      : [
          `Android package: ${identity.androidPackage}`,
          `iOS bundle ID: ${identity.iosBundleIdentifier}`,
        ];

  box(
    [
      `Tenant: ${tenant.displayName} (${tenant.id})`,
      `Action: ${formatAction(selection)}`,
      `Environment: ${selection.environment}`,
      `Platform: ${"platform" in selection ? selection.platform : "not platform-specific"}`,
      ...identityLines,
      `Non-interactive: ${formatEquivalentCommand(selection)}`,
    ].join("\n"),
    "App control summary"
  );
};

const chooseTenant = async (initialValue?: string): Promise<string | null> => {
  const tenantId = await select({
    message: "Select tenant",
    options: listTenants().map((tenant) => ({
      value: tenant.id,
      label: tenant.displayName,
      hint: tenant.id,
    })),
    initialValue,
  });

  return isPromptCancelled(tenantId) ? null : tenantId;
};

const chooseAction = async (initialValue?: AppAction): Promise<AppAction | null> => {
  const action = await select({
    message: "Select action",
    options: ACTION_OPTIONS,
    initialValue,
  });

  return isPromptCancelled(action) ? null : action;
};

const chooseEnvironment = async (
  initialValue: TenantEnvironment | undefined,
  releaseOnly: boolean
): Promise<TenantEnvironment | null> => {
  const environments = releaseOnly
    ? TENANT_ENVIRONMENTS.filter((environment) => environment !== "development")
    : TENANT_ENVIRONMENTS;
  const environment = await select({
    message: releaseOnly ? "Select release environment" : "Select environment",
    options: environments.map((value) => ({ value, label: value })),
    initialValue,
  });

  return isPromptCancelled(environment) ? null : environment;
};

const choosePlatform = async (initialValue?: AppPlatform): Promise<AppPlatform | null> => {
  const platform = await select({
    message: "Select platform",
    options: [
      { value: "android" as const, label: "Android" },
      { value: "ios" as const, label: "iOS" },
    ],
    initialValue,
  });

  return isPromptCancelled(platform) ? null : platform;
};

const choosePreflightMode = async (initialValue?: PreflightMode): Promise<PreflightMode | null> => {
  const mode = await select({
    message: "Select preflight depth",
    options: [
      { value: "fast" as const, label: "Fast preflight" },
      { value: "release" as const, label: "Full release preflight" },
    ],
    initialValue,
  });

  return isPromptCancelled(mode) ? null : mode;
};

const chooseAssetOperation = async (
  initialValue?: AssetOperation
): Promise<AssetOperation | null> => {
  const operation = await select({
    message: "Select asset action",
    options: [
      { value: "generate" as const, label: "Generate tenant assets" },
      { value: "audit" as const, label: "Audit tenant assets" },
    ],
    initialValue,
  });

  return isPromptCancelled(operation) ? null : operation;
};

export const promptForSelection = async (
  parsed: ParsedAppArguments
): Promise<AppSelection | null> => {
  const tenantId = parsed.tenantId ?? (await chooseTenant());
  if (!tenantId) {
    cancel("Operation cancelled.");
    return null;
  }

  const action = parsed.action ?? (await chooseAction());
  if (!action) {
    cancel("Operation cancelled.");
    return null;
  }

  if (action === "build") {
    const platform = parsed.platform ?? (await choosePlatform());
    const environment = await chooseEnvironment(parsed.environment, true);
    if (!platform || !environment) {
      cancel("Operation cancelled.");
      return null;
    }

    return {
      action,
      tenantId,
      platform,
      environment: environment as ReleaseProfile,
      profile: environment as ReleaseProfile,
    };
  }

  const environment = await chooseEnvironment(parsed.environment, action === "update");
  if (!environment) {
    cancel("Operation cancelled.");
    return null;
  }

  if (action === "run") {
    const platform = parsed.platform ?? (await choosePlatform());
    if (!platform) {
      cancel("Operation cancelled.");
      return null;
    }

    return { action, tenantId, environment, platform };
  }

  if (action === "preflight") {
    const mode = parsed.preflightMode ?? (await choosePreflightMode());
    if (!mode) {
      cancel("Operation cancelled.");
      return null;
    }

    return { action, tenantId, environment, mode };
  }

  if (action === "assets") {
    const operation = parsed.assetOperation ?? (await chooseAssetOperation());
    if (!operation) {
      cancel("Operation cancelled.");
      return null;
    }

    return { action, tenantId, environment, operation };
  }

  if (action === "start") {
    return { action, tenantId, environment };
  }

  return { action: "update", tenantId, environment: environment as ReleaseProfile };
};

export const confirmSelection = async (selection: AppSelection): Promise<boolean> => {
  printSelectionSummary(selection);
  const shouldRun = await confirm({
    message: "Run this action?",
    initialValue: false,
  });

  if (isPromptCancelled(shouldRun)) {
    cancel("Operation cancelled.");
    return false;
  }

  return shouldRun;
};
