import { StyleProp, View, ViewStyle } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import { ReactNode } from "react";
import FrameShadow from "./FrameShadow";
import { ConditionalRender } from "./ConditionalRender";

interface Cardprops {
  variant?: "gray" | "white";
  header?: ReactNode;
  body: ReactNode;
  // Internal debate wether to call this children or body. children isnt as clear as to what is section of the card im passing to, but it allows you to pass the items in between the tags as opposed to in the props.
  footer?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

const Card: React.FC<Cardprops> = ({ body, variant = "white", footer, header, style }) => {
  const { colors, common, spacing } = useStyles();

  const variantStyles =
    variant == "white"
      ? [colors.backgroundSurface, colors.outline]
      : [colors.backgroundSecondary, colors.borderSurface];

  return (
    <FrameShadow>
      <View
        style={[
          variantStyles,
          common.borderSm,
          spacing.pdDefault,
          common.rounded,
          spacing.gapDefault,
          style,
        ]}
      >
        <ConditionalRender condition={header}>{header}</ConditionalRender>

        {body}

        <ConditionalRender condition={footer}>{footer}</ConditionalRender>
      </View>
    </FrameShadow>
  );
};

export default Card;
