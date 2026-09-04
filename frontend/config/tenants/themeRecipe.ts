import { z } from "zod";
import {
  tenantColorSchema,
  tenantThemeColorsSchema,
  tenantThemeSchema,
  type TenantTheme,
} from "./theme.ts";

const themeFoundationColorSchema = tenantColorSchema.refine(
  (value) => /^#[0-9A-Fa-f]{6}$/u.test(value),
  "Foundation colors must use six-digit hex values"
);

export const themeFoundationSchema = z
  .object({
    primary: themeFoundationColorSchema,
    onPrimary: themeFoundationColorSchema,
    accent: themeFoundationColorSchema,
    onAccent: themeFoundationColorSchema,
    background: themeFoundationColorSchema,
    onBackground: themeFoundationColorSchema,
  })
  .strict();

export const themeColorOverridesSchema = tenantThemeColorsSchema.deepPartial();

const hexLuminance = (color: string) => {
  if (!/^#[0-9A-Fa-f]{6}$/u.test(color)) return null;
  const channels = [1, 3, 5].map(
    (index) => Number.parseInt(color.slice(index, index + 2), 16) / 255
  );
  const linear = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  );
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
};

export const getContrastRatio = (foreground: string, background: string) => {
  const foregroundLuminance = hexLuminance(foreground);
  const backgroundLuminance = hexLuminance(background);
  if (foregroundLuminance === null || backgroundLuminance === null) return null;
  return (
    (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) /
    (Math.min(foregroundLuminance, backgroundLuminance) + 0.05)
  );
};

const validateContrastPair = (
  context: z.RefinementCtx,
  path: string,
  foreground: string,
  background: string
) => {
  const ratio = getContrastRatio(foreground, background);
  if (ratio !== null && ratio < 4.5) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: path.split("."),
      message: `${path} contrast must be at least 4.5:1`,
    });
  }
};

export const themeRecipeV1Schema = z
  .object({
    schemaVersion: z.literal(1),
    foundation: themeFoundationSchema,
    overrides: themeColorOverridesSchema.optional(),
  })
  .strict()
  .superRefine((recipe, context) => {
    validateContrastPair(
      context,
      "foundation.primary",
      recipe.foundation.onPrimary,
      recipe.foundation.primary
    );
    validateContrastPair(
      context,
      "foundation.accent",
      recipe.foundation.onAccent,
      recipe.foundation.accent
    );
    validateContrastPair(
      context,
      "foundation.background",
      recipe.foundation.onBackground,
      recipe.foundation.background
    );
  });

export type ThemeRecipeV1 = z.infer<typeof themeRecipeV1Schema>;
export type ThemeColorOverrides = z.infer<typeof themeColorOverridesSchema>;

const withAlpha = (color: string, alpha: string) => `${color}${alpha}`;

const getFoundationColor = (
  path: string[],
  foundation: ThemeRecipeV1["foundation"]
): string => {
  const key = path.at(-1) ?? "";
  const semanticPath = path.join(".").toLowerCase();

  const exactFoundationColors: Record<string, string> = {
    primary: foundation.primary,
    onPrimary: foundation.onPrimary,
    accent: foundation.accent,
    onAccent: foundation.onAccent,
    background: foundation.background,
    onBackground: foundation.onBackground,
  };
  if (path.length === 1 && exactFoundationColors[key] !== undefined) {
    return exactFoundationColors[key];
  }
  if (key === "level0" || semanticPath.includes("transparentbackground")) return "transparent";

  if (/onaccent|tooltiptext/u.test(semanticPath)) return foundation.onAccent;
  if (/onprimary/u.test(semanticPath)) return foundation.onPrimary;
  if (
    /^on/u.test(key.toLowerCase()) ||
    /paneltext|primarytext|consumedtext|dayheader|agendatext/u.test(semanticPath)
  ) {
    return foundation.onBackground;
  }

  if (
    /accent|success|warning|error|danger|info|positive|negative|mint|abovegoal|selected|dot|line|viewfinder|scanline|notification|indicator|gradientend/u.test(
      semanticPath
    )
  ) {
    return foundation.accent;
  }

  if (
    /overlay|shadow|scrim|backdrop|dim|modal|translucent|muted|subtle|soft|faint|border|divider|outline|hairline|baseline|target|track|today|placeholder|pressed/u.test(
      semanticPath
    )
  ) {
    return withAlpha(foundation.primary, "33");
  }

  if (/surface|background|card|panel|container|raised|disabled/u.test(semanticPath)) {
    return foundation.background;
  }

  if (/text|label|agreement/u.test(semanticPath)) return foundation.onBackground;
  if (/accent|warm|cool/u.test(semanticPath)) return foundation.accent;
  return foundation.primary;
};

const expandColorSchema = (
  schema: z.ZodTypeAny,
  foundation: ThemeRecipeV1["foundation"],
  path: string[] = []
): unknown => {
  if (schema instanceof z.ZodObject) {
    return Object.fromEntries(
      Object.entries(schema.shape).map(([key, childSchema]) => [
        key,
        expandColorSchema(childSchema as z.ZodTypeAny, foundation, [...path, key]),
      ])
    );
  }
  return getFoundationColor(path, foundation);
};

