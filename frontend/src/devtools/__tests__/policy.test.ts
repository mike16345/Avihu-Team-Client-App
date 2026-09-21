import { describe, expect, it } from "vitest";

import {
  createDeveloperDiagnostics,
  isDeveloperToolsAvailable,
  type DeveloperDiagnosticsInput,
} from "../policy";

const validInput = (
  overrides: Partial<DeveloperDiagnosticsInput> = {}
): DeveloperDiagnosticsInput => ({
  tenantId: "avihu",
  displayName: "Elevate Coach",
  environment: "development",
  platform: "ios",
  appVersion: "2.4.0",
  iosBundleIdentifier: "com.avihuteam.avihuteam.dev",
  androidPackage: "com.avihuteam.avihuteam.dev",
  apiMode: "development",
  hasApiUrl: true,
  hasPreviewApi: false,
  ...overrides,
});

describe("isDeveloperToolsAvailable", () => {
  it.each([
    [true, "development", true],
    [false, "development", false],
    [true, "preview", false],
    [true, "production", false],
  ] as const)("gates tools for dev=%s environment=%s", (isDev, environment, expected) => {
    expect(isDeveloperToolsAvailable(isDev, environment)).toBe(expected);
  });
});

describe("createDeveloperDiagnostics", () => {
  it("returns platform identity and a safe API environment without exposing a URL", () => {
    expect(createDeveloperDiagnostics(validInput())).toEqual({
      tenant: "Elevate Coach (avihu)",
      environment: "development",
      applicationId: "com.avihuteam.avihuteam.dev",
      appVersion: "2.4.0",
      apiEnvironment: "test",
    });
  });

  it("selects the Android application identifier on Android", () => {
    expect(
      createDeveloperDiagnostics(
        validInput({
          platform: "android",
          iosBundleIdentifier: "com.example.wrong-ios",
          androidPackage: "com.avihuteam.avihuteam.dev",
        })
      ).applicationId
    ).toBe("com.avihuteam.avihuteam.dev");
  });

  it.each([
    [{ apiMode: "development", hasPreviewApi: false }, "test"],
    [{ apiMode: "production", hasPreviewApi: false }, "production"],
    [{ apiMode: "development", hasPreviewApi: true }, "preview"],
    [{ apiMode: undefined, hasApiUrl: true, hasPreviewApi: false }, "production"],
    [{ apiMode: "development", hasApiUrl: false, hasPreviewApi: false }, "unknown"],
  ] as const)("maps API runtime %o to %s", (runtime, expected) => {
    expect(createDeveloperDiagnostics(validInput(runtime)).apiEnvironment).toBe(expected);
  });

  it("fails closed when application identity and version are unavailable", () => {
    expect(
      createDeveloperDiagnostics(validInput({ iosBundleIdentifier: null, appVersion: undefined }))
    ).toMatchObject({ applicationId: "Unavailable", appVersion: "Unavailable" });
  });
});
