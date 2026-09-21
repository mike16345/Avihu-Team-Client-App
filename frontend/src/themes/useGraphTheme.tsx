import { semanticColors } from "@/themes/semanticColors";
import useStyles from "@/styles/useGlobalStyles";

const useGraphTheme = () => {
  const { colors } = useStyles();

  const color = () => semanticColors.graph.line;
  const labelColor = () => semanticColors.app.graphLabelStrong;

  return {
    backgroundGradientFrom: colors.backgroundSecondary.backgroundColor,
    backgroundGradientTo: colors.backgroundSecondary.backgroundColor,
    fillShadowGradientTo: semanticColors.graph.gradientStart,
    fillShadowGradientFrom: semanticColors.graph.tooltip,
    color,
    labelColor,
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: semanticColors.app.surfaceRaised,
      fill: semanticColors.graph.dot,
    },
  };
};

export default useGraphTheme;
