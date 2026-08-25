import { describe, expect, it } from "vitest";

import { avihuTenant } from "../tenants/avihu";
import * as tenantFeatures from "../tenants/features";
import { tenantConfigSchema } from "../tenants/schema";

type FeatureFoundationModule = typeof tenantFeatures & {
  resolveTenantFeatures?: (
    defaults: typeof avihuTenant.featureDefaults,
    overrides?: Partial<typeof avihuTenant.featureDefaults>
  ) => typeof avihuTenant.featureDefaults;
  tenantFeatureOverridesSchema?: {
    safeParse: (value: unknown) => { success: boolean };
  };
};

const featureFoundation = tenantFeatures as FeatureFoundationModule;

describe("tenant policy foundations", () => {
  it("separates localization, JavaScript defaults, and native binary capabilities", () => {
    expect(tenantConfigSchema.parse(avihuTenant)).toMatchObject({
      kind: "repository",
      localization: {
        supportsRtl: true,
        forcesRtl: true,
      },
      featureDefaults: {
        articles: true,
        chat: true,
        dietPlan: true,
        smartFoodCatalog: true,
        workoutPlan: true,
        stepTracking: true,
        progressTracking: true,
        formsAndAgreements: true,
        mediaCapture: true,
        notifications: true,
      },
      nativeCapabilities: {
        camera: true,
        photoLibrary: true,
        notifications: true,
        backgroundTasks: true,
        appleHealth: true,
        healthConnect: true,
        liveActivities: true,
      },
    });
  });

  it("resolves future entitlement overrides over tenant defaults and rejects unknown keys", () => {
    expect(
      featureFoundation.resolveTenantFeatures?.(avihuTenant.featureDefaults, { chat: false })
    ).toEqual({
      ...avihuTenant.featureDefaults,
      chat: false,
    });
    expect(
      featureFoundation.tenantFeatureOverridesSchema?.safeParse({ unknownFeature: true }).success
    ).toBe(false);
  });

  it("rejects JavaScript defaults that require unavailable native binary capabilities", () => {
    for (const [capability, feature] of [
      ["camera", "mediaCapture"],
      ["photoLibrary", "mediaCapture"],
      ["notifications", "notifications"],
      ["appleHealth", "stepTracking"],
      ["healthConnect", "stepTracking"],
    ] as const) {
      const result = tenantConfigSchema.safeParse({
        ...avihuTenant,
        nativeCapabilities: {
          ...avihuTenant.nativeCapabilities,
          [capability]: false,
        },
      });

      expect(result.success, capability).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toContainEqual(
          expect.objectContaining({
            path: ["featureDefaults", feature],
          })
        );
      }
    }
  });

  it("allows disabled native capabilities when the dependent JavaScript default is disabled", () => {
    expect(
      tenantConfigSchema.safeParse({
        ...avihuTenant,
        featureDefaults: {
          ...avihuTenant.featureDefaults,
          mediaCapture: false,
        },
        nativeCapabilities: {
          ...avihuTenant.nativeCapabilities,
          camera: false,
          photoLibrary: false,
        },
      }).success
    ).toBe(true);
  });

  it("owns shared and intentional feature colors in the Avihu semantic theme", () => {
    expect(avihuTenant).toMatchObject({
      theme: {
        colors: {
          primary: "#072723",
          background: "#F8F8F8",
          surface: "#ffffffff",
          diet: {
            primaryText: "#0B2A22",
            mint: "#E8F5EF",
          },
          steps: {
            aboveGoal: "#4ED167",
            ringGradientStart: "#072723",
          },
          graph: {
            gradientStart: "#9FFFA2",
          },
          scanner: {
            viewfinder: "#5BE29B",
          },
        },
      },
    });
  });
});
