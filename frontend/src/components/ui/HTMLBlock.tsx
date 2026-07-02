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
      textAlign: "left" as const,
    }),
    [textPrimary.color]
  );
  const tagStyle = useMemo(
    () => ({
      ol: { direction: "rtl" as const },
      li: { textAlign: "left" as const },
      b: { fontWeight: "bold" as const },
      strong: { fontWeight: "bold" as const },
      u: { textDecorationLine: "underline" as const },
      s: { textDecorationLine: "line-through" as const },
      i: { fontStyle: "italic" as const },
      em: { fontStyle: "italic" as const },
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
