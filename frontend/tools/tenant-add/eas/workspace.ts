import { copyFile, mkdtemp, readFile, realpath, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

export interface EasWorkspaceInput {
  displayName: string;
  slug: string;
  owner?: string;
  sourceIcon?: string;
}

export const withIsolatedEasWorkspace = async <Result>(
  input: EasWorkspaceInput,
  callback: (workspace: string) => Promise<Result>
): Promise<Result> => {
  const temporaryRoot = await realpath(os.tmpdir());
  const workspace = await mkdtemp(path.join(temporaryRoot, "tenant-eas-"));
  try {
    await writeFile(
      path.join(workspace, "package.json"),
      `${JSON.stringify({ name: "tenant-eas-workspace", private: true }, null, 2)}\n`
    );
    const icon = input.sourceIcon ? "./icon.png" : undefined;
    await writeFile(
      path.join(workspace, "app.json"),
      `${JSON.stringify(
        {
          expo: {
            name: input.displayName,
            slug: input.slug,
            ...(input.owner ? { owner: input.owner } : {}),
            ...(icon ? { icon } : {}),
          },
        },
        null,
        2
      )}\n`
    );
    if (input.sourceIcon) {
      await readFile(input.sourceIcon);
      await copyFile(input.sourceIcon, path.join(workspace, "icon.png"));
    }
    return await callback(workspace);
  } finally {
    if (!workspace.startsWith(`${temporaryRoot}${path.sep}`)) {
      throw new Error("Refusing to clean an EAS workspace outside the temporary root");
    }
    await rm(workspace, { recursive: true, force: true });
  }
};
