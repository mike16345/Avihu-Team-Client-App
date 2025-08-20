import { StyleProp, View, ViewProps, ViewStyle } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import { PropsWithChildren } from "react";

export type CardVariants = "gray" | "white" | "success";
interface CardProps extends PropsWithChildren {
  variant?: CardVariants;
  style?: StyleProp<ViewStyle>;
}

type CardSubComponentProps = ViewProps;
interface CompoundCard extends React.FC<CardProps> {
  Header: React.FC<CardSubComponentProps>;
  Content: React.FC<CardSubComponentProps>;
  Footer: React.FC<CardSubComponentProps>;
}

export const Card: CompoundCard = ({ children, variant = "white", style }) => {
  const { colors, common, spacing } = useStyles();

  const variantStyles = {
    white: [colors.backgroundSurface, colors.outline],
    gray: [colors.backgroundSecondary, colors.borderSurface],
    success: [colors.backgroundSuccessContainer, colors.borderSurface],
  };

  return (
    <View
      style={[
        variantStyles[variant],
        common.borderSm,
        spacing.pdDefault,
        common.roundedSm,
        spacing.gapSm,
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
