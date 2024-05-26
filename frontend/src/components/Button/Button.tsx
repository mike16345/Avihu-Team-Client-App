import { Pressable, PressableProps } from "react-native";
import React from "react";

export default function Button({ ...props }: PressableProps) {
  return <Pressable {...props}>{props.children}</Pressable>;
}
