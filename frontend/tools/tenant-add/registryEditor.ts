import { toExportName } from "./validation";

const IMPORT_START = "// tenant:add imports:start";
const IMPORT_END = "// tenant:add imports:end";
const ENTRY_START = "// tenant:add entries:start";
const ENTRY_END = "// tenant:add entries:end";

const insertBefore = (source: string, marker: string, value: string) => {
  const index = source.indexOf(marker);
  if (index < 0) throw new Error(`Registry marker is missing: ${marker}`);
  return `${source.slice(0, index)}${value}\n${source.slice(index)}`;
};

export const addRepositoryTenantToRegistry = (source: string, tenantId: string): string => {
  const exportName = toExportName(tenantId);
  if (source.includes(`{ ${exportName} }`) || source.includes(`, ${exportName}]`)) {
    throw new Error(`Tenant ${tenantId} is already registered`);
  }
  if (!source.includes(IMPORT_START) || !source.includes(ENTRY_START)) {
    throw new Error("Tenant registry marker boundaries are missing");
  }
  let updated = insertBefore(source, IMPORT_END, `import { ${exportName} } from "./${tenantId}";`);
  const entryPattern = /(const committedTenants = \[)([^\]]*)(\];)/u;
  if (!entryPattern.test(updated) || !updated.includes(ENTRY_END)) {
    throw new Error("Committed tenant entry list is malformed");
  }
  updated = updated.replace(
    entryPattern,
    (_, start: string, entries: string, end: string) =>
      `${start}${entries.trim()}${entries.trim() ? ", " : ""}${exportName}${end}`
  );
  return updated;
};
