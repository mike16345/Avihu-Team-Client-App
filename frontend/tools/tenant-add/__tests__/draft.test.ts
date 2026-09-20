import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { listTenantDrafts, readTenantDraft, removeTenantDraft, writeTenantDraft } from "../draft";

const temporaryRoots: string[] = [];

const createRoot = async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "tenant-draft-"));
  temporaryRoots.push(root);
  return root;
};

afterEach(async () => {
  await Promise.all(temporaryRoots.splice(0).map((root) => rm(root, { recursive: true })));
});

describe("tenant:add drafts", () => {
  it("atomically persists resumable non-secret answers in the ignored draft root", async () => {
    const root = await createRoot();
    await writeTenantDraft(root, {
      schemaVersion: 1,
      tenantId: "new-tenant",
      updatedAt: "2026-08-25T12:00:00.000Z",
      answers: {
        mode: "repository",
        id: "new-tenant",
        displayName: "New Tenant",
        expoOwner: "avihuteam",
        identifierBase: "com.avihuteam",
      },
    });

    await expect(readTenantDraft(root, "new-tenant")).resolves.toMatchObject({
      tenantId: "new-tenant",
      answers: { expoOwner: "avihuteam", identifierBase: "com.avihuteam" },
    });
    await expect(listTenantDrafts(root)).resolves.toHaveLength(1);
    expect(await readFile(path.join(root, "drafts", "new-tenant.json"), "utf8")).not.toMatch(
      /token|password|secret/iu
    );
  });

  it("removes a completed or explicitly discarded draft", async () => {
    const root = await createRoot();
    await writeTenantDraft(root, {
      schemaVersion: 1,
      tenantId: "new-tenant",
      updatedAt: "2026-08-25T12:00:00.000Z",
      answers: { mode: "repository", id: "new-tenant" },
    });

    await removeTenantDraft(root, "new-tenant");

    await expect(readTenantDraft(root, "new-tenant")).resolves.toBeNull();
  });
});
