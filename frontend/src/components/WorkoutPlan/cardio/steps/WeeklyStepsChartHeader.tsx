import { semanticColors } from "@/themes/semanticColors";
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
      <View>
        {weekRangeLabel ? (
          <Text fontSize={10} fontVariant="semibold" style={styles.weekRange}>
            {weekRangeLabel}
          </Text>
        ) : null}
        <View style={styles.weekNavRow}>
          <TouchableOpacity
            activeOpacity={0.6}
            hitSlop={8}
            disabled={!canGoPreviousWeek}
            onPress={onPreviousWeek}
            style={[!canGoPreviousWeek && styles.weekNavButtonDisabled]}
          >
            <Icon
              name="chevronRightSoft"
              width={20}
              height={20}
              color={canGoPreviousWeek ? PRIMARY_DARK : MUTED_TEXT_FAINT}
            />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.6}
            hitSlop={8}
            disabled={!canGoNextWeek}
            onPress={onNextWeek}
            style={[!canGoNextWeek && styles.weekNavButtonDisabled]}
          >
            <Icon
              name="chevronLeftSoft"
              width={20}
              height={20}
              color={canGoNextWeek ? PRIMARY_DARK : MUTED_TEXT_FAINT}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.headerInfo}>
        <Text fontSize={12} fontVariant="semibold" style={styles.weeklyTotal}>
          סה״כ השבוע: {formatSteps(weeklyGoalTotal)} צעדים
        </Text>

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
    flexDirection: "row",
    flexShrink: 0,
    gap: 6,
  },

  weekNavButtonDisabled: {
    opacity: 0.35,
  },
  weeklyTotal: {
    color: semanticColors.app.stepsHeaderMuted,
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
