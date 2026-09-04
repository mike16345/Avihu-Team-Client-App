import { describe, expect, it } from "vitest";
import { avihuTenant } from "../../../config/tenants/avihu";
import { getThemePreset } from "../../../config/tenants/themePresets";
import { createTenantConfig, toExportName } from "../validation";

const answers = {
  mode: "local" as const,
  id: "test-tenant",
  displayName: "Test Tenant",
  themeSelection: { kind: "preset" as const, presetId: "violet-amber" as const },
  nativeCapabilities: { ...avihuTenant.nativeCapabilities },
};

describe("tenant:add validation", () => {
  it("creates isolated local identities and preserves all enabled feature defaults", () => {
    const tenant = createTenantConfig(answers, getThemePreset("violet-amber"), "1a2b3c");
    expect(tenant.environments.development.iosBundleIdentifier).toBe(
      "local.test.testtenant.t1a2b3c.development"
    );
    expect(tenant.assets.icon).toContain("assets/.local/test-tenant");
    expect(Object.values(tenant.featureDefaults).every(Boolean)).toBe(true);
    expect(tenant.theme.colors.primary).toBe("#5B21B6");
    expect(tenant.theme.colors.diet.primaryText).not.toBe(
      avihuTenant.theme.colors.diet.primaryText
    );
    expect(tenant.theme.colors.graph.line).toBe("#F59E0B");
  });

  it("accepts Avihu as an explicit preset while preserving its appearance", () => {
    expect(createTenantConfig(answers, getThemePreset("avihu"), "1a2b3c").theme).toEqual(
      avihuTenant.theme
    );
  });

  it("derives safe TypeScript export names", () => {
    expect(toExportName("test-tenant")).toBe("testTenantTenant");
  });
});
