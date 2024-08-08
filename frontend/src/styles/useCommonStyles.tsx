import { StyleSheet } from "react-native";

const useCommonStyles = () => {
  const commonStyles = StyleSheet.create({
    roundedXs: {
      borderRadius: 4,
    },
    roundedSm: {
      borderRadius: 8,
    },

    rounded: {
      borderRadius: 12,
    },

    roundedMd: {
      borderRadius: 16,
    },

    roundedLg: {
      borderRadius: 24,
    },

    roundedXl: {
      borderRadius: 32,
    },

    roundedFull: {
      borderRadius: 9999,
    },
  });

  return commonStyles;
};

export default useCommonStyles;
