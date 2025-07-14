import { TouchableOpacity, TextProps, TouchableOpacityProps } from "react-native";
import { Text } from "../ui/Text";

interface OpacityButtonProps extends TouchableOpacityProps {
  textProps?: TextProps;
}

export default function OpacityButton({ textProps, ...props }: OpacityButtonProps) {
  const { children } = props;
  const content = typeof children === "string" ? <Text {...textProps}>{children}</Text> : children;

  return <TouchableOpacity {...props}>{content}</TouchableOpacity>;
}
