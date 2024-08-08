import { useThemeContext } from "@/themes/useAppTheme";
import { StyleSheet } from "react-native";

const useColors = () => {
  const { theme } = useThemeContext();

  return StyleSheet.create({
    // Primary
    backgroundPrimary: {
      backgroundColor: theme.colors.primary,
    },
    textOnPrimary: {
      color: theme.colors.onPrimary,
    },
    backgroundPrimaryContainer: {
      backgroundColor: theme.colors.primaryContainer,
    },
    textOnPrimaryContainer: {
      color: theme.colors.onPrimaryContainer,
    },

    // Secondary
    backgroundSecondary: {
      backgroundColor: theme.colors.secondary,
    },
    textOnSecondary: {
      color: theme.colors.onSecondary,
    },
    backgroundSecondaryContainer: {
      backgroundColor: theme.colors.secondaryContainer,
    },
    textOnSecondaryContainer: {
      color: theme.colors.onSecondaryContainer,
    },

    // Tertiary
    backgroundTertiary: {
      backgroundColor: theme.colors.tertiary,
    },
    textOnTertiary: {
      color: theme.colors.onTertiary,
    },
    backgroundTertiaryContainer: {
      backgroundColor: theme.colors.tertiaryContainer,
    },
    textOnTertiaryContainer: {
      color: theme.colors.onTertiaryContainer,
    },

    // Info
    backgroundInfo: {
      backgroundColor: theme.colors.info,
    },
    textOnInfo: {
      color: theme.colors.onInfo,
    },
    backgroundInfoContainer: {
      backgroundColor: theme.colors.infoContainer,
    },
    textOnInfoContainer: {
      color: theme.colors.onInfoContainer,
    },

    // Success
    backgroundSuccess: {
      backgroundColor: theme.colors.success,
    },
    textOnSuccess: {
      color: theme.colors.onSuccess,
    },
    backgroundSuccessContainer: {
      backgroundColor: theme.colors.successContainer,
    },
    textOnSuccessContainer: {
      color: theme.colors.onSuccessContainer,
    },

    // Warning
    backgroundWarning: {
      backgroundColor: theme.colors.warning,
    },
    textOnWarning: {
      color: theme.colors.onWarning,
    },
    backgroundWarningContainer: {
      backgroundColor: theme.colors.warningContainer,
    },
    textOnWarningContainer: {
      color: theme.colors.onWarningContainer,
    },

    // Error
    backgroundError: {
      backgroundColor: theme.colors.error,
    },
    textOnError: {
      color: theme.colors.onError,
    },
    backgroundErrorContainer: {
      backgroundColor: theme.colors.errorContainer,
    },
    textOnErrorContainer: {
      color: theme.colors.onErrorContainer,
    },

    // Background and Surface
    background: {
      backgroundColor: theme.colors.background,
    },
    textOnBackground: {
      color: theme.colors.onBackground,
    },
    backgroundSurface: {
      backgroundColor: theme.colors.surface,
    },
    textOnSurface: {
      color: theme.colors.onSurface,
    },
    backgroundSurfaceVariant: {
      backgroundColor: theme.colors.surfaceVariant,
    },
    textOnSurfaceVariant: {
      color: theme.colors.onSurfaceVariant,
    },

    // Inverse
    backgroundInverseSurface: {
      backgroundColor: theme.colors.inverseSurface,
    },
    textInverseOnSurface: {
      color: theme.colors.inverseOnSurface,
    },
    backgroundInversePrimary: {
      backgroundColor: theme.colors.inversePrimary,
    },

    // Outline
    outline: {
      borderColor: theme.colors.outline,
    },
    outlineVariant: {
      borderColor: theme.colors.outlineVariant,
    },

    // Shadow & Scrim
    shadow: {
      shadowColor: theme.colors.shadow,
    },
    scrim: {
      backgroundColor: theme.colors.scrim,
    },

    // Elevation
    elevationLevel0: {
      backgroundColor: theme.colors.elevation.level0,
    },
    elevationLevel1: {
      backgroundColor: theme.colors.elevation.level1,
    },
    elevationLevel2: {
      backgroundColor: theme.colors.elevation.level2,
    },
    elevationLevel3: {
      backgroundColor: theme.colors.elevation.level3,
    },
    elevationLevel4: {
      backgroundColor: theme.colors.elevation.level4,
    },
    elevationLevel5: {
      backgroundColor: theme.colors.elevation.level5,
    },

    // Disabled and Backdrop
    backgroundSurfaceDisabled: {
      backgroundColor: theme.colors.surfaceDisabled,
    },
    textOnSurfaceDisabled: {
      color: theme.colors.onSurfaceDisabled,
    },
    backdrop: {
      backgroundColor: theme.colors.backdrop,
    },

    // Text colors

    textPrimary: {
      color: theme.colors.primary,
    },
    textSuccess: {
      color: theme.colors.success,
    },
    textDanger: {
      color: theme.colors.error,
    },
    textWarning: {
      color: theme.colors.warning,
    },
    textInfo: {
      color: theme.colors.info,
    },
  });
};

export default useColors;
