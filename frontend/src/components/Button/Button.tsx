import { Pressable, PressableProps, TextProps } from "react-native";
import { Text } from "../ui/Text";

interface ButtonProps extends PressableProps {
  textProps?: TextProps;
}

export default function Button({ textProps, ...props }: ButtonProps) {
  const { children } = props;
  const content = typeof children === "string" ? <Text {...textProps}>{children}</Text> : children;

  return <Pressable {...props}>{content}</Pressable>;
}
