import { StyleProp, View, ViewProps, ViewStyle } from "react-native";
import useStyles from "@/styles/useGlobalStyles";

export type CardVariants = "gray" | "white" | "success";
interface CardProps extends ViewProps {
  variant?: CardVariants;
  style?: StyleProp<ViewStyle>;
}

type CardSubComponentProps = ViewProps;
interface CompoundCard extends React.FC<CardProps> {
  Header: React.FC<CardSubComponentProps>;
  Content: React.FC<CardSubComponentProps>;
  Footer: React.FC<CardSubComponentProps>;
}

export const Card: CompoundCard = ({ children, variant = "white", style, ...props }) => {
  const { colors, common, spacing, fonts } = useStyles();

  spacing.pdDefault.padding;
  fonts.lg;

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
        spacing.gapDefault,
        style,
      ]}
      {...props}
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
