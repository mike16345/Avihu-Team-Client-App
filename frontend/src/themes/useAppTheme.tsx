import type { TenantTheme } from "../../config/tenants/theme";
import { createContext, ReactNode, useContext, useMemo } from "react";

const APP_FONTS = {
  regular: {
    fontFamily: "Assistant",
    fontWeight: "normal",
  },
  medium: {
    fontFamily: "Assistant",
    fontWeight: "normal",
  },
  light: {
    fontFamily: "Assistant",
    fontWeight: "normal",
  },
  thin: {
    fontFamily: "Assistant",
    fontWeight: "normal",
  },
} as const;

export const createAppTheme = (theme: TenantTheme) => ({
  fonts: APP_FONTS,
  colors: theme.colors,
});

export type AppTheme = ReturnType<typeof createAppTheme>;

type ThemeContextType = {
  theme: AppTheme;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ theme: TenantTheme; children: ReactNode }> = ({
  theme: tenantTheme,
  children,
}) => {
  const theme = useMemo(() => createAppTheme(tenantTheme), [tenantTheme]);

  return <ThemeContext.Provider value={{ theme }}>{children}</ThemeContext.Provider>;
};

export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }
  return context;
};
