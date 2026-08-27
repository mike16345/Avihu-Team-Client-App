import path from "node:path";
import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import ts from "typescript";
import { describe, expect, it } from "vitest";

const requireModule = createRequire(import.meta.url);
const { resolveTenantAssetsDirectory } = requireModule("../../tools/metro/tenantAssets.cjs") as {
  resolveTenantAssetsDirectory: (
    root: string,
    tenantId: string,
    exists: (value: string) => boolean
  ) => string;
};
const { resolveWithTsConfigPaths } = requireModule(
  "@expo/cli/build/src/utils/tsconfig/resolveWithTsConfigPaths"
) as {
  resolveWithTsConfigPaths: (
    config: { paths: Record<string, string[]>; baseUrl: string; hasBaseUrl: boolean },
    request: { moduleName: string; originModulePath: string },
    resolve: (candidate: string) => string | null
  ) => string | null;
};

describe("Metro tenant asset selection", () => {
  it("resolves folder-based local tenants beneath the ignored asset root", () => {
    const root = "/project";
    const localIndex = path.join(root, "config/tenants/.local/test-tenant/index.ts");
    expect(resolveTenantAssetsDirectory(root, "test-tenant", (value) => value === localIndex)).toBe(
      path.join(root, "config/tenants/assets/.local/test-tenant/generated")
    );
  });

  it("does not let static TypeScript paths override runtime tenant assets", () => {
    const frontendRoot = path.resolve(import.meta.dirname, "../..");
    const tsconfig = ts.readConfigFile(path.join(frontendRoot, "tsconfig.json"), ts.sys.readFile)
      .config as { compilerOptions: { paths: Record<string, string[]> } };
    const resolved = resolveWithTsConfigPaths(
      {
        paths: tsconfig.compilerOptions.paths,
        baseUrl: frontendRoot,
        hasBaseUrl: true,
      },
      {
        moduleName: "tenant-assets/runtime-logo.png",
        originModulePath: path.join(frontendRoot, "src/screens/SplashScreen.tsx"),
      },
      (candidate) => (existsSync(candidate) ? candidate : null)
    );

    expect(resolved).toBeNull();
  });
});
