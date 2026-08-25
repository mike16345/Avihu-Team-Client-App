import type { TenantConfig, TenantNativeCapabilities } from "../../config/tenants/types";

export type TenantAddMode = "local" | "repository";

export interface TenantAddAnswers {
  mode: TenantAddMode;
  id: string;
  displayName: string;
  logoPath?: string;
  owner?: string;
  projectId?: string;
  identifierBase?: string;
  primaryColor: string;
  onPrimaryColor: string;
  accentColor: string;
  onAccentColor: string;
  backgroundColor: string;
  onBackgroundColor: string;
  nativeCapabilities: TenantNativeCapabilities;
}

export interface TenantAddResult {
  tenant: TenantConfig;
  modulePath: string;
  assetDirectory: string;
  logoSource: "provided" | "fallback";
  launchCommand: string;
}
