import { View } from "react-native";
import React from "react";
import GreenDot from "./GreenDot";
import useStyles from "@/styles/useGlobalStyles";

interface GreenDotGeneratorProps {
  count: number;
}

const GreenDotGenerator: React.FC<GreenDotGeneratorProps> = ({ count }) => {
  const { spacing, layout } = useStyles();

  const fullDots = Math.floor(count);
  const decimal = (count % 1) - 0.05;

  return (
    <View style={[layout.flexRow, spacing.gapXs]}>
      {/* Full dots */}
      {Array.from({ length: fullDots }).map((_, i) => (
        <GreenDot key={`full-${i}`} size={8} filled={1} />
      ))}

      {/* Partial dot */}
      {decimal > 0 && <GreenDot key="partial" size={8} filled={decimal} />}
    </View>
  );
};
export default GreenDotGenerator;
