import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Text } from "@/components/ui/Text";
import { DIET_V2_GREEN, DIET_V2_MUTED, DropIcon, SproutIcon, DrumstickIcon } from "./dietV2Icons";

interface DailyCalorieIntakeV3Props {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  consumedCalories: number;
  consumedProtein: number;
  consumedCarbs: number;
  consumedFat: number;
}

const RING_SIZE = 132;
const RING_STROKE = 11;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const CalorieRing: React.FC<{ consumed: number; target: number }> = ({ consumed, target }) => {
  const percent = target > 0 ? consumed / target : 0;
  const clamped = Math.max(0, Math.min(1, percent));
  const offset = RING_CIRCUMFERENCE * (1 - clamped);

  return (
    <View style={styles.ringSection}>
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
          <Text fontVariant="bold" fontSize={28} style={styles.ringValue}>
            {Math.round(consumed)}
          </Text>
          <Text fontSize={12} style={styles.ringTarget}>
            {`${Math.round(target)} קק"ל`}
          </Text>
        </View>
      </View>
    </View>
  );
};

interface MacroBarProps {
  label: string;
  consumed: number;
  target: number;
  Icon: React.FC<{ size?: number; color?: string }>;
}

const MacroBar: React.FC<MacroBarProps> = ({ label, consumed, target, Icon }) => {
  const percent = target > 0 ? consumed / target : 0;
  const clamped = Math.max(0, Math.min(1, percent));

  return (
    <View style={styles.bar}>
      <View style={styles.barHeader}>
        <View style={styles.barLabelWrap}>
          <Icon size={14} color={DIET_V2_GREEN} />
          <Text fontSize={13} fontVariant="semibold" style={styles.barLabel}>
            {label}
          </Text>
        </View>
        <Text fontSize={12} style={styles.barValue}>
          {`${Math.round(consumed)} / ${Math.round(target)} ג'`}
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${clamped * 100}%` }]} />
      </View>
    </View>
  );
};

const DailyCalorieIntakeV3: React.FC<DailyCalorieIntakeV3Props> = ({
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
      <View style={styles.barsWrap}>
        <MacroBar
          label="חלבון"
          consumed={consumedProtein}
          target={totalProtein}
          Icon={DrumstickIcon}
        />
        <MacroBar label="פחמימה" consumed={consumedCarbs} target={totalCarbs} Icon={SproutIcon} />
        <MacroBar label="שומן" consumed={consumedFat} target={totalFat} Icon={DropIcon} />
      </View>
      <CalorieRing consumed={consumedCalories} target={totalCalories} />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    gap: 20,
  },
  ringSection: {
    alignItems: "center",
    gap: 8,
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
  ringValue: {
    color: "#0B2A22",
    lineHeight: 30,
  },
  ringTarget: {
    color: "#6B7280",
    lineHeight: 13,
    marginTop: 1,
  },
  barsWrap: {
    flex: 1,
    gap: 14,
  },
  bar: {
    gap: 6,
    alignSelf: "stretch",
  },
  barHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    alignSelf: "stretch",
  },
  barLabelWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  barLabel: {
    color: "#0B2A22",
  },
  barValue: {
    color: DIET_V2_MUTED,
  },
  track: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
    flexDirection: "row",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: DIET_V2_GREEN,
  },
});

export default DailyCalorieIntakeV3;
