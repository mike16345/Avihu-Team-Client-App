import { View } from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import useStyles from "@/styles/useGlobalStyles";
import { MEASUREMENT_GROUPS_ENGLISH, MEASUREMENT_MUSCLE_GROUPS } from "@/constants/measurements";
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

  const sortedMeasurements = useMemo(() => {
    if (!data) return {};

    return data.measurements.reduce((acc, { date, _id, ...muscles }) => {
      Object.entries(muscles).forEach(([muscle, value]) => {
        if (!acc[muscle]) acc[muscle] = [];
        acc[muscle].push({ date, value });
      });
      return acc;
    }, {});
  }, [data]);

  const { selectedMeasurementsByDate, selectedMuscleDates } = useMemo(() => {
    const selectedMuscleMeasurements = sortedMeasurements[MEASUREMENT_GROUPS_ENGLISH[activeMuscle]];
    if (!selectedMuscleMeasurements) return {};

    const selectedMuscleDates = selectedMuscleMeasurements.map((measurement) => measurement.date);
    const selectedMeasurementsByDate = selectedMuscleMeasurements.reduce((acc, { date, value }) => {
      acc[date] = value;

      return acc;
    }, {});
    return { selectedMuscleDates, selectedMeasurementsByDate };
  }, [activeMuscle, sortedMeasurements]);

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
        dates={selectedMuscleDates}
      />

      <Text fontSize={16} style={[text.textCenter]}>
        {DateUtils.formatDate(selectedDate, "DD.MM.YY")}
      </Text>

      {/* Insert selected date value here or no value exists here */}
    </View>
  );
};

export default MeasurementHistoryContent;
