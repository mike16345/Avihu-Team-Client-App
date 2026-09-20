import { describe, expect, it } from "vitest";
import { avihuTenant } from "../../../config/tenants/avihu";
import { getThemePreset } from "../../../config/tenants/themePresets";
import { renderTenantFiles } from "../renderTenantFiles";

describe("tenant folder rendering", () => {
  it("splits identity, theme, and feature contracts into focused files", () => {
    const files = renderTenantFiles(avihuTenant, getThemePreset("avihu"));
    expect(Object.keys(files).sort()).toEqual(["features.ts", "index.ts", "theme.ts"]);
    expect(files["index.ts"]).toContain('import { tenantTheme } from "./theme.ts"');
    expect(files["index.ts"]).toContain(
      'import { featureDefaults, nativeCapabilities } from "./features.ts"'
    );
    expect(files["theme.ts"]).toContain("createTenantTheme");
    expect(files["features.ts"]).toContain("satisfies TenantFeatureDefaults");
  });

  it("marks ignored local tenant modules as ESM without changing repository tenant files", () => {
    const repositoryFiles = renderTenantFiles(avihuTenant, getThemePreset("avihu"));
    const localFiles = renderTenantFiles(
      { ...avihuTenant, id: "test-tenant", slug: "test-tenant", kind: "local" },
      getThemePreset("avihu")
    );

    expect(repositoryFiles["package.json"]).toBeUndefined();
    expect(localFiles["package.json"]).toBe('{"type":"module"}\n');
  });
});
