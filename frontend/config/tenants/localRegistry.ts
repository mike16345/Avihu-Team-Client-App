import { createRequire } from "node:module";
import { existsSync, lstatSync, readdirSync, realpathSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { tenantConfigSchema } from "./schema";
import type { TenantConfig } from "./types";

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
    .filter((name) => name.endsWith(".ts"))
    .map((name) => {
      const filePath = path.join(root, name);
      const metadata = lstatSync(filePath);
      if (metadata.isSymbolicLink() || !metadata.isFile()) {
        throw new Error(`Local tenant module must be a regular file: ${name}`);
      }
      const parsed = tenantConfigSchema.parse(readTenantExport(filePath));
      if (parsed.kind !== "local") {
        throw new Error(`Local tenant module ${name} must declare kind: "local"`);
      }
      return parsed;
    })
    .sort((left, right) => left.id.localeCompare(right.id));
};
