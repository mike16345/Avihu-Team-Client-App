import useStyles from "@/styles/useGlobalStyles";

const useGraphTheme = () => {
  const { colors } = useStyles();

  const color = () => `rgba(119, 243, 146, 1)`;
  const labelColor = () => `rgba(69, 68, 89, 1)`;

  return {
    backgroundGradientFrom: colors.backgroundSecondary.backgroundColor,
    backgroundGradientTo: colors.backgroundSecondary.backgroundColor,
    fillShadowGradientTo: "#9FFFA2",
    fillShadowGradientFrom: "#79F681",
    color,
    labelColor,
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#FFF",
      fill: "#33B333",
    },
  };
};

export default useGraphTheme;
