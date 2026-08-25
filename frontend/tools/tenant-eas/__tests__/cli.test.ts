import { describe, expect, it, vi } from "vitest";
import { avihuTenant } from "../../../config/tenants/avihu";
import { runTenantEasCli, type TenantEasCliDependencies } from "../cli";

const pendingTenant = {
  ...avihuTenant,
  id: "new-tenant",
  slug: "new-tenant",
  eas: { status: "pending" as const },
};
const identity = {
  owner: "acme",
  slug: "new-tenant",
  projectId: "11111111-1111-4111-8111-111111111111",
  updateUrl: "https://u.expo.dev/11111111-1111-4111-8111-111111111111",
};

const createDependencies = () => {
  let source = "pending source";
  return {
    dependencies: {
      argv: ["--tenant", "new-tenant"],
      getTenant: vi.fn().mockReturnValue(pendingTenant),
      collectSelection: vi.fn().mockResolvedValue({ kind: "link", projectId: identity.projectId }),
      resolveProject: vi.fn().mockResolvedValue(identity),
      readTenantIndex: vi.fn().mockImplementation(async () => source),
      writeTenantIndex: vi.fn().mockImplementation(async (_id, value) => {
        source = value;
      }),
      replaceTenantEasBlock: vi.fn().mockReturnValue("linked source"),
      runFastPreflight: vi.fn().mockResolvedValue(undefined),
      readRecovery: vi.fn().mockResolvedValue(null),
      writeRecovery: vi.fn().mockResolvedValue(undefined),
      removeRecovery: vi.fn().mockResolvedValue(undefined),
      writeOutput: vi.fn(),
    } satisfies TenantEasCliDependencies,
    getSource: () => source,
  };
};

describe("tenant:eas", () => {
  it("stores verified linked identity and runs preflight", async () => {
    const { dependencies, getSource } = createDependencies();
    expect(await runTenantEasCli(dependencies)).toBe(0);
    expect(dependencies.replaceTenantEasBlock).toHaveBeenCalledWith("pending source", {
      status: "linked",
      owner: "acme",
      projectId: identity.projectId,
      updateUrl: identity.updateUrl,
    });
    expect(dependencies.runFastPreflight).toHaveBeenCalledWith("new-tenant");
    expect(getSource()).toBe("linked source");
  });

  it("restores original bytes when post-edit validation fails", async () => {
    const { dependencies, getSource } = createDependencies();
    dependencies.runFastPreflight.mockRejectedValueOnce(new Error("preflight failed"));
    await expect(runTenantEasCli(dependencies)).rejects.toThrow(/preflight/u);
    expect(getSource()).toBe("pending source");
    expect(dependencies.writeRecovery).toHaveBeenCalledWith(identity, "new-tenant");
  });

  it("persists remote identity when a local edit fails before writing", async () => {
    const { dependencies } = createDependencies();
    dependencies.readTenantIndex.mockRejectedValueOnce(new Error("disk failed"));
    await expect(runTenantEasCli(dependencies)).rejects.toThrow(/disk/u);
    expect(dependencies.writeRecovery).toHaveBeenCalledWith(identity, "new-tenant");
  });

  it("resumes the exact recovered project without creating another remote project", async () => {
    const { dependencies } = createDependencies();
    dependencies.readRecovery.mockResolvedValueOnce({
      schemaVersion: 1,
      tenantId: "new-tenant",
      ...identity,
      createdAt: "2026-08-25T00:00:00.000Z",
    });
    expect(await runTenantEasCli(dependencies)).toBe(0);
    expect(dependencies.collectSelection).not.toHaveBeenCalled();
    expect(dependencies.resolveProject).toHaveBeenCalledWith(pendingTenant, {
      kind: "link",
      projectId: identity.projectId,
    });
    expect(dependencies.removeRecovery).toHaveBeenCalledWith("new-tenant");
  });
});
