import { afterEach, describe, expect, it, vi } from "vitest";
import packageJson from "../../../package.json";
import { avihuTenant } from "../../../config/tenants/avihu";
import { assertTenantActionAllowed, resolveAction } from "../actions";

describe("resolveAction", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("blocks release operations for ignored local tenants", () => {
    const localTenant = { ...avihuTenant, id: "test-tenant", kind: "local" as const };
    expect(() =>
      assertTenantActionAllowed(localTenant, {
        action: "build",
        platform: "ios",
        tenantId: localTenant.id,
        environment: "production",
        profile: "production",
      })
    ).toThrow('Local tenant "test-tenant" cannot run build actions');
    expect(() =>
      assertTenantActionAllowed(localTenant, {
        action: "preflight",
        mode: "release",
        tenantId: localTenant.id,
        environment: "production",
      })
    ).toThrow(/release preflight/u);
    expect(() =>
      assertTenantActionAllowed(localTenant, {
        action: "start",
        tenantId: localTenant.id,
        environment: "development",
      })
    ).not.toThrow();
  });

  it("blocks EAS actions for repository tenants whose setup is pending", () => {
    const pendingTenant = { ...avihuTenant, id: "new-tenant", eas: { status: "pending" as const } };
    expect(() =>
      assertTenantActionAllowed(pendingTenant, {
        action: "update",
        tenantId: pendingTenant.id,
        environment: "production",
      })
    ).toThrow(/tenant:eas -- --tenant new-tenant/u);
  });

  it("routes every legacy update alias through guarded app control", () => {
    expect(packageJson.scripts["update:prod"]).toMatch(/^npm run app -- update /u);
    expect(packageJson.scripts["update:preview"]).toMatch(/^npm run app -- update /u);
    expect(packageJson.scripts["update:prod"]).not.toContain("eas update");
    expect(packageJson.scripts["update:preview"]).not.toContain("eas update");
  });

  it("runs local Android builds with the configured Java 17 toolchain", () => {
    vi.stubEnv("APP_ANDROID_JAVA_HOME", "/toolchains/java-17");
    vi.stubEnv("PATH", "/usr/local/bin:/usr/bin");

    expect(
      resolveAction({
        action: "run",
        platform: "android",
        tenantId: "avihu",
        environment: "development",
      }).env
    ).toMatchObject({
      JAVA_HOME: "/toolchains/java-17",
      PATH: "/toolchains/java-17/bin:/usr/local/bin:/usr/bin",
    });
  });

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
        ADB_MDNS_AUTO_CONNECT: "0",
      },
      prerequisite: {
        command: "npx",
        args: ["tsx", "tools/app-control/prepareAndroidDevice.ts"],
        env: {
          APP_TENANT: "avihu",
          APP_ENV: "production",
          ADB_MDNS_AUTO_CONNECT: "0",
        },
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

  it("reopens the Android chooser when a broken mDNS serial was supplied explicitly", () => {
    vi.stubEnv("APP_ANDROID_JAVA_HOME", "/toolchains/java-17");

    expect(
      resolveAction({
        action: "run",
        platform: "android",
        tenantId: "avihu",
        environment: "development",
        device: "adb-RFGYB1ELTPW-ihT621 (2)._adb-tls-connect._tcp",
      }).args
    ).toEqual(["expo", "run:android", "--variant", "debug", "--device"]);
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
        ADB_MDNS_AUTO_CONNECT: "0",
      },
      prerequisite: {
        command: "npx",
        args: ["tsx", "tools/app-control/prepareAndroidDevice.ts"],
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
        "eas-cli@22.4.0",
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

  it("runs tenant preflight before publishing an Avihu update", () => {
    expect(
      resolveAction({
        action: "update",
        tenantId: "avihu",
        environment: "production",
      })
    ).toMatchObject({
      command: "npx",
      args: expect.arrayContaining(["eas-cli@22.4.0", "update"]),
      env: { APP_TENANT: "avihu", APP_ENV: "production" },
      prerequisite: {
        command: "npm",
        args: ["run", "preflight"],
        env: { APP_TENANT: "avihu", APP_ENV: "production" },
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
