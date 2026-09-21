import { describe, expect, it } from "vitest";
import { replaceTenantEasBlock } from "../easEditor";

const source = `before
// tenant:eas:start
const tenantEas = { status: "pending" } satisfies TenantEasConfig;
// tenant:eas:end
after
`;

describe("generated tenant EAS editor", () => {
  it("changes only the marked pending block", () => {
    const updated = replaceTenantEasBlock(source, {
      status: "linked",
      owner: "acme",
      projectId: "11111111-1111-4111-8111-111111111111",
      updateUrl: "https://u.expo.dev/11111111-1111-4111-8111-111111111111",
    });
    expect(updated.startsWith("before\n")).toBe(true);
    expect(updated.endsWith("after\n")).toBe(true);
    expect(updated).toContain('owner: "acme"');
    expect(() => replaceTenantEasBlock(updated, { status: "pending" })).toThrow(/already linked/u);
  });

  it("rejects missing or duplicate marker boundaries", () => {
    expect(() => replaceTenantEasBlock("unmarked", { status: "pending" })).toThrow(/marker/u);
    expect(() => replaceTenantEasBlock(`${source}${source}`, { status: "pending" })).toThrow(
      /marker/u
    );
  });
});
