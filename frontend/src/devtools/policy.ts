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
  apiMode?: string | null;
  hasApiUrl?: boolean;
  hasPreviewApi?: boolean;
}

export type DeveloperApiEnvironment = "test" | "preview" | "production" | "unknown";

export interface DeveloperDiagnostics {
  tenant: string;
  environment: TenantEnvironment;
  applicationId: string;
  appVersion: string;
  apiEnvironment: DeveloperApiEnvironment;
}

export const isDeveloperToolsAvailable = (
  isDevelopmentBuild: boolean,
  environment: TenantEnvironment
): boolean => isDevelopmentBuild && environment === "development";

const getApiEnvironment = ({
  apiMode,
  hasApiUrl,
  hasPreviewApi,
}: Pick<
  DeveloperDiagnosticsInput,
  "apiMode" | "hasApiUrl" | "hasPreviewApi"
>): DeveloperApiEnvironment => {
  if (hasPreviewApi) return "preview";
  if (!hasApiUrl) return "unknown";
  if (apiMode === "development") return "test";
  return "production";
};

export const createDeveloperDiagnostics = (
  input: DeveloperDiagnosticsInput
): DeveloperDiagnostics => ({
  tenant: `${input.displayName} (${input.tenantId})`,
  environment: input.environment,
  applicationId:
    (input.platform === "ios" ? input.iosBundleIdentifier : input.androidPackage) || UNAVAILABLE,
  appVersion: input.appVersion || UNAVAILABLE,
  apiEnvironment: getApiEnvironment(input),
});
