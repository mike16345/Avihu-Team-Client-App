import { View } from "react-native";
import { useMemo, useState } from "react";
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
import UpdateDataModal from "../ui/modals/UpdateDataModal";
import measurementSchema from "@/schemas/measurementSchema";
import useSaveMeasurement from "@/hooks/mutations/measurements/useSaveMeasurement";
import useDeleteMeasurement from "@/hooks/mutations/measurements/useDeleteMeasurement";

const NO_MEASUREMENT_TEXT = "אין נתוני היקף זמינים";

const MeasurementHistoryContent = () => {
  const { layout, spacing, text } = useStyles();
  const { data } = useMeasurementQuery();
  const { mutateAsync: save } = useSaveMeasurement();
  const { mutateAsync: remove } = useDeleteMeasurement();

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
          acc[muscle].byDate[date] = { value, _id: _id! };
        });
        return acc;
      },
      {} as Record<
        string,
        {
          dates: string[];
          byDate: Record<string, { value: number; _id: string }>;
        }
      >
    );
  }, [data]);

  const { selectedMeasurement, selectedMeasurementGroup } = useMemo(() => {
    const selectedMeasurementGroup =
      measurementsByMuscle[MEASUREMENT_GROUPS_ENGLISH[activeMuscle as MeasurementMuscle]];
    const selectedMeasurement = selectedMeasurementGroup?.byDate[selectedDate];

    return { selectedMeasurementGroup, selectedMeasurement };
  }, [activeMuscle, measurementsByMuscle, selectedDate]);

  const handleSave = async (value: string) => {
    try {
      const muscleInEnglish = MEASUREMENT_GROUPS_ENGLISH[activeMuscle as MeasurementMuscle];

      await save({ date: selectedDate, measurement: value, muscle: muscleInEnglish });
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleDelete = async () => {
    try {
      const muscleInEnglish = MEASUREMENT_GROUPS_ENGLISH[activeMuscle as MeasurementMuscle];

      await remove({ date: selectedDate, muscle: muscleInEnglish });
    } catch (error) {
      console.error(error);
    }
  };

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

      <View style={[layout.flexRow, spacing.gapSm, layout.itemsCenter, layout.center]}>
        <Text fontSize={16}>
          {selectedMeasurement ? `היקף ${selectedMeasurement?.value}` : NO_MEASUREMENT_TEXT}
        </Text>

        <UpdateDataModal
          date={selectedDate}
          label={`היקף ${activeMuscle}`}
          prefix={`היקף ${activeMuscle}`}
          placeholder="הכנס היקף"
          schema={measurementSchema}
          schemaKey="measurement"
          existingValue={selectedMeasurement?.value?.toString()}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      </View>
    </View>
  );
};

export default MeasurementHistoryContent;
