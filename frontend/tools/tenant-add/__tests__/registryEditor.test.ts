import { describe, expect, it } from "vitest";
import { addRepositoryTenantToRegistry } from "../registryEditor";

const source = `import { avihuTenant } from "./avihu";
// tenant:add imports:start
// tenant:add imports:end
// tenant:add entries:start
const committedTenants = [avihuTenant];
// tenant:add entries:end
`;

describe("tenant registry editor", () => {
  it("changes only the marked import and entry regions", () => {
    const updated = addRepositoryTenantToRegistry(source, "new-brand");
    expect(updated).toContain('import { newBrandTenant } from "./new-brand";');
    expect(updated).toContain("[avihuTenant, newBrandTenant]");
    expect(() => addRepositoryTenantToRegistry(updated, "new-brand")).toThrow(/already/u);
  });
});
