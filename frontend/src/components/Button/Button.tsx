import React from "react";
import { TextProps } from "react-native";
import { Pressable, PressableProps, Text } from "react-native";

interface ButtonProps extends PressableProps {
  children: React.ReactNode | string;
  textProps?: TextProps;
}

export default function Button({ children, textProps, ...props }: ButtonProps) {
  return (
    <Pressable {...props}>
      {typeof children === "string" ? <Text {...textProps}>{children}</Text> : children}
    </Pressable>
  );
}