const createFoundationColors = (foundation: ThemeRecipeV1["foundation"]): TenantTheme["colors"] => {
  const { primary, onPrimary, accent, onAccent, background, onBackground } = foundation;
  const colors = tenantThemeColorsSchema.parse(expandColorSchema(tenantThemeColorsSchema, foundation));
  Object.assign(colors, {
    primary,
    onPrimary,
    accent,
    onAccent,
    background,
    onBackground,
    surface: background,
    onSurface: onBackground,
    selected: withAlpha(accent, "22"),
    pressed: withAlpha(primary, "12"),
  });
  Object.assign(colors.app, {
    textStrong: onBackground,
    textDefault: withAlpha(onBackground, "E6"),
    textMuted: withAlpha(onBackground, "B3"),
    textSubtle: withAlpha(onBackground, "80"),
    textSlate: withAlpha(onBackground, "CC"),
    textForm: onBackground,
    textPlaceholder: withAlpha(onBackground, "73"),
    textAgreement: withAlpha(onBackground, "C2"),
    surfaceRaised: background,
    surfacePanel: withAlpha(primary, "08"),
    surfaceSoft: withAlpha(primary, "0D"),
    surfaceCool: withAlpha(accent, "0D"),
    surfaceWarm: withAlpha(accent, "14"),
    borderSoft: withAlpha(primary, "24"),
    borderControl: withAlpha(primary, "33"),
    borderHandle: withAlpha(primary, "4D"),
    formBorder: withAlpha(primary, "52"),
    brandStrong: primary,
    brandAction: primary,
    brandSuccess: accent,
    brandPressed: withAlpha(primary, "D9"),
    articleLiked: withAlpha(accent, "1F"),
    notificationAccent: accent,
    graphIndicator: accent,
    shadowHairline: withAlpha(primary, "0D"),
    shadowSoft: withAlpha(primary, "14"),
    shadowMedium: withAlpha(primary, "1A"),
    shadowStrong: withAlpha(primary, "1F"),
    drawerOverlay: withAlpha(primary, "80"),
  });
  Object.assign(colors.diet, {
    primaryText: onBackground,
    secondaryText: withAlpha(onBackground, "B3"),
    tertiaryText: primary,
    card: background,
    cardSubtle: withAlpha(primary, "0D"),
    border: withAlpha(primary, "1A"),
    borderStrong: withAlpha(accent, "99"),
    mint: withAlpha(accent, "24"),
    mintStrong: withAlpha(accent, "14"),
    consumedBackground: withAlpha(accent, "29"),
    consumedBorder: withAlpha(accent, "66"),
    consumedText: onBackground,
  });
  Object.assign(colors.steps, {
    aboveGoalDark: primary,
    aboveGoal: accent,
    aboveGoalLight: withAlpha(accent, "4D"),
    belowGoalDark: withAlpha(primary, "D9"),
    belowGoal: withAlpha(primary, "B3"),
    belowGoalLight: withAlpha(primary, "4D"),
    ringTrack: withAlpha(primary, "24"),
    ringGradientStart: primary,
    ringGradientEnd: accent,
    selectedPill: withAlpha(primary, "14"),
  });
  Object.assign(colors.graph, {
    line: accent,
    lineSecondary: primary,
    gradientStart: accent,
    gradientEnd: primary,
    gradientStartTransparent: withAlpha(accent, "33"),
    gradientEndTransparent: withAlpha(primary, "0D"),
    dot: accent,
    dotBorder: background,
    tooltip: accent,
    tooltipText: onAccent,
    tooltipShadow: withAlpha(primary, "59"),
  });
  Object.assign(colors.calendar, {
    dayHeader: onBackground,
    today: withAlpha(primary, "1F"),
    agendaText: onBackground,
    selected: primary,
    dot: accent,
    dotSelected: primary,
  });
  Object.assign(colors.scanner, {
    background: onBackground,
    viewfinder: accent,
    scanLine: accent,
    panel: background,
    panelText: onBackground,
  });
  return tenantThemeColorsSchema.parse(colors);
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const mergeThemeColorOverrides = (
  base: TenantTheme["colors"],
  overrides: ThemeColorOverrides = {}
): TenantTheme["colors"] => {
  const merge = (
    left: Record<string, unknown>,
    right: Record<string, unknown>
  ): Record<string, unknown> =>
    Object.fromEntries(
      Object.entries(left).map(([key, value]) => {
        const override = right[key];
        if (override === undefined) return [key, value];
        if (isPlainObject(value) && isPlainObject(override)) return [key, merge(value, override)];
        return [key, override];
      })
    );
  return tenantThemeColorsSchema.parse(
    merge(base as Record<string, unknown>, overrides as Record<string, unknown>)
  );
};

export const createTenantTheme = (input: ThemeRecipeV1): TenantTheme => {
  const recipe = themeRecipeV1Schema.parse(input);
  return tenantThemeSchema.parse({
    colors: mergeThemeColorOverrides(createFoundationColors(recipe.foundation), recipe.overrides),
  });
};
