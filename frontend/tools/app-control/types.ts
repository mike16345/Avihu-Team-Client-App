import type { TenantEnvironment } from "../../config/tenants/types";

export const APP_ACTIONS = [
  "start",
  "run",
  "install",
  "preflight",
  "assets",
  "build",
  "update",
] as const;
export const APP_PLATFORMS = ["android", "ios"] as const;
export const PREFLIGHT_MODES = ["fast", "release"] as const;
export const ASSET_OPERATIONS = ["generate", "audit"] as const;

export type AppAction = (typeof APP_ACTIONS)[number];
export type AppPlatform = (typeof APP_PLATFORMS)[number];
export type PreflightMode = (typeof PREFLIGHT_MODES)[number];
export type AssetOperation = (typeof ASSET_OPERATIONS)[number];
export type ReleaseProfile = TenantEnvironment;

export interface CommandStep {
  command: string;
  args: string[];
  env: Record<string, string>;
  label: string;
}

export interface CommandSpec extends CommandStep {
  prerequisite?: CommandStep;
}

export interface ParsedAppArguments {
  action?: AppAction;
  platform?: AppPlatform;
  tenantId?: string;
  environment?: TenantEnvironment;
  profile?: ReleaseProfile;
  preflightMode?: PreflightMode;
  assetOperation?: AssetOperation;
  binaryPath?: string;
  device?: string;
  confirmed: boolean;
  dryRun: boolean;
}

interface BaseSelection {
  tenantId: string;
  environment: TenantEnvironment;
}

export type AppSelection =
  | (BaseSelection & { action: "start" })
  | (BaseSelection & { action: "run"; platform: AppPlatform; device?: string })
  | (BaseSelection & {
      action: "install";
      platform: AppPlatform;
      binaryPath: string;
      device?: string;
    })
  | (BaseSelection & { action: "preflight"; mode: PreflightMode })
  | (BaseSelection & { action: "assets"; operation: AssetOperation })
  | (BaseSelection & {
      action: "build";
      platform: AppPlatform;
      environment: ReleaseProfile;
      profile: ReleaseProfile;
    })
  | (BaseSelection & { action: "update"; environment: ReleaseProfile });
