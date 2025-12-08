import useColors from "@/styles/useColors";
import React, { PropsWithChildren, useMemo } from "react";
import { TRenderEngineProvider, RenderHTMLConfigProvider } from "react-native-render-html";

interface HtmlRenderProviderProps extends PropsWithChildren {
  textColor?: string;
  fontSize?: number;
  textAlign?: "left" | "right" | "center" | "justify";
}

export const HtmlRenderProvider: React.FC<HtmlRenderProviderProps> = ({
  children,
  textColor,
  fontSize = 14,
  textAlign = "left",
}) => {
  const { textPrimary } = useColors();

  const baseStyle = useMemo(
    () => ({
      color: textPrimary.color,
      fontSize,
      textAlign,
    }),
    [textColor, fontSize, textAlign]
  );

  const tagsStyles = useMemo(
    () => ({
      b: { fontWeight: "bold" },
      strong: { fontWeight: "bold" },
    }),
    []
  );

  return (
    <TRenderEngineProvider
      baseStyle={baseStyle} // ✅ belongs here
      tagsStyles={tagsStyles} // ✅ belongs here
    >
      <RenderHTMLConfigProvider>{children}</RenderHTMLConfigProvider>
    </TRenderEngineProvider>
  );
};
