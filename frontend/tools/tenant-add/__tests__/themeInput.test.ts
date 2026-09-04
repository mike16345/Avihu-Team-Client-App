import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getThemePreset } from "../../../config/tenants/themePresets";
import { loadThemeSelection } from "../themeInput";

describe("tenant theme input", () => {
  it("loads a named preset without exposing mutable catalog state", async () => {
    const loaded = await loadThemeSelection({
      kind: "preset",
      presetId: "ivory-orange-blue",
    });
    expect(loaded.sourceLabel).toBe("Ivory / Orange / Blue");
    expect(loaded.recipe.foundation.primary).toBe("#174A7E");
  });

  it("accepts only strict versioned JSON recipes", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "theme-recipe-"));
    const recipePath = path.join(root, "theme.json");
    try {
      await writeFile(
        recipePath,
        JSON.stringify({ ...getThemePreset("violet-amber"), unknown: true })
      );
      await expect(loadThemeSelection({ kind: "recipe-file", path: recipePath })).rejects.toThrow(
        /unknown/u
      );
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
