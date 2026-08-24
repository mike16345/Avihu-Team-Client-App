import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { analyzeExpoExport } from "../checks/artifacts";

const roots: string[] = [];
afterEach(async () => Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true }))));

describe("Expo Atlas export analysis", () => {
  it("requires metadata coverage and a nonempty corresponding source map per platform", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "preflight-atlas-"));
    roots.push(root);
    await mkdir(path.join(root, "_expo", "static", "js", "android"), { recursive: true });
    const bundle = "_expo/static/js/android/index.js";
    await writeFile(path.join(root, bundle), "bundle");
    await writeFile(path.join(root, `${bundle}.map`), "map");
    await writeFile(
      path.join(root, "metadata.json"),
      JSON.stringify({
        version: 0,
        bundler: "metro",
        fileMetadata: { android: { bundle, assets: [] } },
      })
    );

    expect(await analyzeExpoExport(root, ["android"])).toMatchObject({
      valid: true,
      details: [expect.stringContaining("android: bundle")],
    });
    expect(await analyzeExpoExport(root, ["android", "ios"])).toMatchObject({
      valid: false,
      errors: [expect.stringContaining("ios bundle mapping")],
    });
    await writeFile(path.join(root, `${bundle}.map`), "");
    expect(await analyzeExpoExport(root, ["android"])).toMatchObject({ valid: false });
  });
});
