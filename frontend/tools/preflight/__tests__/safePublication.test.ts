import { mkdir, mkdtemp, readFile, rename, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { publishPreflightFile } from "../safePublication";

const roots: string[] = [];
afterEach(async () => Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true }))));

const fixture = async () => {
  const root = await mkdtemp(path.join(tmpdir(), "preflight-publish-"));
  const external = await mkdtemp(path.join(tmpdir(), "preflight-external-"));
  roots.push(root, external);
  return { root, external };
};

describe("safe preflight publication", () => {
  it("rejects symbolic publication roots and run directories", async () => {
    const first = await fixture();
    await symlink(first.external, path.join(first.root, ".preflight"), "dir");
    await expect(
      publishPreflightFile(first.root, path.join(first.root, ".preflight", "report.json"), "x")
    ).rejects.toThrow(/symbolic/u);

    const second = await fixture();
    await mkdir(path.join(second.root, ".preflight"));
    await symlink(second.external, path.join(second.root, ".preflight", "run"), "dir");
    await expect(
      publishPreflightFile(
        second.root,
        path.join(second.root, ".preflight", "run", "report.json"),
        "x"
      )
    ).rejects.toThrow(/real directory/u);
  });

  it("atomically replaces a final-file symlink without writing through it", async () => {
    const { root, external } = await fixture();
    const target = path.join(root, ".preflight", "report.json");
    const outside = path.join(external, "outside.json");
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(outside, "outside");
    await symlink(outside, target);
    await publishPreflightFile(root, target, "safe");
    expect(await readFile(target, "utf8")).toBe("safe");
    expect(await readFile(outside, "utf8")).toBe("outside");
  });

  it("detects a directory swap before atomic publication", async () => {
    const { root, external } = await fixture();
    const run = path.join(root, ".preflight", "run");
    const moved = path.join(root, ".preflight", "moved");
    const target = path.join(run, "report.json");
    await expect(
      publishPreflightFile(root, target, "safe", {
        beforeRename: async () => {
          await rename(run, moved);
          await symlink(external, run, "dir");
        },
      })
    ).rejects.toThrow(/changed/u);
    await expect(readFile(path.join(external, "report.json"), "utf8")).rejects.toThrow();
  });
});
