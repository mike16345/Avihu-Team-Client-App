import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "@/components/ui/Text";
import {
  GREEN_DARK,
  HAIRLINE,
  MUTED_TEXT,
  MUTED_TEXT_SOFT,
  PRIMARY_DARK,
  RED_DARK,
  formatSteps,
} from "./stepsConstants";

interface WeeklyBalanceRowProps {
  balance: number;
}

const formatBalance = (balance: number) => {
  if (balance === 0) return "בדיוק על המסלול";
  if (balance > 0) return `+${formatSteps(balance)}`;

  return `-${formatSteps(Math.abs(balance))}`;
};

const getBalanceColor = (balance: number) => {
  if (balance > 0) return GREEN_DARK;
  if (balance < 0) return RED_DARK;

  return PRIMARY_DARK;
};

const WeeklyBalanceRow: React.FC<WeeklyBalanceRowProps> = ({ balance }) => {
  const label = formatBalance(balance);
  const color = getBalanceColor(balance);

  return (
    <View style={styles.row}>
      <Text fontSize={13} style={styles.heading}>
        השלמה לימים שעברו השבוע
      </Text>
      <View style={styles.valueGroup}>
        {balance !== 0 && (
          <Text fontSize={12} style={[styles.unit, styles.unitSpacing]}>
            צעדים
          </Text>
        )}
        <Text fontVariant="bold" fontSize={15} style={{ color }}>
          {label}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    marginTop: 16,
    paddingTop: 14,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: HAIRLINE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  valueGroup: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  unit: {
    color: MUTED_TEXT,
  },
  unitSpacing: {
    marginRight: 6,
  },
  heading: {
    color: MUTED_TEXT_SOFT,
    textAlign: "right",
  },
});

export default WeeklyBalanceRow;
