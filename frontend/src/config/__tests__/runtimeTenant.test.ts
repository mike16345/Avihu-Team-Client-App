import { describe, expect, it } from "vitest";

import {
  getRuntimeTenant,
  getRuntimeTenantDisplayName,
  isTenantEnvironmentBadgeVisible,
} from "../runtimeTenant";

const createConstants = (showEnvironmentBadge: boolean) => ({
  expoConfig: {
    extra: {
      tenant: {
        id: "avihu",
        displayName: "Elevate Coach",
        environment: "development",
        brand: {
          primaryColor: "#000000",
          backgroundColor: "#FFFFFF",
        },
        featureFlags: {
          supportsRtl: true,
          forcesRtl: true,
        },
        showEnvironmentBadge,
      },
    },
  },
});

describe("getRuntimeTenant", () => {
  it("strictly parses the public runtime tenant snapshot", () => {
    const runtimeTenant = getRuntimeTenant(createConstants(true));

    expect(runtimeTenant).toEqual(createConstants(true).expoConfig.extra.tenant);
    expect(getRuntimeTenantDisplayName(createConstants(true))).toBe("Elevate Coach");
    expect(isTenantEnvironmentBadgeVisible(runtimeTenant)).toBe(true);
  });

  it("rejects missing tenant metadata", () => {
    expect(() => getRuntimeTenant({ expoConfig: { extra: {} } })).toThrow(
      "Runtime tenant configuration is invalid"
    );
  });

  it("uses only the explicit binary badge flag", () => {
    const productionTenant = getRuntimeTenant(createConstants(false));
    const previousNodeEnvironment = process.env.NODE_ENV;

    try {
      process.env.NODE_ENV = "development";
      expect(isTenantEnvironmentBadgeVisible(productionTenant)).toBe(false);
    } finally {
      if (previousNodeEnvironment === undefined) {
        Reflect.deleteProperty(process.env, "NODE_ENV");
      } else {
        process.env.NODE_ENV = previousNodeEnvironment;
      }
    }
  });
});
