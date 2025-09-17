import { View, Image, TouchableOpacity, useWindowDimensions } from "react-native";
import { Card } from "../ui/Card";
import useStyles from "@/styles/useGlobalStyles";
import meausrementPhoto from "@assets/measurement_photo.png";
import { Text } from "../ui/Text";
import { MEASUREMENT_DESCRIPTIONS, MeasurementMuscle } from "@/constants/measurements";
import Input from "../ui/inputs/Input";
import PrimaryButton from "../ui/buttons/PrimaryButton";

interface MeasurementInputProps {
  activeMuscleGroup: string;
}

const MeasurementInput: React.FC<MeasurementInputProps> = ({ activeMuscleGroup }) => {
  const { width } = useWindowDimensions();
  const { colors, common, layout, spacing, text } = useStyles();

  return (
    <Card variant="gray" style={[{ padding: 0 }, layout.flex1, layout.widthFull, common.roundedMd]}>
      <Card.Header>
        <Image
          source={meausrementPhoto}
          height={0.5}
          style={[layout.widthFull, common.roundedMd]}
        />
      </Card.Header>
      <Card.Content style={[spacing.pdLg, spacing.gap20]}>
        <Text style={[text.textCenter]} fontSize={16}>
          {MEASUREMENT_DESCRIPTIONS[activeMuscleGroup as MeasurementMuscle]}
        </Text>

        <View style={[layout.flexRow, spacing.gap20, layout.justifyCenter, layout.itemsCenter]}>
          <TouchableOpacity>
            <Text fontSize={16} fontVariant="bold">
              לצפייה בהיקפים
            </Text>
          </TouchableOpacity>

          <Input placeholder="רשמו כאן את המידה" keyboardType="decimal-pad" />
        </View>

        <View style={[layout.center]}>
          <PrimaryButton block style={{ width: width * 0.6 }}>
            שליחה
          </PrimaryButton>
        </View>
      </Card.Content>
    </Card>
  );
};

export default MeasurementInput;
