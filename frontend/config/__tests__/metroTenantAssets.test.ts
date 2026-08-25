import path from "node:path";
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const requireModule = createRequire(import.meta.url);
const { resolveTenantAssetsDirectory } = requireModule("../../tools/metro/tenantAssets.cjs") as {
  resolveTenantAssetsDirectory: (
    root: string,
    tenantId: string,
    exists: (value: string) => boolean
  ) => string;
};

describe("Metro tenant asset selection", () => {
  it("resolves folder-based local tenants beneath the ignored asset root", () => {
    const root = "/project";
    const localIndex = path.join(root, "config/tenants/.local/test-tenant/index.ts");
    expect(resolveTenantAssetsDirectory(root, "test-tenant", (value) => value === localIndex)).toBe(
      path.join(root, "config/tenants/assets/.local/test-tenant/generated")
    );
  });
});
