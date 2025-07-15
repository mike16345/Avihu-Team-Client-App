import { View, Text } from "react-native";
import icons, { IconName } from "../../constants/iconMap";
import React from "react";

interface IconProps {
  name: IconName;
  width?: number;
  height?: number;
  variant?: "solid" | "outline";
  color?: string;
  rotation?: number;
}

const Icon: React.FC<IconProps> = ({
  name,
  width = 24,
  height = 24,
  color = "black",
  variant = "outline",
  rotation,
}) => {
  const SvgIcon = icons[name];

  if (!SvgIcon) return null;

  return (
    <SvgIcon
      width={width}
      height={height}
      color={color} // ✅ This sets currentColor
      fill={variant === "solid" ? color : "none"}
      stroke="none" // optional fallback
      style={{ transform: [{ rotate: `${rotation || 0}deg` }] }}
    />
  );
};

export default Icon;
