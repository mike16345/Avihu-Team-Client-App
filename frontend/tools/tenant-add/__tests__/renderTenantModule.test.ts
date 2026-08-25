import { describe, expect, it } from "vitest";
import { avihuTenant } from "../../../config/tenants/avihu";
import { renderTenantModule } from "../renderTenantModule";
import { createTenantConfig } from "../validation";

describe("tenant module rendering", () => {
  it("renders a typed local module with feature, theme, and native contracts", () => {
    const tenant = createTenantConfig(
      {
        mode: "local",
        id: "test-tenant",
        displayName: "Test Tenant",
        primaryColor: "#5B21B6",
        onPrimaryColor: "#FFFFFF",
        accentColor: "#F59E0B",
        onAccentColor: "#1F1300",
        backgroundColor: "#FFF7ED",
        onBackgroundColor: "#2E1065",
        nativeCapabilities: avihuTenant.nativeCapabilities,
      },
      "a1b2c3"
    );
    const source = renderTenantModule(tenant);
    expect(source).toContain('import type { TenantConfig } from "../types"');
    expect(source).toContain("export const testTenantTenant");
    expect(source).toContain("satisfies TenantConfig");
    expect(source).toContain('"featureDefaults"');
    expect(source).toContain('"nativeCapabilities"');
    expect(source).toContain('"theme"');
  });
});
