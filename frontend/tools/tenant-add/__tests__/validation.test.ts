import { describe, expect, it } from "vitest";
import { avihuTenant } from "../../../config/tenants/avihu";
import { createTenantConfig, toExportName } from "../validation";

const answers = {
  mode: "local" as const,
  id: "test-tenant",
  displayName: "Test Tenant",
  primaryColor: "#5B21B6",
  onPrimaryColor: "#FFFFFF",
  accentColor: "#F59E0B",
  onAccentColor: "#1F1300",
  backgroundColor: "#FFF7ED",
  onBackgroundColor: "#2E1065",
  nativeCapabilities: { ...avihuTenant.nativeCapabilities },
};

describe("tenant:add validation", () => {
  it("creates isolated local identities and preserves all enabled feature defaults", () => {
    const tenant = createTenantConfig(answers, "1a2b3c");
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

  it("rejects low-contrast and Avihu-equivalent core palettes", () => {
    expect(() => createTenantConfig({ ...answers, onPrimaryColor: answers.primaryColor })).toThrow(
      /contrast/u
    );
    expect(() =>
      createTenantConfig({
        ...answers,
        primaryColor: avihuTenant.theme.colors.primary,
        onPrimaryColor: avihuTenant.theme.colors.onPrimary,
        accentColor: avihuTenant.theme.colors.accent,
        onAccentColor: "#000000",
      })
    ).toThrow(/visibly different/u);
  });

  it("derives safe TypeScript export names", () => {
    expect(toExportName("test-tenant")).toBe("testTenantTenant");
  });
});
