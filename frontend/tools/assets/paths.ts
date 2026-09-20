import path from "node:path";
import { fileURLToPath } from "node:url";
import { ASSET_OUTPUT_FILES, type AssetOutputName } from "./types";
import { getTenant } from "../../config/tenants/registry";

const DEFAULT_ASSETS_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../config/tenants/assets"
);
const TENANT_ID_PATTERN = /^[a-z][a-z0-9-]*$/;

export interface TenantAssetPaths {
  assetsRoot: string;
  tenantDirectory: string;
  sourceDirectory: string;
  sourceIcon: string;
  generatedDirectory: string;
  manifest: string;
  outputs: Record<AssetOutputName, string>;
}

export const getTenantAssetsRoot = () =>
  path.resolve(process.env.TENANT_ASSETS_ROOT ?? DEFAULT_ASSETS_ROOT);

export const getTenantAssetPaths = (
  tenantId: string,
  generatedDirectory?: string
): TenantAssetPaths => {
  if (!TENANT_ID_PATTERN.test(tenantId)) {
    throw new Error(`Invalid tenant ID "${tenantId}"`);
  }

  const overriddenRoot = process.env.TENANT_ASSETS_ROOT;
  const declaredIcon = getTenant(tenantId).assets.icon;
  const declaredTenantDirectory = path.dirname(
    path.dirname(path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..", declaredIcon))
  );
  const tenantDirectory = overriddenRoot
    ? path.join(path.resolve(overriddenRoot), tenantId)
    : declaredTenantDirectory;
  const assetsRoot = path.dirname(tenantDirectory);
  const resolvedGeneratedDirectory = generatedDirectory ?? path.join(tenantDirectory, "generated");
  const outputs = Object.fromEntries(
    Object.entries(ASSET_OUTPUT_FILES).map(([name, relativePath]) => [
      name,
      path.join(resolvedGeneratedDirectory, relativePath),
    ])
  ) as Record<AssetOutputName, string>;

  return {
    assetsRoot,
    tenantDirectory,
    sourceDirectory: path.join(tenantDirectory, "source"),
    sourceIcon: path.join(tenantDirectory, "source", "app-icon.png"),
    generatedDirectory: resolvedGeneratedDirectory,
    manifest: path.join(resolvedGeneratedDirectory, "manifest.json"),
    outputs,
  };
};

export const toManifestPath = (tenantDirectory: string, absolutePath: string) =>
  path.relative(tenantDirectory, absolutePath).split(path.sep).join("/");
