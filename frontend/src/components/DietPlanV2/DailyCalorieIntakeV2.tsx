import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Text } from "@/components/ui/Text";
import { DIET_V2_GREEN, DropIcon, SproutIcon, DrumstickIcon, FlameIcon } from "./dietV2Icons";

interface DailyCalorieIntakeV2Props {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  consumedCalories: number;
  consumedProtein: number;
  consumedCarbs: number;
  consumedFat: number;
}

interface MacroCardProps {
  label: string;
  target: number;
  consumed: number;
  unit: string;
  IconComponent: React.FC<{ size?: number; color?: string }>;
}

const RING_SIZE = 80;
const RING_STROKE = 7;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const MacroCard: React.FC<MacroCardProps> = ({ label, target, consumed, unit, IconComponent }) => {
  const percent = target > 0 ? consumed / target : 0;
  const clamped = Math.max(0, Math.min(1, percent));
  const offset = RING_CIRCUMFERENCE * (1 - clamped);
  const roundedConsumed = Math.round(consumed);
  const roundedTarget = Math.round(target);

  return (
    <View style={styles.card}>
      <View style={styles.ringWrap}>
        <Svg width={RING_SIZE} height={RING_SIZE} style={StyleSheet.absoluteFill}>
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            stroke="#E5E7EB"
            strokeWidth={RING_STROKE}
            fill="transparent"
          />
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            stroke={DIET_V2_GREEN}
            strokeWidth={RING_STROKE}
            fill="transparent"
            strokeDasharray={`${RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
          />
        </Svg>
        <View style={styles.ringCenter}>
          <Text fontVariant="bold" fontSize={18} style={styles.consumedText}>
            {roundedConsumed}
          </Text>
          <Text fontSize={11} style={styles.targetText}>
            {`${roundedTarget} ${unit}`}
          </Text>
        </View>
      </View>
      <View style={styles.labelRow}>
        <Text fontSize={13} fontVariant="semibold" style={styles.labelText}>
          {label}
        </Text>
        <IconComponent size={16} color={DIET_V2_GREEN} />
      </View>
    </View>
  );
};

const DailyCalorieIntakeV2: React.FC<DailyCalorieIntakeV2Props> = ({
  totalCalories,
  totalProtein,
  totalCarbs,
  totalFat,
  consumedCalories,
  consumedProtein,
  consumedCarbs,
  consumedFat,
}) => {
  return (
    <View style={styles.row}>
      <MacroCard
        label="קלוריות"
        target={totalCalories}
        consumed={consumedCalories}
        unit="קל'"
        IconComponent={FlameIcon}
      />
      <MacroCard
        label="חלבון"
        target={totalProtein}
        consumed={consumedProtein}
        unit="ג'"
        IconComponent={DrumstickIcon}
      />
      <MacroCard
        label="פחמימה"
        target={totalCarbs}
        consumed={consumedCarbs}
        unit="ג'"
        IconComponent={SproutIcon}
      />
      <MacroCard
        label="שומן"
        target={totalFat}
        consumed={consumedFat}
        unit="ג'"
        IconComponent={DropIcon}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    width: "100%",
    paddingHorizontal: 12,
    gap: 8,
  },
  card: {
    flex: 1,
    backgroundColor: "transparent",
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: "center",
    gap: 6,
  },
  ringWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  ringCenter: {
    alignItems: "center",
    justifyContent: "center",
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  consumedText: {
    color: "#0B2A22",
    lineHeight: 18,
  },
  targetText: {
    color: "#6B7280",
    lineHeight: 11,
    marginTop: 1,
  },
  unitText: {
    color: "#9CA3AF",
    lineHeight: 10,
    marginTop: 1,
  },
  labelText: {
    color: "#0B2A22",
  },
});

export default DailyCalorieIntakeV2;
