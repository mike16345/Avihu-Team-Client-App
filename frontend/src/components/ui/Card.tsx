import { StyleProp, View, ViewStyle } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import FrameShadow from "./FrameShadow";
import { ChildrenProp } from "@/interfaces";

interface Cardprops extends ChildrenProp {
  variant?: "gray" | "white";
  style?: StyleProp<ViewStyle>;
}

interface CardSubComponent {
  ({ children }: ChildrenProp): JSX.Element;
}

interface CompoundCard extends React.FC<Cardprops> {
  header: CardSubComponent;
  content: CardSubComponent;
  footer: CardSubComponent;
}

export const Card: CompoundCard = ({ children, variant = "white", style }) => {
  const { colors, common, spacing } = useStyles();

  const variantStyles = {
    white: [colors.backgroundSurface, colors.outline],
    gray: [colors.backgroundSecondary, colors.borderSurface],
  };

  return (
    <FrameShadow>
      <View
        style={[
          variantStyles[variant],
          common.borderSm,
          spacing.pdDefault,
          common.roundedSm,
          spacing.gapDefault,
          style,
        ]}
      >
        {children}
      </View>
    </FrameShadow>
  );
};

Card.header = ({ children }: ChildrenProp) => <View>{children}</View>;
Card.content = ({ children }: ChildrenProp) => <View>{children}</View>;
Card.footer = ({ children }: ChildrenProp) => <View>{children}</View>;
