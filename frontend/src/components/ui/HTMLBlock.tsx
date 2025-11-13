import { FC } from "react";
import { useWindowDimensions } from "react-native";
import { RenderHTMLSource, RenderHTMLSourceProps } from "react-native-render-html";

const HtmlBlock: FC<RenderHTMLSourceProps> = ({ ...props }) => {
  const { width } = useWindowDimensions();

  return <RenderHTMLSource contentWidth={width} {...props} />;
};

export default HtmlBlock;
