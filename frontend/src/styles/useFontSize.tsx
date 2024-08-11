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
        default: { fontSize: scaleFontSize(baseFontSize) },
        xsm: { fontSize: scaleFontSize(baseFontSize * 0.675) },
        sm: { fontSize: scaleFontSize(baseFontSize * 0.875) },
        lg: { fontSize: scaleFontSize(baseFontSize * 1.25) },
        xl: { fontSize: scaleFontSize(baseFontSize * 1.5) },
        xxl: { fontSize: scaleFontSize(baseFontSize * 2) },
        xxxl: { fontSize: scaleFontSize(baseFontSize * 2.5) },
      }),
    [fontScale]
  );

  return fontSizes;
};

export default useFontSize;
