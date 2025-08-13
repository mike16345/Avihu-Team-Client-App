import { StyleProp, View, ViewProps, ViewStyle } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import FrameShadow from "./FrameShadow";
import { PropsWithChildren } from "react";

interface CardProps extends PropsWithChildren {
  variant?: "gray" | "white";
  style?: StyleProp<ViewStyle>;
}

type CardSubComponentProps = ViewProps;

interface CompoundCard extends React.FC<CardProps> {
  Header: React.FC<CardSubComponentProps>;
  Content: React.FC<CardSubComponentProps>;
  Footer: React.FC<CardSubComponentProps>;
}

export const Card: CompoundCard = ({ children, variant = "white", style }) => {
  const { colors, common, spacing, fonts } = useStyles();

  spacing.pdDefault.padding;
  fonts.lg;

  const variantStyles = {
    white: [colors.backgroundSurface, colors.outline],
    gray: [colors.backgroundSecondary, colors.borderSurface],
  };

  return (
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
  );
};

Card.Header = ({ children, style, ...props }: CardSubComponentProps) => (
  <View style={style} {...props}>
    {children}
  </View>
);
Card.Content = ({ children, style, ...props }: CardSubComponentProps) => (
  <View style={style} {...props}>
    {children}
  </View>
);
Card.Footer = ({ children, style, ...props }: CardSubComponentProps) => (
  <View style={style} {...props}>
    {children}
  </View>
);
