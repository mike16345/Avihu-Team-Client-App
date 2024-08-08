import useFontSize from "./useFontSize";
import useCommonStyles from "./useCommonStyles";
import { useLayoutStyles } from "./useLayoutStyles";
import useTextStyles from "./useTextStyles";

const useGlobalStyles = () => {
  const fontSize = useFontSize();
  const commonStyles = useCommonStyles();
  const layoutStyles = useLayoutStyles();
  const textStyles = useTextStyles();

  return { ...fontSize, ...commonStyles, ...layoutStyles, ...textStyles };
};

export default useGlobalStyles;
