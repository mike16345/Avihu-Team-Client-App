import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { resolveExpoProjectEnvironment } from "../projectEnv";

const roots: string[] = [];

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("preflight project environment", () => {
  it("loads .env.local like Expo while preserving explicit process values", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "preflight-env-"));
    roots.push(root);
    await writeFile(
      path.join(root, ".env.local"),
      "EXPO_PUBLIC_SERVER=https://local.example\nEXPO_PUBLIC_MODE=local\n",
      "utf8"
    );

    expect(
      resolveExpoProjectEnvironment(root, {
        EXPO_PUBLIC_MODE: "explicit",
      })
    ).toMatchObject({
      EXPO_PUBLIC_SERVER: "https://local.example",
      EXPO_PUBLIC_MODE: "explicit",
    });
  });
});
