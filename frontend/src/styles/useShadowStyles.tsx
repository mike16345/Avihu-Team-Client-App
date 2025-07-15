import { Platform, StyleSheet } from "react-native";

export const useShadowStyles = () => {
  const shadowStyles = StyleSheet.create({
    // Button Shadows (All Buttons With Shadow)
    // Using the most visually impactful layer (layer 3 with 5% opacity and 10 blur)
    buttonShadow: {
      backgroundColor: "#fff",
      ...Platform.select({
        ios: {
          shadowColor: "#072723",
          shadowOffset: { width: 0, height: 17 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
        },
        android: {
          elevation: 8,
          shadowColor: "#072723",
        },
      }),
    },

    // Alternative button shadow using layer 4 for more subtle effect
    buttonShadowLight: {
      backgroundColor: "#fff",

      ...Platform.select({
        ios: {
          shadowColor: "#072723",
          shadowOffset: { width: 0, height: 7 },
          shadowOpacity: 0.09,
          shadowRadius: 7,
        },
        android: {
          elevation: 6,
          shadowColor: "#072723",
        },
      }),
    },

    // Frame Shadows (All Frames With Shadow)
    // Using the most prominent layer (layer 1 with higher offset)
    frameShadow: {
      ...Platform.select({
        ios: {
          shadowColor: "#999999",
          shadowOffset: { width: 0, height: 228 },
          shadowOpacity: 0.03, // Reduced from 0% to make it visible
          shadowRadius: 64,
        },
        android: {
          elevation: 20,
          shadowColor: "#999999",
        },
      }),
    },

    // Alternative frame shadow using layer 2 for more visible effect
    frameShadowVisible: {
      ...Platform.select({
        ios: {
          shadowColor: "#999999",
          shadowOffset: { width: 0, height: 146 },
          shadowOpacity: 0.01,
          shadowRadius: 58,
        },
        android: {
          elevation: 15,
          shadowColor: "#999999",
        },
      }),
    },

    // Layered approach - if you want to use multiple Views to stack shadows
    // (More accurate but requires nested components)

    // Button Shadow Layers
    buttonLayer1: {
      backgroundColor: "#fff",
      borderRadius: 12,
      ...Platform.select({
        ios: {
          shadowColor: "#072723",
          shadowOffset: { width: 0, height: 47 },
          shadowOpacity: 0.0, // Original was 0%, making it 0.01 to be visible
          shadowRadius: 13,
        },
        android: {
          elevation: 10,
          shadowColor: "#072723",
        },
      }),
    },

    buttonLayer2: {
      backgroundColor: "#fff",
      borderRadius: 12,

      ...Platform.select({
        ios: {
          shadowColor: "#072723",
          shadowOffset: { width: 0, height: 30 },
          shadowOpacity: 0.01,
          shadowRadius: 12,
        },
        android: {
          elevation: 8,
          shadowColor: "#072723",
        },
      }),
    },

    buttonLayer3: {
      backgroundColor: "#fff",
      borderRadius: 12,

      ...Platform.select({
        ios: {
          shadowColor: "#072723",
          shadowOffset: { width: 0, height: 17 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
        },
        android: {
          elevation: 6,
          shadowColor: "#072723",
        },
      }),
    },

    buttonLayer4: {
      backgroundColor: "#fff",
      borderRadius: 12,

      ...Platform.select({
        ios: {
          shadowColor: "#072723",
          shadowOffset: { width: 0, height: 7 },
          shadowOpacity: 0.09,
          shadowRadius: 7,
        },
        android: {
          elevation: 4,
          shadowColor: "#072723",
        },
      }),
    },

    buttonLayer5: {
      backgroundColor: "#fff",
      borderRadius: 12,

      ...Platform.select({
        ios: {
          shadowColor: "#072723",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
          shadowColor: "#072723",
        },
      }),
    },

    // Frame Shadow Layers
    frameLayer1: {
      ...Platform.select({
        ios: {
          shadowColor: "#999999",
          shadowOffset: { width: 0, height: 228 },
          shadowOpacity: 0.01, // Made visible
          shadowRadius: 64,
        },
        android: {
          elevation: 20,
          shadowColor: "#999999",
        },
      }),
    },

    frameLayer2: {
      ...Platform.select({
        ios: {
          shadowColor: "#999999",
          shadowOffset: { width: 0, height: 146 },
          shadowOpacity: 0.01,
          shadowRadius: 58,
        },
        android: {
          elevation: 15,
          shadowColor: "#999999",
        },
      }),
    },

    frameLayer3: {
      ...Platform.select({
        ios: {
          shadowColor: "#999999",
          shadowOffset: { width: 0, height: 82 },
          shadowOpacity: 0.05,
          shadowRadius: 49,
        },
        android: {
          elevation: 12,
          shadowColor: "#999999",
        },
      }),
    },

    frameLayer4: {
      ...Platform.select({
        ios: {
          shadowColor: "#999999",
          shadowOffset: { width: 0, height: 37 },
          shadowOpacity: 0.09,
          shadowRadius: 37,
        },
        android: {
          elevation: 8,
          shadowColor: "#999999",
        },
      }),
    },

    frameLayer5: {
      ...Platform.select({
        ios: {
          shadowColor: "#999999",
          shadowOffset: { width: 0, height: 9 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
        },
        android: {
          elevation: 4,
          shadowColor: "#999999",
        },
      }),
    },
  });

  return shadowStyles;
};
