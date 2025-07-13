import { createContext, ReactNode, useContext, useState } from "react";
import {
  MD3DarkTheme as DefaultDarkTheme,
} from "react-native-paper";



export const defaultTheme = {
  ...DefaultDarkTheme,
  fonts: {
    ...DefaultDarkTheme.fonts,
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
  },
  colors: {
    primary: "#072723",
    onPrimary: "#F8F8F8",
    secondary: "#EFF1F5",
    onSecondary: "#F8F8F8",
    success: "#17B26A",
    successContainer: "#EDFFEB",
    error: "#F04438",
    errorContainer: "#F8F8F8",
    background: "#F8F8F8",
    shadow: "#072723",
    primaryContainer: "#065f46",
    onPrimaryContainer: "#a7f3d0",
     secondaryContainer: "#25262A",
    onSecondaryContainer: "#e5e7eb", 
     tertiary: "#ffa4a8",
    onTertiary: "#7f1d1d",
    tertiaryContainer: "#7f1d1d",
    onTertiaryContainer: "#ffccd2", 
   info: "#17a2b8",
    onInfo: "#0c5460",
    infoContainer: "#0c5460",
    onInfoContainer: "#d1ecf1", 
     onSuccess: "#155724", 
     onSuccessContainer: "#d4edda", 
     warning: "#ffc107",
    onWarning: "#856404",
    warningContainer: "#F8F8F8",
    onWarningContainer: "#fff3cd", 
    onError: "#F8F8F8",
   onErrorContainer: "#ffd6d6",
    onBackground: "#f8f9fa",
    surface: "#1f2937",
    onSurface: "#e5e7eb",
    surfaceVariant: "#4b5563",
    onSurfaceVariant: "#d1d5db",
    outline: "#e5e7eb",
    outlineVariant: "#4b5563",
    scrim: "#000000",
    inverseSurface: "#e5e7eb",
    inverseOnSurface: "#1f2937",
    inversePrimary: "#10b981",
    elevation: {
      level0: "transparent",
      level1: "#1f2937",
      level2: "#374151",
      level3: "#4b5563",
      level4: "#6b7280",
      level5: "#9ca3af",
    },
    surfaceDisabled: "rgba(229, 231, 235, 0.12)",
    onSurfaceDisabled: "rgba(229, 231, 235, 0.38)",
    backdrop: "rgba(31, 41, 55, 0.4)",
  },
}; 

type ThemeContextType = {
  theme: typeof defaultTheme;
  setTheme: (theme: typeof defaultTheme) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState(defaultTheme);

  /* useEffect(() => {
    const listener = Appearance.addChangeListener(({ colorScheme }) => {
      setTheme(DarkTheme);
    });

    return () => {
      listener.remove();
    };
  }, []); */

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};

/* const getPreferredTheme = () => (Appearance.getColorScheme() === "light" ? LightTheme : DarkTheme); */

export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }
  return context;
};
