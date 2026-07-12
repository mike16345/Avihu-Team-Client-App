import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "@/components/ui/Text";
import useStyles from "@/styles/useGlobalStyles";
import { formatSteps } from "@/utils/stepsUtils";
import { DAY_FULL_NAMES, DayData, MUTED_TEXT } from "./stepsConstants";

interface DayDetailPanelProps {
  detail: DayData;
  detailValueFont: number;
}

const DayDetailPanel: React.FC<DayDetailPanelProps> = ({ detail, detailValueFont }) => {
  const { colors, common, spacing } = useStyles();

  const stepsLabel = detail.steps != null ? formatSteps(detail.steps) : "—";
  const caloriesLabel = detail.calories || "—";
  const dayName = DAY_FULL_NAMES[detail.label] ?? detail.label;

  return (
    <View style={[colors.backgroundSecondary, common.rounded, spacing.pdMd, styles.panel]}>
      <Text fontSize={11} style={styles.dayHeading}>
        יום {dayName}
      </Text>
      <View style={styles.row}>
        <View>
          <Text fontVariant="bold" fontSize={detailValueFont} style={colors.textPrimary}>
            {stepsLabel}
          </Text>
          <Text fontSize={11} style={styles.unit}>
            צעדים
          </Text>
        </View>
        <View>
          <Text fontVariant="bold" fontSize={detailValueFont} style={colors.textPrimary}>
            {caloriesLabel}
          </Text>
          <Text fontSize={11} style={styles.unit}>
            קלוריות
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  panel: {
    marginTop: 14,
  },
  dayHeading: {
    color: MUTED_TEXT,
    textAlign: "center",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  unit: {
    color: MUTED_TEXT,
  },
});

export default DayDetailPanel;
