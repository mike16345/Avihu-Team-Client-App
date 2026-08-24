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
  apiUrl: "https://api.example.com",
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
  it("returns platform identity and strips every sensitive API URL component", () => {
    expect(
      createDeveloperDiagnostics(
        validInput({
          apiUrl: "https://token:secret@api.example.com/private/path?key=secret#fragment",
        })
      )
    ).toEqual({
      tenant: "Elevate Coach (avihu)",
      environment: "development",
      applicationId: "com.avihuteam.avihuteam.dev",
      appVersion: "2.4.0",
      apiHost: "api.example.com",
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

  it.each([undefined, null, "", "not a URL"])(
    "fails closed for API value %s",
    (apiUrl) => {
      expect(createDeveloperDiagnostics(validInput({ apiUrl })).apiHost).toBe("Unavailable");
    }
  );

  it("fails closed when application identity and version are unavailable", () => {
    expect(
      createDeveloperDiagnostics(
        validInput({ iosBundleIdentifier: null, appVersion: undefined })
      )
    ).toMatchObject({ applicationId: "Unavailable", appVersion: "Unavailable" });
  });
});
