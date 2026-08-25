import type {
  TenantConfig,
  TenantFeatureDefaults,
  TenantNativeCapabilities,
} from "../../config/tenants/types";
import type { ThemePresetId } from "../../config/tenants/themePresets";

export type TenantAddMode = "local" | "repository";
export type TenantThemeSelection =
  { kind: "preset"; presetId: ThemePresetId } | { kind: "recipe-file"; path: string };

export interface TenantAddAnswers {
  mode: TenantAddMode;
  id: string;
  displayName: string;
  logoPath?: string;
  identifierBase?: string;
  themeSelection: TenantThemeSelection;
  supportsRtl?: boolean;
  forcesRtl?: boolean;
  featureDefaults?: TenantFeatureDefaults;
  nativeCapabilities: TenantNativeCapabilities;
}

export interface TenantAddResult {
  tenant: TenantConfig;
  modulePath: string;
  assetDirectory: string;
  stagingRoot: string;
  stagedModulePath: string;
  stagedAssetDirectory: string;
  logoSource: "provided" | "fallback";
  launchCommand: string;
}
