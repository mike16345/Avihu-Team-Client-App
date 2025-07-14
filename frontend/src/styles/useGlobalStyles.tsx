import useFontSize from "./useFontSize";
import useCommonStyles from "./useCommonStyles";
import { useLayoutStyles } from "./useLayoutStyles";
import useTextStyles from "./useTextStyles";
import useColors from "./useColors";
import { useSpacingStyles } from "./useSpacingStyles";

const useStyles = () => {
  const fonts = useFontSize();
  const common = useCommonStyles();
  const layout = useLayoutStyles();
  const text = useTextStyles();
  const colors = useColors();
  const spacing = useSpacingStyles();

  return { fonts, spacing, common, layout, text, colors };
};

export default useStyles;
