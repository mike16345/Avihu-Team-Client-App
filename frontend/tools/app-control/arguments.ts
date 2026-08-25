import { parseArgs } from "node:util";
import { getTenant } from "../../config/tenants/registry";
import { parseTenantEnvironment } from "../../config/tenants/schema";
import type { TenantEnvironment } from "../../config/tenants/types";
import {
  APP_ACTIONS,
  APP_PLATFORMS,
  ASSET_OPERATIONS,
  PREFLIGHT_MODES,
  type AppAction,
  type AppPlatform,
  type AssetOperation,
  type ParsedAppArguments,
  type PreflightMode,
  type ReleaseProfile,
} from "./types";

const isOneOf = <Value extends string>(values: readonly Value[], value: string): value is Value =>
  values.includes(value as Value);

const parseAction = (value: string | undefined): AppAction | undefined => {
  if (!value) {
    return undefined;
  }

  if (!isOneOf(APP_ACTIONS, value)) {
    throw new Error(`Unknown action "${value}"`);
  }

  return value;
};

const parsePlatform = (
  action: AppAction | undefined,
  value: string | undefined
): AppPlatform | undefined => {
  if (!value) {
    return undefined;
  }

  if (!isOneOf(APP_PLATFORMS, value)) {
    throw new Error(`Unsupported platform "${value}"`);
  }

  if (action !== "build" && action !== "run" && action !== "install") {
    throw new Error(`Action "${action}" does not support platform "${value}"`);
  }

  return value;
};

const parseReleaseProfile = (value: string | undefined): ReleaseProfile | undefined => {
  if (!value) {
    return undefined;
  }

  return parseTenantEnvironment(value);
};

const parsePreflightMode = (value: string | undefined): PreflightMode | undefined => {
  if (!value) {
    return undefined;
  }

  if (!isOneOf(PREFLIGHT_MODES, value)) {
    throw new Error(`Unsupported preflight mode "${value}"`);
  }

  return value;
};

const parseAssetOperation = (value: string | undefined): AssetOperation | undefined => {
  if (!value) {
    return undefined;
  }

  if (!isOneOf(ASSET_OPERATIONS, value)) {
    throw new Error(`Unsupported asset operation "${value}"`);
  }

  return value;
};

const requireConfirmedValue = (value: string | undefined, flag: string): string => {
  if (!value) {
    throw new Error(`${flag} is required in non-interactive mode`);
  }

  return value;
};

const assertConfirmedArguments = (arguments_: ParsedAppArguments): void => {
  if (!arguments_.confirmed) {
    return;
  }

  requireConfirmedValue(arguments_.action, "action");
  requireConfirmedValue(arguments_.tenantId, "--tenant");

  if (arguments_.action === "build") {
    requireConfirmedValue(arguments_.platform, "platform");
    if (!arguments_.profile) {
      throw new Error("--profile is required for build in non-interactive mode");
    }
  } else {
    requireConfirmedValue(arguments_.environment, "--environment");
  }

  if (arguments_.action === "run") {
    requireConfirmedValue(arguments_.platform, "platform");
  }

  if (arguments_.action === "install") {
    requireConfirmedValue(arguments_.platform, "platform");
    if (!arguments_.binaryPath) {
      throw new Error("--binary is required for install in non-interactive mode");
    }
  }

  if (arguments_.action === "assets") {
    requireConfirmedValue(arguments_.assetOperation, "asset operation");
  }
};

const resolveEnvironment = (
  action: AppAction | undefined,
  environmentValue: string | undefined,
  profile: ReleaseProfile | undefined
): TenantEnvironment | undefined => {
  const environment = environmentValue ? parseTenantEnvironment(environmentValue) : undefined;

  if (action !== "build") {
    return environment;
  }

  if (environment && profile && environment !== profile) {
    throw new Error("--environment must match --profile for build actions");
  }

  return profile ?? environment;
};

export const parseAppArguments = (argv: string[]): ParsedAppArguments => {
  const { positionals, values } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      tenant: { type: "string" },
      environment: { type: "string" },
      profile: { type: "string" },
      binary: { type: "string" },
      device: { type: "string" },
      yes: { type: "boolean", default: false },
      "dry-run": { type: "boolean", default: false },
    },
    strict: true,
  });
  const [actionValue, operationOrPlatform, unexpectedValue] = positionals;

  if (unexpectedValue) {
    throw new Error(`Unexpected argument "${unexpectedValue}"`);
  }

  const action = parseAction(actionValue);
  if (
    action !== "build" &&
    action !== "run" &&
    action !== "install" &&
    operationOrPlatform &&
    isOneOf(APP_PLATFORMS, operationOrPlatform)
  ) {
    throw new Error(`Action "${action}" does not support platform "${operationOrPlatform}"`);
  }

  const platform =
    action === "build" || action === "run" || action === "install"
      ? parsePlatform(action, operationOrPlatform)
      : undefined;
  const profile = parseReleaseProfile(values.profile);
  const environment = resolveEnvironment(action, values.environment, profile);
  const preflightMode =
    action === "preflight" ? parsePreflightMode(operationOrPlatform) : undefined;
  const assetOperation = action === "assets" ? parseAssetOperation(operationOrPlatform) : undefined;

  if (
    action !== "build" &&
    action !== "run" &&
    action !== "install" &&
    operationOrPlatform &&
    action !== "preflight" &&
    action !== "assets"
  ) {
    throw new Error(`Action "${action}" does not accept "${operationOrPlatform}"`);
  }

  if (action !== "build" && profile) {
    throw new Error("--profile is only supported for build actions");
  }

  if (action !== "install" && values.binary) {
    throw new Error("--binary is only supported for install actions");
  }

  if (action !== "run" && action !== "install" && values.device) {
    throw new Error("--device is only supported for run and install actions");
  }

  if (action === "update" && environment === "development") {
    throw new Error("Updates require the preview or production environment");
  }

  if (values.tenant) {
    getTenant(values.tenant);
  }

  const arguments_ = {
    action,
    platform,
    tenantId: values.tenant,
    environment,
    profile,
    preflightMode,
    assetOperation,
    binaryPath: values.binary,
    device: values.device,
    confirmed: values.yes,
    dryRun: values["dry-run"],
  } satisfies ParsedAppArguments;

  assertConfirmedArguments(arguments_);
  return arguments_;
};
