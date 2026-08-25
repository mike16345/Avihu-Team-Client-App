import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { avihuTenant } from "../../../config/tenants/avihu";
import type { TenantAddResult } from "../types";
import { publishStagedTenant } from "../scaffold";

const roots: string[] = [];

afterEach(async () => {
  const { rm } = await import("node:fs/promises");
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

const createStagedResult = async (): Promise<{ root: string; result: TenantAddResult }> => {
  const root = await mkdtemp(path.join(os.tmpdir(), "tenant-publish-"));
  roots.push(root);
  const stagingRoot = path.join(root, ".tenant-add/staging/new-tenant-abc");
  const stagedModulePath = path.join(stagingRoot, "config/tenants/new-tenant");
  const stagedAssetDirectory = path.join(stagingRoot, "config/tenants/assets/new-tenant");
  await mkdir(stagedModulePath, { recursive: true });
  await mkdir(stagedAssetDirectory, { recursive: true });
  await mkdir(path.join(root, "config/tenants"), { recursive: true });
  await writeFile(path.join(stagedModulePath, "index.ts"), "staged tenant\n");
  await writeFile(path.join(stagedAssetDirectory, "asset.txt"), "staged asset\n");
  await writeFile(
    path.join(root, "config/tenants/registry.ts"),
    [
      '// tenant:add imports:start',
      '// tenant:add imports:end',
      '',
      '// tenant:add entries:start',
      'const committedTenants = [avihuTenant];',
      '// tenant:add entries:end',
      '',
    ].join("\n")
  );
  return {
    root,
    result: {
      tenant: { ...avihuTenant, id: "new-tenant", slug: "new-tenant" },
      modulePath: path.join(root, "config/tenants/new-tenant"),
      assetDirectory: path.join(root, "config/tenants/assets/new-tenant"),
      stagingRoot,
      stagedModulePath,
      stagedAssetDirectory,
      logoSource: "fallback",
      launchCommand: "launch",
    },
  };
};

describe("tenant staging publication", () => {
  it("does not expose staged files before publication", async () => {
    const { result } = await createStagedResult();
    await expect(readFile(result.modulePath, "utf8")).rejects.toThrow();
    await expect(readFile(path.join(result.assetDirectory, "asset.txt"), "utf8")).rejects.toThrow();
  });

  it("rolls back published files while preserving a concurrent registry sentinel", async () => {
    const { root, result } = await createStagedResult();
    const registryPath = path.join(root, "config/tenants/registry.ts");
    await expect(
      publishStagedTenant(result, root, async () => {
        await writeFile(registryPath, `${await readFile(registryPath, "utf8")}\n// sentinel\n`);
        throw new Error("preflight failed");
      })
    ).rejects.toThrow(/preflight/u);

    const registry = await readFile(registryPath, "utf8");
    expect(registry).toContain("// sentinel");
    expect(registry).not.toContain("newTenantTenant");
    await expect(readFile(result.modulePath, "utf8")).rejects.toThrow();
    await expect(readFile(path.join(result.assetDirectory, "asset.txt"), "utf8")).rejects.toThrow();
  });
});
