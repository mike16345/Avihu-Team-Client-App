import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "@/components/ui/Text";
import { formatSteps } from "@/utils/stepsUtils";
import {
  GREEN_DARK,
  HAIRLINE,
  MUTED_TEXT,
  MUTED_TEXT_SOFT,
  PRIMARY_DARK,
  RED_DARK,
} from "./stepsConstants";
import { IS_IOS } from "@/constants/Constants";

interface WeeklyBalanceRowProps {
  balance: number;
}

const formatBalance = (balance: number) => {
  if (balance === 0) return "בדיוק על המסלול";
  if (balance > 0) return IS_IOS ? `+${formatSteps(balance)}` : `${formatSteps(balance)}+`;

  return IS_IOS ? `-${formatSteps(Math.abs(balance))}` : `${formatSteps(Math.abs(balance))}-`;
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
        <Text fontVariant="bold" fontSize={15} style={{ color }}>
          {label}
        </Text>
        {balance !== 0 && (
          <Text fontSize={12} style={[styles.unit]}>
            צעדים
          </Text>
        )}
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
    gap: 6,
    alignItems: "baseline",
  },
  unit: {
    color: MUTED_TEXT,
  },
  heading: {
    color: MUTED_TEXT_SOFT,
    textAlign: "right",
  },
});

export default WeeklyBalanceRow;
