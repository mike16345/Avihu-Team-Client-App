import { semanticColors } from "@/themes/semanticColors";
import { Platform, StyleSheet } from "react-native";
import useColors from "./useColors";

export const useShadowStyles = () => {
  const { background } = useColors();

  const shadowStyles = StyleSheet.create({
    // Button Shadows (All Buttons With Shadow)
    // Using the most visually impactful layer (layer 3 with 5% opacity and 10 blur)
    buttonShadow: {
      ...Platform.select({
        ios: {
          shadowColor: semanticColors.steps.ringGradientStart,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.2,
          shadowRadius: 10,
        },
        android: {
          elevation: 8,
          backgroundColor: semanticColors.app.surfaceCool,

          shadowColor: semanticColors.steps.ringGradientStart,
        },
      }),
    },

    // Alternative button shadow using layer 4 for more subtle effect
    buttonShadowLight: {
      ...Platform.select({
        ios: {
          shadowColor: semanticColors.steps.ringGradientStart,
          shadowOffset: { width: 0, height: 7 },
          shadowOpacity: 0.09,
          shadowRadius: 7,
        },
        android: {
          /*   elevation: 6,
      backgroundColor: semanticColors.app.surfaceCool,

          shadowColor: semanticColors.steps.ringGradientStart, */
        },
      }),
    },

    // Frame Shadows (All Frames With Shadow)
    // Using the most prominent layer (layer 1 with higher offset)
    frameShadow: {
      ...Platform.select({
        ios: {
          shadowColor: semanticColors.shadowMuted,
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.2, // Reduced from 0% to make it visible
          shadowRadius: 64,
        },
      }),
    },

    // Alternative frame shadow using layer 2 for more visible effect
    frameShadowVisible: {
      ...Platform.select({
        ios: {
          shadowColor: semanticColors.shadowMuted,
          shadowOffset: { width: 0, height: 146 },
          shadowOpacity: 0.01,
          shadowRadius: 58,
        },
        android: {
          elevation: 15,
          shadowColor: semanticColors.shadowMuted,
        },
      }),
    },

    // Layered approach - if you want to use multiple Views to stack shadows
    // (More accurate but requires nested components)

    // Button Shadow Layers
    buttonLayer1: {
      borderRadius: 12,
      ...Platform.select({
        ios: {
          shadowColor: semanticColors.steps.ringGradientStart,
          shadowOffset: { width: 0, height: 47 },
          shadowOpacity: 0.0, // Original was 0%, making it 0.01 to be visible
          shadowRadius: 13,
        },
        android: {
          elevation: 10,
          shadowColor: semanticColors.steps.ringGradientStart,
          backgroundColor: background.backgroundColor,
        },
      }),
    },

    buttonLayer2: {
      backgroundColor: semanticColors.app.surfaceRaised,
      borderRadius: 12,

      ...Platform.select({
        ios: {
          shadowColor: semanticColors.steps.ringGradientStart,
          shadowOffset: { width: 0, height: 30 },
          shadowOpacity: 0.01,
          shadowRadius: 12,
        },
        android: {},
      }),
    },

    buttonLayer3: {
      backgroundColor: semanticColors.app.surfaceRaised,
      borderRadius: 12,

      ...Platform.select({
        ios: {
          shadowColor: semanticColors.steps.ringGradientStart,
          shadowOffset: { width: 0, height: 17 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
        },
        android: {},
      }),
    },

    buttonLayer4: {
      backgroundColor: semanticColors.app.surfaceRaised,
      borderRadius: 12,

      ...Platform.select({
        ios: {
          shadowColor: semanticColors.steps.ringGradientStart,
          shadowOffset: { width: 0, height: 7 },
          shadowOpacity: 0.09,
          shadowRadius: 7,
        },
        android: {},
      }),
    },

    buttonLayer5: {
      borderRadius: 12,

      ...Platform.select({
        ios: {
          shadowColor: semanticColors.steps.ringGradientStart,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
          backgroundColor: background.backgroundColor,

          shadowColor: semanticColors.steps.ringGradientStart,
        },
      }),
    },

    // Frame Shadow Layers
    frameLayer1: {
      borderRadius: 25,
      ...Platform.select({
        ios: {
          shadowColor: semanticColors.shadowMuted,
          backgroundColor: background.backgroundColor,
          shadowOffset: { width: 0, height: 228 },
          shadowOpacity: 0.01, // Made visible
          shadowRadius: 64,
        },
      }),
    },

    frameLayer2: {
      borderRadius: 25,
      ...Platform.select({
        ios: {
          shadowColor: semanticColors.shadowMuted,
          backgroundColor: background.backgroundColor,
          shadowOffset: { width: 0, height: 146 },
          shadowOpacity: 0.01,
          shadowRadius: 58,
        },
        android: {},
      }),
    },

    frameLayer3: {
      borderRadius: 25,
      ...Platform.select({
        ios: {
          shadowColor: semanticColors.shadowMuted,
          backgroundColor: background.backgroundColor,
          shadowOffset: { width: 0, height: 82 },
          shadowOpacity: 0.05,
          shadowRadius: 49,
        },
        android: {},
      }),
    },

    frameLayer4: {
      borderRadius: 25,
      ...Platform.select({
        ios: {
          shadowColor: semanticColors.shadowMuted,
          backgroundColor: background.backgroundColor,
          shadowOffset: { width: 0, height: 37 },
          shadowOpacity: 0.09,
          shadowRadius: 37,
        },
        android: {},
      }),
    },

    frameLayer5: {
      borderRadius: 20,
      opacity: 1,
      ...Platform.select({
        ios: {
          shadowColor: semanticColors.shadowMuted,
          backgroundColor: background.backgroundColor,
          shadowOffset: { width: 0, height: 9 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
        },
        android: {
          backgroundColor: semanticColors.shadowMuted,
          shadowRadius: 15,
          elevation: 4,
          shadowColor: semanticColors.shadowMuted,
        },
      }),
    },
  });

  return shadowStyles;
};
