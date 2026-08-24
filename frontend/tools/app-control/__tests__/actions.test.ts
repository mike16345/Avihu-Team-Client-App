import { describe, expect, it } from "vitest";
import { resolveAction } from "../actions";

describe("resolveAction", () => {
  it("builds and launches an Android production release with Expo's device selector", () => {
    expect(
      resolveAction({
        action: "run",
        platform: "android",
        tenantId: "avihu",
        environment: "production",
      })
    ).toMatchObject({
      command: "npx",
      args: ["expo", "run:android", "--variant", "release", "--device", "--no-bundler"],
      env: {
        APP_TENANT: "avihu",
        APP_ENV: "production",
      },
    });
  });

  it("builds and launches an iOS development build on the requested device", () => {
    expect(
      resolveAction({
        action: "run",
        platform: "ios",
        tenantId: "avihu",
        environment: "development",
        device: "iPhone 16 Pro",
      })
    ).toMatchObject({
      command: "npx",
      args: ["expo", "run:ios", "--configuration", "Debug", "--device", "iPhone 16 Pro"],
    });
  });

  it("installs an existing binary on a selected device without rebuilding it", () => {
    expect(
      resolveAction({
        action: "install",
        platform: "android",
        tenantId: "avihu",
        environment: "production",
        binaryPath: "/tmp/elevate-coach.apk",
        device: "Pixel_9_API_36",
      })
    ).toMatchObject({
      command: "npx",
      args: [
        "expo",
        "run:android",
        "--binary",
        "/tmp/elevate-coach.apk",
        "--device",
        "Pixel_9_API_36",
        "--no-bundler",
      ],
      env: {
        APP_TENANT: "avihu",
        APP_ENV: "production",
      },
    });
  });

  it("maps an Avihu production build to the pinned EAS command and child environment", () => {
    expect(
      resolveAction({
        action: "build",
        platform: "android",
        tenantId: "avihu",
        environment: "production",
        profile: "production",
      })
    ).toMatchObject({
      command: "npx",
      args: [
        "--yes",
        "eas-cli@16.27.0",
        "build",
        "--platform",
        "android",
        "--profile",
        "production",
      ],
      env: {
        APP_TENANT: "avihu",
        APP_ENV: "production",
      },
      prerequisite: {
        command: "npm",
        args: ["run", "preflight:eas"],
        env: {
          APP_TENANT: "avihu",
          APP_ENV: "production",
        },
      },
    });
  });

  it("maps fast preflight directly to the shared package script", () => {
    expect(
      resolveAction({
        action: "preflight",
        mode: "fast",
        tenantId: "avihu",
        environment: "development",
      })
    ).toMatchObject({
      command: "npm",
      args: ["run", "preflight"],
      env: {
        APP_TENANT: "avihu",
        APP_ENV: "development",
      },
    });
  });

  it("maps release preflight directly to the shared package script", () => {
    expect(
      resolveAction({
        action: "preflight",
        mode: "release",
        tenantId: "avihu",
        environment: "production",
      })
    ).toMatchObject({
      command: "npm",
      args: ["run", "preflight:release"],
      env: {
        APP_TENANT: "avihu",
        APP_ENV: "production",
      },
    });
  });
});
