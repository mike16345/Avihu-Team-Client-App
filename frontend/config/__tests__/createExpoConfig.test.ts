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

  it("rejects malformed semantic app versions", () => {
    for (const version of ["01.2.3", "1.2.3-a..b"]) {
      expect(
        tenantConfigSchema.safeParse({
          ...avihuTenant,
          version,
        }).success
      ).toBe(false);
    }
  });

  it("rejects leading and nested asset traversal segments", () => {
    for (const icon of ["./../secret.png", "./icons/../secret.png"]) {
      expect(
        tenantConfigSchema.safeParse({
          ...avihuTenant,
          assets: {
            ...avihuTenant.assets,
            icon,
          },
        }).success
      ).toBe(false);
    }
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

  it.each([
    ["duplicate iOS", ["ios", "ios"]],
    ["duplicate Android", ["android", "android"]],
    ["oversized duplicates", ["ios", "android", "ios"]],
  ])("rejects %s supported-platform declarations", (_label, platforms) => {
    expect(
      tenantConfigSchema.safeParse({
        ...avihuTenant,
        platforms,
      }).success
    ).toBe(false);
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

  it.each(["development", "preview", "production"] as const)(
    "composes one build-properties plugin with release-only shrinking settings for %s",
    (environment) => {
      const config = createExpoConfig({
        baseConfig: {},
        tenant: getTenant("avihu"),
        environment,
        processEnv: {},
      });
      const buildPropertiesPlugins = config.plugins?.filter((plugin) => {
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
              enableProguardInReleaseBuilds: true,
              enableShrinkResourcesInReleaseBuilds: true,
            },
          },
        ],
      ]);
    }
  );

  it("uses tenant-generated platform asset paths", () => {
    const production = createExpoConfig({
      baseConfig: {},
      tenant: getTenant("avihu"),
      environment: "production",
      processEnv: {},
    });

    expect(getTenant("avihu").assets.legacy).toBe(false);
    expect(production.icon).toBe("./config/tenants/assets/avihu/generated/apple-icon.png");
    expect(production.splash?.image).toBe("./config/tenants/assets/avihu/generated/splash.png");
    expect(production.android?.adaptiveIcon?.foregroundImage).toBe(
      "./config/tenants/assets/avihu/generated/android-adaptive-foreground.png"
    );
    expect(production.android?.adaptiveIcon?.backgroundImage).toBe(
      "./config/tenants/assets/avihu/generated/android-adaptive-background.png"
    );
    expect(production.plugins).toContainEqual([
      "expo-notifications",
      expect.objectContaining({
        icon: "./config/tenants/assets/avihu/generated/notification-icon.png",
        color: "#ffffff",
      }),
    ]);
  });
});
