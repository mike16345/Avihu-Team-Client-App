import { createRequire } from "node:module";
import { existsSync, lstatSync, readdirSync, realpathSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { tenantConfigSchema } from "./schema";
import type { TenantConfig } from "./types";

export const TENANT_SOURCE_FILES = ["index.ts", "theme.ts", "features.ts"] as const;

const requireModule = createRequire(import.meta.url);
export const DEFAULT_LOCAL_TENANT_ROOT = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  ".local"
);

const readTenantExport = (filePath: string): unknown => {
  const loaded = requireModule(filePath) as Record<string, unknown>;
  const exports = Object.entries(loaded).filter(([name]) => name !== "__esModule");
  if (exports.length !== 1) {
    throw new Error(`${path.basename(filePath)} must export exactly one tenant object`);
  }
  return exports[0][1];
};

export const loadLocalTenants = (localRoot: string = DEFAULT_LOCAL_TENANT_ROOT): TenantConfig[] => {
  if (!existsSync(localRoot)) return [];

  const root = realpathSync(localRoot);
  return readdirSync(root)
    .map((name) => {
      const tenantDirectory = path.join(root, name);
      const directoryMetadata = lstatSync(tenantDirectory);
      if (directoryMetadata.isSymbolicLink() || !directoryMetadata.isDirectory()) {
        throw new Error(`Local tenant must be a regular directory: ${name}`);
      }
      for (const fileName of TENANT_SOURCE_FILES) {
        const filePath = path.join(tenantDirectory, fileName);
        if (!existsSync(filePath))
          throw new Error(`Local tenant file is missing: ${name}/${fileName}`);
        const metadata = lstatSync(filePath);
        if (metadata.isSymbolicLink() || !metadata.isFile()) {
          throw new Error(`Local tenant file must be regular: ${name}/${fileName}`);
        }
      }
      const filePath = path.join(tenantDirectory, "index.ts");
      const parsed = tenantConfigSchema.parse(readTenantExport(filePath));
      if (parsed.kind !== "local") {
        throw new Error(`Local tenant module ${name} must declare kind: "local"`);
      }
      if (parsed.id !== name)
        throw new Error(`Local tenant directory ${name} must match tenant ID ${parsed.id}`);
      return parsed;
    })
    .sort((left, right) => left.id.localeCompare(right.id));
};
