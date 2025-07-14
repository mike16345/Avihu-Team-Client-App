import React from "react";
import { Text } from "./Text";

interface ConditionalRenderProps {
  condition: any;
  children: React.ReactNode;
}

export const ConditionalRender: React.FC<ConditionalRenderProps> = ({ condition, children }) => {
  if (!condition) return null;

  return typeof children === "string" ? <Text>{children}</Text> : <>{children}</>;
};
