import { IS_IOS } from "@/constants/Constants";
import useColors from "@/styles/useColors";
import { FC, useMemo } from "react";
import { useWindowDimensions } from "react-native";
import RenderHTML, { RenderHTMLProps } from "react-native-render-html";

const HtmlBlock: FC<RenderHTMLProps> = ({ ...props }) => {
  const { width } = useWindowDimensions();
  const { textPrimary } = useColors();

  const baseStyle = useMemo(
    () => ({
      color: textPrimary.color,
      fontSize: 14,
      textAlign: "left",
    }),
    []
  );
  const tagStyle = useMemo(
    () => ({
      ol: { direction: "rtl" },
      li: { textAlign: "start" },
      b: { fontWeight: "bold" },
      strong: { fontWeight: "bold" },
      u: { textDecorationLine: "underline" },
      s: { textDecorationLine: "line-through" },
      i: { fontStyle: "italic" },
      em: { fontStyle: "italic" },
    }),
    []
  );
  const rendererProps = useMemo(
    () => ({
      ol: { enableExperimentalRtl: IS_IOS },
      ul: {
        enableExperimentalRtl: IS_IOS,
      },
    }),
    []
  );

  return (
    <RenderHTML
      baseStyle={baseStyle}
      tagsStyles={tagStyle}
      renderersProps={rendererProps}
      contentWidth={width}
      {...props}
    />
  );
};

export default HtmlBlock;
