import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Icon from "@/components/Icon/Icon";
import { Text } from "@/components/ui/Text";
import { formatSteps } from "@/utils/stepsUtils";
import { GREEN_DARK, MUTED_TEXT_FAINT, PRIMARY_DARK } from "./stepsConstants";

interface WeeklyStepsChartHeaderProps {
  totalSteps: number;
  weeklyGoalTotal: number;
  weekRangeLabel?: string;
  canGoPreviousWeek?: boolean;
  canGoNextWeek?: boolean;
  onPreviousWeek?: () => void;
  onNextWeek?: () => void;
}

const WeeklyStepsChartHeader: React.FC<WeeklyStepsChartHeaderProps> = ({
  totalSteps,
  weeklyGoalTotal,
  weekRangeLabel,
  canGoPreviousWeek = false,
  canGoNextWeek = false,
  onPreviousWeek,
  onNextWeek,
}) => {
  return (
    <View style={styles.headerRow}>
      <View style={styles.weekNavRow}>
        <TouchableOpacity
          activeOpacity={0.6}
          hitSlop={8}
          disabled={!canGoNextWeek}
          onPress={onNextWeek}
          style={[styles.weekNavButton, !canGoNextWeek && styles.weekNavButtonDisabled]}
        >
          <Icon
            name="chevronLeftSoft"
            width={20}
            height={20}
            color={canGoNextWeek ? PRIMARY_DARK : MUTED_TEXT_FAINT}
          />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.6}
          hitSlop={8}
          disabled={!canGoPreviousWeek}
          onPress={onPreviousWeek}
          style={[styles.weekNavButton, !canGoPreviousWeek && styles.weekNavButtonDisabled]}
        >
          <Icon
            name="chevronRightSoft"
            width={20}
            height={20}
            color={canGoPreviousWeek ? PRIMARY_DARK : MUTED_TEXT_FAINT}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.headerInfo}>
        <Text fontSize={12} fontVariant="semibold" style={styles.weeklyTotal}>
          סה״כ השבוע: {formatSteps(weeklyGoalTotal)} צעדים
        </Text>
        {weekRangeLabel ? (
          <Text fontSize={10} fontVariant="semibold" style={styles.weekRange}>
            {weekRangeLabel}
          </Text>
        ) : null}
        <Text fontSize={11} fontVariant="semibold" style={styles.weeklyCompleted}>
          נעשו: {formatSteps(totalSteps)} צעדים
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    width: "100%",
  },
  headerInfo: {
    alignItems: "flex-end",
    flex: 1,
    flexShrink: 1,
  },
  weekNavRow: {
    alignItems: "center",
    flexDirection: "row-reverse",
    flexShrink: 0,
    gap: 6,
  },
  weekNavButton: {
    alignItems: "center",
    backgroundColor: "rgba(7,39,35,0.06)",
    borderRadius: 999,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  weekNavButtonDisabled: {
    opacity: 0.35,
  },
  weeklyTotal: {
    color: "rgba(7,39,35,0.4)",
    textAlign: "right",
  },
  weekRange: {
    color: MUTED_TEXT_FAINT,
    marginTop: 2,
    textAlign: "right",
  },
  weeklyCompleted: {
    color: GREEN_DARK,
    marginTop: 2,
    textAlign: "right",
  },
});

export default WeeklyStepsChartHeader;
