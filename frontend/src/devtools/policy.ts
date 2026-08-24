import type { PublicTenantRuntimeConfig } from "@/config/runtimeTenant";

const UNAVAILABLE = "Unavailable";

type TenantEnvironment = PublicTenantRuntimeConfig["environment"];

export interface DeveloperDiagnosticsInput {
  tenantId: string;
  displayName: string;
  environment: TenantEnvironment;
  platform: "ios" | "android";
  appVersion?: string | null;
  iosBundleIdentifier?: string | null;
  androidPackage?: string | null;
  apiUrl?: string | null;
}

export interface DeveloperDiagnostics {
  tenant: string;
  environment: TenantEnvironment;
  applicationId: string;
  appVersion: string;
  apiHost: string;
}

export const isDeveloperToolsAvailable = (
  isDevelopmentBuild: boolean,
  environment: TenantEnvironment
): boolean => isDevelopmentBuild && environment === "development";

const getApiHost = (apiUrl: string | null | undefined): string => {
  if (!apiUrl) return UNAVAILABLE;

  try {
    return new URL(apiUrl).host || UNAVAILABLE;
  } catch {
    return UNAVAILABLE;
  }
};

export const createDeveloperDiagnostics = (
  input: DeveloperDiagnosticsInput
): DeveloperDiagnostics => ({
  tenant: `${input.displayName} (${input.tenantId})`,
  environment: input.environment,
  applicationId:
    (input.platform === "ios" ? input.iosBundleIdentifier : input.androidPackage) || UNAVAILABLE,
  appVersion: input.appVersion || UNAVAILABLE,
  apiHost: getApiHost(input.apiUrl),
});
