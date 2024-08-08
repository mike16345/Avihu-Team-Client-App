import { StyleSheet } from "react-native";

const useCommonStyles = () => {
  const commonStyles = StyleSheet.create({
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
      borderRadius: 20,
    },

    roundedFull: {
      borderRadius: 9999,
    },
  });

  return commonStyles;
};

export default useCommonStyles;
