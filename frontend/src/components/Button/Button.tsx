import { Pressable, PressableProps } from "react-native";

export default function Button({ ...props }: PressableProps) {
  return <Pressable {...props}>{props.children}</Pressable>;
}
