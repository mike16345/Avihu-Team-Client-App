import { avihuTenant } from "./avihu";
import { themeRecipeV1Schema, type ThemeRecipeV1 } from "./themeRecipe";

export const THEME_PRESET_IDS = ["avihu", "ivory-orange-blue", "violet-amber"] as const;
export type ThemePresetId = (typeof THEME_PRESET_IDS)[number];

const presets = {
  avihu: {
    schemaVersion: 1,
    foundation: {
      primary: "#072723",
      onPrimary: "#F8F8F8",
      accent: "#0B5E37",
      onAccent: "#F8F8F8",
      background: "#F8F8F8",
      onBackground: "#101828",
    },
    overrides: avihuTenant.theme.colors,
  },
  "ivory-orange-blue": {
    schemaVersion: 1,
    foundation: {
      primary: "#174A7E",
      onPrimary: "#FFFFFF",
      accent: "#E97824",
      onAccent: "#17212B",
      background: "#FFF9ED",
      onBackground: "#17212B",
    },
  },
  "violet-amber": {
    schemaVersion: 1,
    foundation: {
      primary: "#5B21B6",
      onPrimary: "#FFFFFF",
      accent: "#F59E0B",
      onAccent: "#1F1300",
      background: "#FFF7ED",
      onBackground: "#2E1065",
    },
  },
} satisfies Record<ThemePresetId, ThemeRecipeV1>;

for (const preset of Object.values(presets)) themeRecipeV1Schema.parse(preset);

export const getThemePreset = (id: ThemePresetId): ThemeRecipeV1 => structuredClone(presets[id]);
