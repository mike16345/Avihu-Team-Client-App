import { describe, expect, it } from "vitest";

import { avihuTenant } from "../../../config/tenants/avihu";
import * as appThemeModule from "../useAppTheme";

type AppThemeFoundationModule = typeof appThemeModule & {
  createAppTheme?: (theme: typeof avihuTenant.theme) => {
    colors: typeof avihuTenant.theme.colors;
    fonts: Record<string, { fontFamily: string; fontWeight: string }>;
  };
};

const appThemeFoundation = appThemeModule as AppThemeFoundationModule;

describe("tenant runtime theme", () => {
  it("combines tenant-owned semantic colors with the existing Assistant font mapping", () => {
    const theme = appThemeFoundation.createAppTheme?.(avihuTenant.theme);

    expect(theme?.colors).toEqual(avihuTenant.theme.colors);
    expect(theme?.colors).toMatchObject({
      tertiary: "#ffa4a8",
      onTertiary: "#7f1d1d",
      tertiaryContainer: "#7f1d1d",
      onTertiaryContainer: "#ffccd2",
      surfaceDisabled: "rgba(229, 231, 235, 0.12)",
      onSurfaceDisabled: "rgba(229, 231, 235, 0.38)",
    });
    expect(theme?.fonts.regular).toEqual({
      fontFamily: "Assistant",
      fontWeight: "normal",
    });
  });
});
