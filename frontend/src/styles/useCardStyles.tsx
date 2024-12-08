import useStyles from "./useGlobalStyles";
import { StyleSheet } from "react-native";

const useCardStyles = () => {
  const styles = useStyles();

  return StyleSheet.create({
    card: {
      ...styles.layout.container,
      ...styles.colors.backgroundSecondaryContainer,
      ...styles.common.rounded,
    },
    weightCard: {
      ...styles.layout.container,
      ...styles.colors.backgroundSecondaryContainer,
      ...styles.common.rounded,
      ...styles.spacing.gapXs,
    },
  });
};

export default useCardStyles;
