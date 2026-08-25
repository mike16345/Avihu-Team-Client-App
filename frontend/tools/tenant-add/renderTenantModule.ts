import type { TenantConfig } from "../../config/tenants/types";
import { toExportName } from "./validation";

export const renderTenantModule = (tenant: TenantConfig): string => {
  const typeImport = tenant.kind === "local" ? "../types" : "./types";
  return [
    `import type { TenantConfig } from ${JSON.stringify(typeImport)};`,
    "",
    `export const ${toExportName(tenant.id)} = ${JSON.stringify(tenant, null, 2)} satisfies TenantConfig;`,
    "",
  ].join("\n");
};
