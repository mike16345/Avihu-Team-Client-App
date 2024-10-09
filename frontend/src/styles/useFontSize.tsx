import { useMemo } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";

const baseFontSize = 16;

const useFontSize = () => {
  const { fontScale } = useWindowDimensions();

  const scaleFontSize = (size: number) => {
    return Math.round(size * fontScale);
  };

  const fontSizes = useMemo(
    () =>
      StyleSheet.create({
        xs: { fontSize: scaleFontSize(baseFontSize * 0.25) },
        sm: { fontSize: scaleFontSize(baseFontSize * 0.5) },
        md: { fontSize: scaleFontSize(baseFontSize * 0.875) },
        default: { fontSize: scaleFontSize(baseFontSize) },
        lg: { fontSize: scaleFontSize(baseFontSize * 1.25) },
        xl: { fontSize: scaleFontSize(baseFontSize * 1.5) },
        xxl: { fontSize: scaleFontSize(baseFontSize * 1.75) },
        xxxl: { fontSize: scaleFontSize(baseFontSize * 2) },
        xxxxl: { fontSize: scaleFontSize(baseFontSize * 2.5) },
      }),
    [fontScale]
  );

  return fontSizes;
};

export default useFontSize;
