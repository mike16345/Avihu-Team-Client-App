import { access, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { withIsolatedEasWorkspace } from "../workspace";

describe("isolated EAS workspace", () => {
  it("creates a minimal workspace, copies the icon, and always cleans up", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "eas-icon-"));
    const icon = path.join(root, "icon.png");
    await writeFile(icon, "icon");
    let workspace = "";
    try {
      await withIsolatedEasWorkspace(
        { displayName: "Acme", slug: "acme", owner: "acme", sourceIcon: icon },
        async (cwd) => {
          workspace = cwd;
          expect(JSON.parse(await readFile(path.join(cwd, "app.json"), "utf8"))).toMatchObject({
            expo: { name: "Acme", slug: "acme", owner: "acme", icon: "./icon.png" },
          });
          expect(await readFile(path.join(cwd, "icon.png"), "utf8")).toBe("icon");
        }
      );
      await expect(access(workspace)).rejects.toThrow();
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
