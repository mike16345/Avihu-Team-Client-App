import { BOTTOM_BAR_HEIGHT, TOP_BAR_HEIGHT } from "@/constants/Constants";
import { StatusBar } from "react-native";
import { Platform, StyleSheet } from "react-native";

export const useSpacingStyles = () => {
  return StyleSheet.create({
    // Margin
    mgXs: {
      margin: 4,
    },
    mgSm: {
      margin: 8,
    },
    mgDefault: {
      margin: 12,
    },
    mgMd: {
      margin: 16,
    },
    mgLg: {
      margin: 24,
    },
    mgXl: {
      margin: 32,
    },
    mgXxl: {
      margin: 48,
    },

    // Horizontal Margin
    mgHorizontalXs: {
      marginHorizontal: 4,
    },
    mgHorizontalSm: {
      marginHorizontal: 8,
    },
    mgHorizontalDefault: {
      marginHorizontal: 10,
    },
    mgHorizontalMd: {
      marginHorizontal: 16,
    },
    mgHorizontalLg: {
      marginHorizontal: 24,
    },
    mgHorizontalXl: {
      marginHorizontal: 32,
    },
    mgHorizontalXxl: {
      marginHorizontal: 48,
    },

    // Vertical Margin
    mgVerticalXs: {
      marginVertical: 4,
    },
    mgVerticalSm: {
      marginVertical: 8,
    },
    mgVerticalDefault: {
      marginVertical: 12,
    },
    mgVerticalMd: {
      marginVertical: 16,
    },
    mgVerticalLg: {
      marginVertical: 24,
    },
    mgVerticalXl: {
      marginVertical: 32,
    },
    mgVerticalXxl: {
      marginVertical: 48,
    },

    // Padding
    pdXs: {
      padding: 4,
    },
    pdSm: {
      padding: 8,
    },
    pdDefault: {
      padding: 12,
    },
    pdMd: {
      padding: 16,
    },
    pdLg: {
      padding: 24,
    },
    pdXl: {
      padding: 32,
    },
    pdXxl: {
      padding: 48,
    },

    // Horizontal Padding
    pdHorizontalXs: {
      paddingHorizontal: 4,
    },
    pdHorizontalSm: {
      paddingHorizontal: 8,
    },
    pdHorizontalDefault: {
      paddingHorizontal: 12,
    },
    pdHorizontalMd: {
      paddingHorizontal: 16,
    },
    pdHorizontalLg: {
      paddingHorizontal: 24,
    },
    pdHorizontalXl: {
      paddingHorizontal: 32,
    },
    pdHorizontalXxl: {
      paddingHorizontal: 48,
    },

    // Vertical Padding
    pdVerticalXs: {
      paddingVertical: 4,
    },
    pdVerticalSm: {
      paddingVertical: 8,
    },
    pdVerticalDefault: {
      paddingVertical: 12,
    },
    pdVerticalMd: {
      paddingVertical: 16,
    },
    pdVertical20: {
      paddingVertical: 20,
    },
    pdVerticalLg: {
      paddingVertical: 24,
    },
    pdVerticalXl: {
      paddingVertical: 32,
    },
    pdVerticalXxl: {
      paddingVertical: 48,
    },
    pdStatusBar: {
      ...Platform.select({
        ios: {
          paddingTop: TOP_BAR_HEIGHT,
        },
        android: {
          paddingTop: StatusBar.currentHeight || TOP_BAR_HEIGHT,
        },
      }),
    },
    pdBottomBar: {
      paddingBottom: BOTTOM_BAR_HEIGHT,
    },
    // Gap
    gapXs: {
      gap: 2,
    },
    gapSm: {
      gap: 4,
    },
    gapDefault: {
      gap: 8,
    },
    gapMd: {
      gap: 12,
    },
    gapLg: {
      gap: 16,
    },
    gap14: {
      gap: 14,
    },
    gap20: {
      gap: 20,
    },
    gapXl: {
      gap: 24,
    },
    gapXxl: {
      gap: 32,
    },

    // Combined Margin & Padding (Pillars)
    spacingPillar: {
      margin: 24,
      padding: 12,
    },
    spacingPillarSmall: {
      margin: 12,
      padding: 8,
    },
    spacingPillarLarge: {
      margin: 24,
      padding: 24,
    },
  });
};
