import { View } from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import useStyles from "@/styles/useGlobalStyles";
import {
  MEASUREMENT_GROUPS_ENGLISH,
  MEASUREMENT_MUSCLE_GROUPS,
  MeasurementMuscle,
} from "@/constants/measurements";
import HorizontalSelector from "../ui/HorizontalSelector";
import CustomCalendar from "../Calendar/CustomCalendar";
import DateUtils from "@/utils/dateUtils";
import { Text } from "../ui/Text";
import useMeasurementQuery from "@/hooks/queries/measurements/useMeasurementQuery";

const MeasurementHistoryContent = () => {
  const { colors, common, fonts, layout, spacing, text } = useStyles();
  const { data, error, isPending, isError } = useMeasurementQuery();

  const [activeMuscle, setActiveMuscle] = useState<string>(MEASUREMENT_MUSCLE_GROUPS[0]);
  const [selectedDate, setSelectedDate] = useState<string>(DateUtils.getCurrentDate("YYYY-MM-DD"));

  const measurementsByMuscle = useMemo(() => {
    if (!data) return {};

    return data.measurements.reduce(
      (acc, { date, _id, ...muscles }) => {
        Object.entries(muscles).forEach(([muscle, value]) => {
          if (!acc[muscle]) {
            acc[muscle] = {
              dates: [],
              byDate: {},
            };
          }

          acc[muscle].dates.push(date);
          acc[muscle].byDate[date] = value;
        });
        return acc;
      },
      {} as Record<
        string,
        {
          dates: string[];
          byDate: Record<string, number>;
        }
      >
    );
  }, [data]);

  const selectedMeasurementGroup = useMemo(
    () => measurementsByMuscle[MEASUREMENT_GROUPS_ENGLISH[activeMuscle as MeasurementMuscle]],
    [activeMuscle, measurementsByMuscle]
  );

  return (
    <View style={[spacing.gapXxl]}>
      <HorizontalSelector
        items={MEASUREMENT_MUSCLE_GROUPS}
        selected={activeMuscle}
        onSelect={(selected) => setActiveMuscle(selected)}
      />

      <CustomCalendar
        selectedDate={selectedDate}
        onSelect={(date) => setSelectedDate(date)}
        dates={selectedMeasurementGroup?.dates}
      />

      <Text fontSize={16} style={[text.textCenter]}>
        {DateUtils.formatDate(selectedDate, "DD.MM.YY")}
      </Text>

      <Text>{selectedMeasurementGroup?.byDate[selectedDate] || "none"}</Text>
    </View>
  );
};

export default MeasurementHistoryContent;
