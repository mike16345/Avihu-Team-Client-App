import { readFile } from "node:fs/promises";
import path from "node:path";
import { createTenantTheme, themeRecipeV1Schema } from "../../config/tenants/themeRecipe";
import { getThemePreset } from "../../config/tenants/themePresets";
import type { TenantThemeSelection } from "./types";

const PRESET_LABELS = {
  avihu: "Avihu",
  "ivory-orange-blue": "Ivory / Orange / Blue",
  "violet-amber": "Violet / Amber",
} as const;

export const loadThemeSelection = async (selection: TenantThemeSelection) => {
  if (selection.kind === "preset") {
    const recipe = getThemePreset(selection.presetId);
    createTenantTheme(recipe);
    return { recipe, sourceLabel: PRESET_LABELS[selection.presetId] };
  }
  if (path.extname(selection.path).toLowerCase() !== ".json") {
    throw new Error("Theme recipes must be JSON files");
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(await readFile(selection.path, "utf8"));
  } catch (error) {
    throw new Error(
      `Could not parse theme recipe ${selection.path}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
  const recipe = themeRecipeV1Schema.parse(parsed);
  createTenantTheme(recipe);
  return { recipe, sourceLabel: `JSON: ${path.basename(selection.path)}` };
};
