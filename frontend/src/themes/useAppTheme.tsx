import { useEffect, useMemo, useState } from "react";
import { Appearance } from "react-native";
import { useTheme } from "react-native-paper";
import {
  MD3DarkTheme as DefaultDarkTheme,
  MD3LightTheme as DefaultLightTheme,
} from "react-native-paper";

export const LightTheme = {
  ...DefaultLightTheme,
  colors: {
    ...DefaultLightTheme.colors,
    primary: "#10b981",
    onPrimary: "#ffffff",
    primaryContainer: "#a7f3d0",
    onPrimaryContainer: "#064e3b",
    secondary: "#333333",
    onSecondary: "#ffffff",
    secondaryContainer: "#d1d5db",
    onSecondaryContainer: "#1f2937",
    tertiary: "#ffa4a8",
    onTertiary: "#ffffff",
    tertiaryContainer: "#ffccd2",
    onTertiaryContainer: "#7f1d1d",
    info: "#17a2b8",
    onInfo: "#ffffff",
    infoContainer: "#d1ecf1",
    onInfoContainer: "#0c5460",
    success: "#28a745",
    onSuccess: "#ffffff",
    successContainer: "#d4edda",
    onSuccessContainer: "#155724",
    warning: "#ffc107",
    onWarning: "#212529",
    warningContainer: "#fff3cd",
    onWarningContainer: "#856404",
    error: "#f5365c",
    onError: "#ffffff",
    errorContainer: "#ffd6d6",
    onErrorContainer: "#7f0000",
    background: "#f8f9fa",
    onBackground: "#1f2937",
    surface: "#ffffff",
    onSurface: "#1f2937",
    surfaceVariant: "#e5e7eb",
    onSurfaceVariant: "#4b5563",
    outline: "#d1d5db",
    outlineVariant: "#e5e7eb",
    shadow: "#000000",
    scrim: "#000000",
    inverseSurface: "#1f2937",
    inverseOnSurface: "#e5e7eb",
    inversePrimary: "#a7f3d0",
    elevation: {
      level0: "transparent",
      level1: "#f1f5f9",
      level2: "#e2e8f0",
      level3: "#cbd5e1",
      level4: "#94a3b8",
      level5: "#64748b",
    },
    surfaceDisabled: "rgba(31, 41, 55, 0.12)",
    onSurfaceDisabled: "rgba(31, 41, 55, 0.38)",
    backdrop: "rgba(51, 65, 85, 0.4)",
  },
};

export const DarkTheme = {
  ...DefaultDarkTheme,
  colors: {
    ...DefaultDarkTheme.colors,
    primary: "#10b981",
    onPrimary: "#064e3b",
    primaryContainer: "#065f46",
    onPrimaryContainer: "#a7f3d0",
    secondary: "#d1d5db",
    onSecondary: "#1f2937",
    secondaryContainer: "#333333",
    onSecondaryContainer: "#e5e7eb",
    tertiary: "#ffa4a8",
    onTertiary: "#7f1d1d",
    tertiaryContainer: "#7f1d1d",
    onTertiaryContainer: "#ffccd2",
    info: "#17a2b8",
    onInfo: "#0c5460",
    infoContainer: "#0c5460",
    onInfoContainer: "#d1ecf1",
    success: "#28a745",
    onSuccess: "#155724",
    successContainer: "#155724",
    onSuccessContainer: "#d4edda",
    warning: "#ffc107",
    onWarning: "#856404",
    warningContainer: "#856404",
    onWarningContainer: "#fff3cd",
    error: "#f5365c",
    onError: "#7f0000",
    errorContainer: "#7f0000",
    onErrorContainer: "#ffd6d6",
    background: "#18181b",
    onBackground: "#f8f9fa",
    surface: "#1f2937",
    onSurface: "#e5e7eb",
    surfaceVariant: "#4b5563",
    onSurfaceVariant: "#d1d5db",
    outline: "#e5e7eb",
    outlineVariant: "#4b5563",
    shadow: "#000000",
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

export const useAppTheme = () => {
  const { getColorScheme } = Appearance;
  const getPreferredTheme = () => (getColorScheme() === "light" ? LightTheme : DarkTheme);
  const [theme, setTheme] = useState(getPreferredTheme);

  const memoizedTheme = useMemo(() => theme, [theme]);

  useEffect(() => {
    const listener = Appearance.addChangeListener(({ colorScheme }) => {
      console.log("setting theme", colorScheme);
      setTheme(colorScheme === "light" ? LightTheme : DarkTheme);
    });

    return () => {
      listener.remove();
    };
  }, []);

  console.log("memoized theme", memoizedTheme.colors.background);

  return useTheme<typeof memoizedTheme>(theme);
};
