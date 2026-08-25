import type { ThemeRecipeV1 } from "../../config/tenants/themeRecipe";
import type { TenantConfig } from "../../config/tenants/types";
import { toExportName } from "./validation";

export const TENANT_SOURCE_FILES = ["index.ts", "theme.ts", "features.ts"] as const;
export type TenantSourceFile = (typeof TENANT_SOURCE_FILES)[number];

const renderTenantIndex = (tenant: TenantConfig) => {
  const {
    eas: _eas,
    theme: _theme,
    featureDefaults: _features,
    nativeCapabilities: _native,
    ...identity
  } = tenant;
  const typePath = tenant.kind === "local" ? "../../types" : "../types";
  return [
    `import type { TenantConfig, TenantEasConfig } from ${JSON.stringify(typePath)};`,
    'import { featureDefaults, nativeCapabilities } from "./features.ts";',
    'import { tenantTheme } from "./theme.ts";',
    "",
    "// tenant:eas:start",
    'const tenantEas = { status: "pending" } satisfies TenantEasConfig;',
    "// tenant:eas:end",
    "",
    `export const ${toExportName(tenant.id)} = {`,
    `  ...${JSON.stringify(identity, null, 2).replace(/\n/gu, "\n  ")},`,
    "  eas: tenantEas,",
    "  theme: tenantTheme,",
    "  featureDefaults,",
    "  nativeCapabilities,",
    "} satisfies TenantConfig;",
    "",
  ].join("\n");
};

const renderTenantTheme = (recipe: ThemeRecipeV1, kind: TenantConfig["kind"]) => {
  const recipePath = kind === "local" ? "../../themeRecipe.ts" : "../themeRecipe.ts";
  return [
    `import { createTenantTheme, type ThemeRecipeV1 } from ${JSON.stringify(recipePath)};`,
    "",
    `export const tenantThemeRecipe = ${JSON.stringify(recipe, null, 2)} satisfies ThemeRecipeV1;`,
    "export const tenantTheme = createTenantTheme(tenantThemeRecipe);",
    "",
  ].join("\n");
};

const renderTenantFeatures = (tenant: TenantConfig) => {
  const typePath = tenant.kind === "local" ? "../../types" : "../types";
  return [
    `import type { TenantFeatureDefaults, TenantNativeCapabilities } from ${JSON.stringify(typePath)};`,
    "",
    `export const featureDefaults = ${JSON.stringify(tenant.featureDefaults, null, 2)} satisfies TenantFeatureDefaults;`,
    `export const nativeCapabilities = ${JSON.stringify(tenant.nativeCapabilities, null, 2)} satisfies TenantNativeCapabilities;`,
    "",
  ].join("\n");
};

export const renderTenantFiles = (
  tenant: TenantConfig,
  recipe: ThemeRecipeV1
): Record<TenantSourceFile, string> => ({
  "index.ts": renderTenantIndex(tenant),
  "theme.ts": renderTenantTheme(recipe, tenant.kind),
  "features.ts": renderTenantFeatures(tenant),
});
