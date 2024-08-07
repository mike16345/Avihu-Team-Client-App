import { StyleSheet } from "react-native";

const useCommonStyles = () => {
  const commonStyles = StyleSheet.create({
    marginSmall: {
      margin: 8,
    },
    marginMedium: {
      margin: 16,
    },
    marginLarge: {
      margin: 24,
    },
    paddingSmall: {
      padding: 8,
    },
    paddingMedium: {
      padding: 16,
    },
    paddingLarge: {
      padding: 24,
    },
    
  });

  return commonStyles;
};

export default useCommonStyles;
