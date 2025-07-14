import { useMemo } from "react";
import { useThemeContext } from "./useAppTheme";
import { hexToRgba } from "@/utils/utils";

const LARGE_AMOUNT_OF_DOTS = 35;

const useGraphTheme = (data: number[] = []) => {
  const { theme } = useThemeContext();
  const isLargeAmountOfDots = useMemo(() => data?.length > LARGE_AMOUNT_OF_DOTS, [data]);

  const color = (opacity = 1) => hexToRgba(theme.colors.primary, opacity);
  const labelColor = (opacity = 1) => hexToRgba(theme.colors.onSurface, opacity);

  return {
    backgroundColor: theme.colors.secondaryContainer,
    backgroundGradientFrom: theme.colors.secondaryContainer,
    backgroundGradientTo: theme.colors.secondaryContainer,
    decimalPlaces: 2,
    color: color,
    labelColor: labelColor,
    style: {
      borderRadius: 16,
    },
    propsForLabels: {
      fontSize: 12,
      fontWeight: "bold",
      fontFamily: "sans-serif-light",
    },
    propsForDots: {
      r: isLargeAmountOfDots ? "2" : "4",
      strokeWidth: isLargeAmountOfDots ? "0.5" : "1",
      stroke: "#fff",
    },
  };
};

export default useGraphTheme;
