import { describe, expect, it } from "vitest";
import { createTenantTheme, themeRecipeV1Schema } from "../tenants/themeRecipe";
import { THEME_PRESET_IDS, getThemePreset } from "../tenants/themePresets";
import { tenantThemeSchema } from "../tenants/theme";

describe("tenant theme recipes", () => {
  it("expands the preset catalog into complete immutable themes", () => {
    expect(THEME_PRESET_IDS).toEqual(["avihu", "ivory-orange-blue", "violet-amber"]);
    const recipe = getThemePreset("ivory-orange-blue");
    const first = createTenantTheme(recipe);
    expect(createTenantTheme(recipe)).toEqual(first);
    expect(tenantThemeSchema.parse(first)).toEqual(first);
    expect(first.colors.primary).toBe("#174A7E");
    expect(first.colors.accent).toBe("#E97824");
    expect(first.colors.diet.card).toBe("#FFF9ED");
    expect(first.colors.graph.line).toBe("#E97824");
    recipe.foundation.primary = "#000000";
    expect(getThemePreset("ivory-orange-blue").foundation.primary).toBe("#174A7E");
  });

  it("applies strict nested overrides", () => {
    const recipe = {
      ...getThemePreset("violet-amber"),
      overrides: { scanner: { viewfinder: "#21A179" } },
    };
    expect(createTenantTheme(recipe).colors.scanner.viewfinder).toBe("#21A179");
    expect(() =>
      themeRecipeV1Schema.parse({
        ...recipe,
        overrides: { scanner: { unknown: "#FFFFFF" } },
      })
    ).toThrow();
  });

  it("rejects unsupported versions and inaccessible foundation contrast", () => {
    const recipe = getThemePreset("violet-amber");
    expect(() => themeRecipeV1Schema.parse({ ...recipe, schemaVersion: 2 })).toThrow();
    expect(() =>
      themeRecipeV1Schema.parse({
        ...recipe,
        foundation: { ...recipe.foundation, primary: "#FFFFFF", onPrimary: "#FFFFFF" },
      })
    ).toThrow(/contrast/u);
  });
});
