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
    borderSm:{
      borderWidth:2
    },
    borderXsm:{
      borderWidth:1
    },
    borderDefault:{
      borderWidth:4
    },
    borderLg:{
      borderWidth:6
    },
    borderXl:{
      borderWidth:8
    },
    borderLeftSm:{
      borderLeftWidth:2
    },
    borderLeftXsm:{
      borderLeftWidth:1
    },
    borderLeftDefault:{
      borderLeftWidth:4
    },
    borderLeftLg:{
      borderLeftWidth:6
    },
    borderLeftXl:{
      borderLeftWidth:8
    },
  });

  return commonStyles;
};

export default useCommonStyles;
