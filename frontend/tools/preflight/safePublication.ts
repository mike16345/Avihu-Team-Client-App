import { constants } from "node:fs";
import { lstat, mkdir, open, realpath, rename, unlink } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const isInside = (root: string, target: string) =>
  target === root || target.startsWith(`${root}${path.sep}`);

const assertDirectory = async (directory: string, parent: string) => {
  const info = await lstat(directory);
  if (!info.isDirectory() || info.isSymbolicLink()) {
    throw new Error("Preflight publication directory must be a real directory");
  }
  const canonical = await realpath(directory);
  if (!isInside(parent, canonical)) {
    throw new Error("Preflight publication directory resolves outside the project root");
  }
  return { canonical, dev: info.dev, ino: info.ino };
};

export interface PublicationHooks {
  beforeRename?: () => Promise<void> | void;
}

export const publishPreflightFile = async (
  projectRoot: string,
  target: string,
  contents: string,
  hooks: PublicationHooks = {}
) => {
  const canonicalProject = await realpath(projectRoot);
  const absoluteTarget = path.resolve(target);
  const root = path.join(projectRoot, ".preflight");
  if (!isInside(path.resolve(root), absoluteTarget)) {
    throw new Error("Preflight output must be inside the project's .preflight directory");
  }

  try {
    const existingRoot = await lstat(root);
    if (existingRoot.isSymbolicLink()) {
      throw new Error("Preflight publication root cannot be a symbolic link");
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  await mkdir(path.dirname(absoluteTarget), { recursive: true, mode: 0o700 });
  const rootState = await assertDirectory(root, canonicalProject);
  const directoryState = await assertDirectory(path.dirname(absoluteTarget), rootState.canonical);
  const temporary = path.join(path.dirname(absoluteTarget), `.${randomUUID()}.tmp`);
  const noFollow = "O_NOFOLLOW" in constants ? constants.O_NOFOLLOW : 0;
  const handle = await open(
    temporary,
    constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY | noFollow,
    0o600
  );
  try {
    await handle.writeFile(contents, "utf8");
    await handle.sync();
  } finally {
    await handle.close();
  }

  try {
    await hooks.beforeRename?.();
    const currentRoot = await lstat(root);
    const currentDirectory = await lstat(path.dirname(absoluteTarget));
    if (
      currentRoot.dev !== rootState.dev ||
      currentRoot.ino !== rootState.ino ||
      currentDirectory.dev !== directoryState.dev ||
      currentDirectory.ino !== directoryState.ino ||
      currentRoot.isSymbolicLink() ||
      currentDirectory.isSymbolicLink()
    ) {
      throw new Error("Preflight publication directory changed during publication");
    }
    await rename(temporary, absoluteTarget);
    const published = await lstat(absoluteTarget);
    if (!published.isFile() || published.isSymbolicLink()) {
      throw new Error("Published preflight output is not a regular file");
    }
  } catch (error) {
    await unlink(temporary).catch(() => undefined);
    throw error;
  }

  return absoluteTarget;
};
