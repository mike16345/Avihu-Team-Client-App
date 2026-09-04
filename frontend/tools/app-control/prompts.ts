import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { box, cancel, confirm, isCancel, path as pathPrompt, select } from "@clack/prompts";
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
import { getBuildPackageScript } from "./buildScripts";

const APP_AREAS = ["develop", "verify", "release", "assets"] as const;
type AppArea = (typeof APP_AREAS)[number];
const BACK = "__back__" as const;
type Back = typeof BACK;
const BACK_OPTION = { value: BACK, label: "← Back" } as const;
const DEVELOPMENT_EAS_BUILD = "__development_eas_build__" as const;
type ActionChoice = AppAction | typeof DEVELOPMENT_EAS_BUILD;

const isPromptCancelled = <Value>(value: Value): value is Value & symbol => isCancel(value);
const isBack = (value: unknown): value is Back => value === BACK;

const formatAction = (selection: AppSelection): string => {
  switch (selection.action) {
    case "preflight":
      return `${selection.mode} preflight`;
    case "assets":
      return `${selection.operation} assets`;
    case "build":
      return `${selection.profile} build`;
    case "install":
      return "install existing build";
    case "run":
      return `build, install & launch (${selection.environment === "development" ? "Debug" : "Release"})`;
    case "start":
      return "start development server";
    case "update":
      return "publish update";
  }
};

