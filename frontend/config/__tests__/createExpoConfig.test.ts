import { describe, expect, it } from "vitest";
import { createExpoConfig } from "../createExpoConfig";
import { avihuTenant } from "../tenants/avihu";
import { getTenant, listTenants } from "../tenants/registry";
import { parseTenantEnvironment, tenantConfigSchema } from "../tenants/schema";

describe("tenant registry", () => {
  it("lists the registered tenants in stable order", () => {
    expect(listTenants().map(({ id }) => id)).toEqual(["avihu"]);
  });

  it("rejects an unknown tenant", () => {
    expect(() => getTenant("missing")).toThrowError('Unknown tenant "missing"');
  });

  it("rejects missing or unsupported tenant environments", () => {
    expect(() => parseTenantEnvironment(undefined)).toThrowError(
      "APP_ENV is required and must be one of: development, preview, production"
    );
    expect(() => parseTenantEnvironment("staging")).toThrowError(
      'Invalid APP_ENV "staging". Expected one of: development, preview, production'
    );
  });

  it("rejects embedded secret fields", () => {
    expect(() =>
      tenantConfigSchema.parse({
        ...avihuTenant,
        API_TOKEN: "embedded-secret",
      })
    ).toThrow();
  });

  it("requires explicit permission when environments share a store identity", () => {
    expect(() =>
      tenantConfigSchema.parse({
        ...avihuTenant,
        environments: {
          ...avihuTenant.environments,
          production: {
            ...avihuTenant.environments.production,
            allowSharedStoreIdentity: false,
          },
        },
      })
    ).toThrowError(/allowSharedStoreIdentity/);
  });
});

describe("createExpoConfig", () => {
  it("uses the isolated development application identity", () => {
    const development = createExpoConfig({
      baseConfig: {},
      tenant: getTenant("avihu"),
      environment: "development",
      processEnv: {},
    });

    expect(development.android?.package).toBe("com.avihuteam.avihuteam.dev");
    expect(development.ios?.bundleIdentifier).toBe("com.avihuteam.avihuteam.dev");
    expect(development.scheme).toBe("avihuteam");
  });

  it("uses the production identity and exposes only public tenant metadata", () => {
    const production = createExpoConfig({
      baseConfig: {},
      tenant: getTenant("avihu"),
      environment: "production",
      processEnv: {
        API_KEY: "private-server-key",
        EXPO_PUBLIC_API_AUTH_TOKEN: "public-client-key",
        EXPO_PUBLIC_SERVER: "https://api.example.com",
        EXPO_PUBLIC_API_URL_PREVIEW: "https://preview-api.example.com",
        EXPO_PUBLIC_TRAINER_PHONE_NUMBER: "+15555550100",
        EXPO_PUBLIC_CLOUDFRONT_URL: "https://cdn.example.com",
        EXPO_PUBLIC_MODE: "production",
        UNRELATED_VALUE: "not-allowlisted",
      },
    });

    expect(production.android?.package).toBe("com.avihuteam.avihuteam");
    expect(production.extra?.tenant).toMatchObject({
      id: "avihu",
      environment: "production",
    });
    expect(production.extra).toMatchObject({
      API_URL: "https://api.example.com",
      API_URL_PREVIEW: "https://preview-api.example.com",
      TRAINER_PHONE_NUMBER: "+15555550100",
      CLOUDFRONT_URL: "https://cdn.example.com",
      DEV_MODE: "production",
    });

    const serializedExtra = JSON.stringify(production.extra);
    expect(serializedExtra).not.toContain("API_TOKEN");
    expect(serializedExtra).not.toContain("private-server-key");
    expect(serializedExtra).not.toContain("public-client-key");
    expect(serializedExtra).not.toContain("not-allowlisted");
  });

  it("composes one build-properties plugin with current SDK and shrinking settings", () => {
    const production = createExpoConfig({
      baseConfig: {},
      tenant: getTenant("avihu"),
      environment: "production",
      processEnv: {},
    });
    const buildPropertiesPlugins = production.plugins?.filter((plugin) => {
      if (typeof plugin === "string") return plugin === "expo-build-properties";
      return plugin[0] === "expo-build-properties";
    });

    expect(buildPropertiesPlugins).toEqual([
      [
        "expo-build-properties",
        {
          android: {
            compileSdkVersion: 36,
            targetSdkVersion: 36,
            minSdkVersion: 26,
            enableProguardInReleaseBuilds: false,
            enableShrinkResourcesInReleaseBuilds: false,
          },
        },
      ],
    ]);
  });

  it("keeps the working asset paths explicitly marked as legacy", () => {
    const production = createExpoConfig({
      baseConfig: {},
      tenant: getTenant("avihu"),
      environment: "production",
      processEnv: {},
    });

    expect(getTenant("avihu").assets.legacy).toBe(true);
    expect(production.icon).toBe("./assets/app-logo.png");
    expect(production.splash?.image).toBe("./assets/splash-screen.png");
    expect(production.android?.adaptiveIcon?.foregroundImage).toBe("./assets/app-logo.png");
    expect(production.plugins).toContainEqual([
      "expo-notifications",
      expect.objectContaining({ icon: "./assets/app-logo.png", color: "#ffffff" }),
    ]);
  });
});
