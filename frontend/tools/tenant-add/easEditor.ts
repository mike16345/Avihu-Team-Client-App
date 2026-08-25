import { tenantEasConfigSchema } from "../../config/tenants/schema";
import type { TenantEasConfig } from "../../config/tenants/types";

const START = "// tenant:eas:start";
const END = "// tenant:eas:end";

const renderEas = (eas: TenantEasConfig) => {
  const parsed = tenantEasConfigSchema.parse(eas);
  if (parsed.status === "pending") {
    return 'const tenantEas = { status: "pending" } satisfies TenantEasConfig;';
  }
  return [
    "const tenantEas = {",
    '  status: "linked",',
    `  owner: ${JSON.stringify(parsed.owner)},`,
    `  projectId: ${JSON.stringify(parsed.projectId)},`,
    `  updateUrl: ${JSON.stringify(parsed.updateUrl)},`,
    "} satisfies TenantEasConfig;",
  ].join("\n");
};

export const replaceTenantEasBlock = (source: string, eas: TenantEasConfig): string => {
  if (source.split(START).length !== 2 || source.split(END).length !== 2) {
    throw new Error("Generated tenant EAS marker boundaries are missing or duplicated");
  }
  const start = source.indexOf(START);
  const end = source.indexOf(END);
  if (end <= start) throw new Error("Generated tenant EAS marker boundaries are malformed");
  const current = source.slice(start, end);
  if (/status:\s*["']linked["']/u.test(current)) {
    throw new Error("Tenant EAS setup is already linked");
  }
  return `${source.slice(0, start)}${START}\n${renderEas(eas)}\n${source.slice(end)}`;
};
