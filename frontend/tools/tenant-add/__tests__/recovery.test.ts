import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { readTenantRecovery, removeTenantRecovery, writeTenantRecovery } from "../recovery";

const recovery = {
  schemaVersion: 1 as const,
  tenantId: "new-tenant",
  owner: "acme",
  slug: "new-tenant",
  projectId: "11111111-1111-4111-8111-111111111111",
  updateUrl: "https://u.expo.dev/11111111-1111-4111-8111-111111111111",
  createdAt: "2026-08-25T00:00:00.000Z",
};

describe("tenant EAS recovery", () => {
  it("round-trips a strict non-secret record and removes it", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "tenant-recovery-"));
    try {
      await writeTenantRecovery(root, recovery);
      expect(await readTenantRecovery(root, recovery.tenantId)).toEqual(recovery);
      expect(JSON.stringify(recovery)).not.toMatch(/token|password|secret/iu);
      await removeTenantRecovery(root, recovery.tenantId);
      expect(await readTenantRecovery(root, recovery.tenantId)).toBeNull();
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("rejects traversal before filesystem access", async () => {
    await expect(readTenantRecovery("/tmp", "../escape")).rejects.toThrow(/tenant ID/u);
  });
});
