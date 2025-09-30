import { View, Image, useWindowDimensions, Keyboard } from "react-native";
import { Card } from "../ui/Card";
import useStyles from "@/styles/useGlobalStyles";
import meausrementPhoto from "@assets/measurement_photo.png";
import { Text } from "../ui/Text";
import {
  MEASUREMENT_DESCRIPTIONS,
  MEASUREMENT_GROUPS_ENGLISH,
  MeasurementMuscle,
} from "@/constants/measurements";
import Input from "../ui/inputs/Input";
import PrimaryButton from "../ui/buttons/PrimaryButton";
import { useState } from "react";
import measurementSchema from "@/schemas/measurementSchema";
import { useToast } from "@/hooks/useToast";
import useSaveMeasurement from "@/hooks/mutations/measurements/useSaveMeasurement";
import DateUtils from "@/utils/dateUtils";
import MeasurementHistoryModal from "./MeasurementHistoryModal";

interface MeasurementInputProps {
  activeMuscleGroup: string;
}

const MeasurementInput: React.FC<MeasurementInputProps> = ({ activeMuscleGroup }) => {
  const { width } = useWindowDimensions();
  const { triggerErrorToast } = useToast();
  const { common, layout, spacing, text } = useStyles();
  const { mutate, isPending } = useSaveMeasurement();

  const [measurement, setMeasurement] = useState<string>();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!measurement) return;

    Keyboard.dismiss();

    const result = measurementSchema.safeParse({ measurement: +measurement });

    if (!result.success) {
      const message = result.error.errors[0]?.message ?? "שגיאה לא ידועה";

      triggerErrorToast({ message });
      setError(message);

      return;
    }

    const today = DateUtils.getCurrentDate("YYYY-MM-DD");
    const muscleGroupsInEnglish =
      MEASUREMENT_GROUPS_ENGLISH[activeMuscleGroup as MeasurementMuscle];

    setError(null);
    mutate({ measurement, muscle: muscleGroupsInEnglish, date: today });
    setMeasurement(undefined);
  };

  return (
    <Card
      variant="gray"
      style={[{ padding: 0 }, spacing.gapLg, layout.flex1, layout.widthFull, common.roundedMd]}
    >
      <Card.Header>
        <Image
          source={meausrementPhoto}
          height={0.5}
          style={[layout.widthFull, common.roundedMd]}
        />
      </Card.Header>
      <Card.Content style={[{ paddingBottom: 20 }, spacing.gapLg]}>
        <Text style={[text.textCenter, { minHeight: 45 }]} fontSize={16}>
          {MEASUREMENT_DESCRIPTIONS[activeMuscleGroup as MeasurementMuscle]}
        </Text>

        <View style={[layout.flexRow, spacing.gap20, layout.justifyCenter, layout.itemsCenter]}>
          <MeasurementHistoryModal />

          <Input
            placeholder="רשמו כאן את המידה"
            keyboardType="decimal-pad"
            error={!!error}
            style={{ width: width * 0.4 }}
            value={measurement}
            onChangeText={(val) => setMeasurement(val)}
          />
        </View>

        <View style={[layout.center]}>
          <PrimaryButton
            onPress={handleSubmit}
            disabled={!measurement}
            loading={isPending}
            block
            style={{ width: width * 0.6 }}
          >
            שליחה
          </PrimaryButton>
        </View>
      </Card.Content>
    </Card>
  );
};

export default MeasurementInput;