const formatEquivalentCommand = (selection: AppSelection): string => {
  if (selection.action === "build" && selection.usePackageScript) {
    return `npm run ${getBuildPackageScript(selection.platform, selection.profile)} -- --tenant ${selection.tenantId}`;
  }

  const parts = ["npm run app --", selection.action];

  if (
    selection.action === "run" ||
    selection.action === "install" ||
    selection.action === "build"
  ) {
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

  if (selection.action === "install") {
    parts.push("--binary", JSON.stringify(selection.binaryPath));
  }

  if ((selection.action === "run" || selection.action === "install") && selection.device) {
    parts.push("--device", JSON.stringify(selection.device));
  }

  parts.push("--yes");
  return parts.join(" ");
};

export const printSelectionSummary = (selection: AppSelection): void => {
  const tenant = getTenant(selection.tenantId);
  const identity = tenant.environments[selection.environment];
  const identityLines =
    selection.action === "run" || selection.action === "install" || selection.action === "build"
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
      `Repeat command: ${formatEquivalentCommand(selection)}`,
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

const chooseArea = async (localOnly: boolean): Promise<AppArea | Back | null> => {
  const area = await select({
    message: "What do you want to do?",
    options: [
      { value: "develop" as const, label: "Develop & run" },
      { value: "verify" as const, label: "Verify app" },
      ...(localOnly ? [] : [{ value: "release" as const, label: "Release app" }]),
      { value: "assets" as const, label: "Manage assets" },
      BACK_OPTION,
    ],
  });

  return isPromptCancelled(area) ? null : area;
};

const chooseAction = async (
  localOnly: boolean,
  initialValue?: AppAction
): Promise<ActionChoice | Back | null> => {
  if (initialValue) {
    return initialValue;
  }

  while (true) {
    const area = await chooseArea(localOnly);
    if (!area || isBack(area)) {
      return area;
    }

    if (area === "verify") {
      return "preflight";
    }

    if (area === "assets") {
      return "assets";
    }

    const action = await select({
      message: area === "develop" ? "Select development action" : "Select release action",
      options:
        area === "develop"
          ? [
              { value: "start" as const, label: "Start development server" },
              { value: "run" as const, label: "Build, install & launch" },
              ...(localOnly
                ? []
                : [
                    {
                      value: DEVELOPMENT_EAS_BUILD,
                      label: "Build development client with EAS",
                    },
                  ]),
              { value: "install" as const, label: "Install an existing build" },
              BACK_OPTION,
            ]
          : [
              { value: "build" as const, label: "Build with EAS" },
              { value: "update" as const, label: "Publish an update" },
              BACK_OPTION,
            ],
    });

    if (isPromptCancelled(action)) {
      return null;
    }
    if (!isBack(action)) {
      return action;
    }
  }
};

const chooseEnvironment = async (
  initialValue: TenantEnvironment | undefined,
  releaseOnly: boolean,
  developmentOnly = false
): Promise<TenantEnvironment | Back | null> => {
  const environments = developmentOnly
    ? TENANT_ENVIRONMENTS.filter((environment) => environment === "development")
    : releaseOnly
      ? TENANT_ENVIRONMENTS.filter((environment) => environment !== "development")
      : TENANT_ENVIRONMENTS;
  const environment = await select({
    message: releaseOnly ? "Select release environment" : "Select environment",
    options: [...environments.map((value) => ({ value, label: value })), BACK_OPTION],
    initialValue,
  });

  return isPromptCancelled(environment) ? null : environment;
};

const choosePlatform = async (initialValue?: AppPlatform): Promise<AppPlatform | Back | null> => {
  const platform = await select({
    message: "Select platform",
    options: [
      { value: "android" as const, label: "Android" },
      { value: "ios" as const, label: "iOS" },
      BACK_OPTION,
    ],
    initialValue,
  });

  return isPromptCancelled(platform) ? null : platform;
};

const chooseBinaryPath = async (initialValue?: string): Promise<string | null> => {
  const binaryPath = await pathPrompt({
    message: "Select the existing app build",
    root: process.cwd(),
    initialValue,
    validate: (value) => {
      if (!value) {
        return "Select a build file";
      }
      const absolutePath = resolve(value);
      if (!existsSync(absolutePath)) {
        return "Build file does not exist";
      }
      if (!statSync(absolutePath).isFile()) {
        return "Select a build file, not a directory";
      }
      return undefined;
    },
  });

  return isPromptCancelled(binaryPath) ? null : resolve(binaryPath);
};

const choosePreflightMode = async (
  initialValue?: PreflightMode
): Promise<PreflightMode | Back | null> => {
  const mode = await select({
    message: "Select preflight depth",
    options: [
      { value: "fast" as const, label: "Fast preflight" },
      { value: "release" as const, label: "Full release preflight" },
      BACK_OPTION,
    ],
    initialValue,
  });

  return isPromptCancelled(mode) ? null : mode;
};

const chooseAssetOperation = async (
  initialValue?: AssetOperation
): Promise<AssetOperation | Back | null> => {
  const operation = await select({
    message: "Select asset action",
    options: [
      { value: "generate" as const, label: "Generate tenant assets" },
      { value: "audit" as const, label: "Audit tenant assets" },
      BACK_OPTION,
    ],
    initialValue,
  });

  return isPromptCancelled(operation) ? null : operation;
};

export const promptForSelection = async (
  parsed: ParsedAppArguments
): Promise<AppSelection | null> => {
  let tenantId = parsed.tenantId;
  let actionOverride = parsed.action;

  while (true) {
    if (!tenantId) {
      tenantId = (await chooseTenant()) ?? undefined;
    }
    if (!tenantId) {
      cancel("Operation cancelled.");
      return null;
    }

    const localOnly = getTenant(tenantId).kind === "local";
    const actionResult = actionOverride ?? (await chooseAction(localOnly));
    if (!actionResult) {
      cancel("Operation cancelled.");
      return null;
    }
    if (isBack(actionResult)) {
      tenantId = undefined;
      actionOverride = undefined;
      continue;
    }

    const isDevelopmentEasBuild = actionResult === DEVELOPMENT_EAS_BUILD;
    const action = isDevelopmentEasBuild ? "build" : actionResult;
    while (true) {
      const environmentResult = isDevelopmentEasBuild
        ? "development"
        : await chooseEnvironment(
            parsed.environment,
            action === "build" || action === "update",
            localOnly && action === "run"
          );
      if (!environmentResult) {
        cancel("Operation cancelled.");
        return null;
      }
      if (isBack(environmentResult)) {
        actionOverride = undefined;
        break;
      }
      const environment = environmentResult;

      if (action === "start") {
        return { action, tenantId, environment };
      }

      if (action === "update") {
        return { action, tenantId, environment: environment as ReleaseProfile };
      }

      if (action === "preflight") {
        const mode = parsed.preflightMode ?? (await choosePreflightMode());
        if (!mode) {
          cancel("Operation cancelled.");
          return null;
        }
        if (isBack(mode)) {
          if (parsed.environment) {
            actionOverride = undefined;
            break;
          }
          continue;
        }
        return { action, tenantId, environment, mode };
      }

      if (action === "assets") {
        const operation = parsed.assetOperation ?? (await chooseAssetOperation());
        if (!operation) {
          cancel("Operation cancelled.");
          return null;
        }
        if (isBack(operation)) {
          if (parsed.environment) {
            actionOverride = undefined;
            break;
          }
          continue;
        }
        return { action, tenantId, environment, operation };
      }

      const platform = parsed.platform ?? (await choosePlatform());
      if (!platform) {
        cancel("Operation cancelled.");
        return null;
      }
      if (isBack(platform)) {
        if (isDevelopmentEasBuild || parsed.environment) {
          actionOverride = undefined;
          break;
        }
        continue;
      }

      if (action === "run") {
        return { action, tenantId, environment, platform, device: parsed.device };
      }

      if (action === "build") {
        return {
          action,
          tenantId,
          platform,
          environment: environment as ReleaseProfile,
          profile: environment as ReleaseProfile,
          usePackageScript: true,
        };
      }

      const binaryPath = parsed.binaryPath ?? (await chooseBinaryPath());
      if (!binaryPath) {
        cancel("Operation cancelled.");
        return null;
      }
      return {
        action: "install",
        tenantId,
        environment,
        platform,
        binaryPath,
        device: parsed.device,
      };
    }
  }
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
