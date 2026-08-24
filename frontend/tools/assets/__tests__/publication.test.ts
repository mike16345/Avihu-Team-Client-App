import { access, mkdtemp, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  getGeneratedBackupDirectory,
  publishGeneratedDirectory,
  recoverGeneratedDirectory,
  type PublicationFileSystem,
} from "../publication";

describe.sequential("generated asset publication", () => {
  let root: string;
  let temporaryDirectory: string;
  let targetDirectory: string;

  beforeEach(async () => {
    root = await mkdtemp(path.join(tmpdir(), "tenant-assets-publication-"));
    temporaryDirectory = path.join(root, "temporary");
    targetDirectory = path.join(root, "generated");
    await mkdir(temporaryDirectory);
    await mkdir(targetDirectory);
    await writeFile(path.join(temporaryDirectory, "version.txt"), "new", "utf8");
    await writeFile(path.join(targetDirectory, "version.txt"), "old", "utf8");
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it("restores the prior directory when temporary publication fails", async () => {
    const fileSystem: PublicationFileSystem = {
      access,
      rm,
      rename: async (from, to) => {
        if (from === temporaryDirectory && to === targetDirectory) {
          throw new Error("injected publication failure");
        }
        await rename(from, to);
      },
    };

    await expect(
      publishGeneratedDirectory(temporaryDirectory, targetDirectory, fileSystem)
    ).rejects.toThrow("injected publication failure");

    expect(await readFile(path.join(targetDirectory, "version.txt"), "utf8")).toBe("old");
    expect(await readFile(path.join(temporaryDirectory, "version.txt"), "utf8")).toBe("new");
    await expect(access(getGeneratedBackupDirectory(targetDirectory))).rejects.toThrow();
  });

  it("keeps a successful publication when backup cleanup fails", async () => {
    const backupDirectory = getGeneratedBackupDirectory(targetDirectory);
    const fileSystem: PublicationFileSystem = {
      access,
      rename,
      rm: async (target, options) => {
        if (target === backupDirectory) throw new Error("injected cleanup failure");
        await rm(target, options);
      },
    };

    await expect(
      publishGeneratedDirectory(temporaryDirectory, targetDirectory, fileSystem)
    ).resolves.toBeUndefined();

    expect(await readFile(path.join(targetDirectory, "version.txt"), "utf8")).toBe("new");
    expect(await readFile(path.join(backupDirectory, "version.txt"), "utf8")).toBe("old");
  });

  it("recovers an interrupted backup when the target is missing", async () => {
    const backupDirectory = getGeneratedBackupDirectory(targetDirectory);
    await rename(targetDirectory, backupDirectory);

    await recoverGeneratedDirectory(targetDirectory);

    expect(await readFile(path.join(targetDirectory, "version.txt"), "utf8")).toBe("old");
    await expect(access(backupDirectory)).rejects.toThrow();
  });
});
