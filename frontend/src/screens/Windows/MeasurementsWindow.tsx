import useStyles from "@/styles/useGlobalStyles";
import { Text } from "@/components/ui/Text";
import HorizontalSelector from "@/components/ui/HorizontalSelector";
import { MEASUREMENT_MUSCLE_GROUPS } from "@/constants/measurements";
import { useState } from "react";
import MeasurementInput from "@/components/measurements/MeasurementInput";
import ProgressImageUpload from "@/components/measurements/ProgressImageUpload";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

const MeasurementsWindow = () => {
  const { layout, spacing } = useStyles();

  const [activeMuscleGroup, setActiveMuscleGroup] = useState<string>(MEASUREMENT_MUSCLE_GROUPS[0]);

  return (
    <KeyboardAwareScrollView
      bottomOffset={100}
      nestedScrollEnabled
      style={layout.flex1}
      contentContainerStyle={[spacing.gapLg, spacing.pdHorizontalLg]}
    >
      <Text style={layout.alignSelfStart} fontSize={16}>
        מדידת היקפים
      </Text>

      <HorizontalSelector
        items={MEASUREMENT_MUSCLE_GROUPS}
        selected={activeMuscleGroup}
        onSelect={(selected) => setActiveMuscleGroup(selected)}
      />

      <MeasurementInput activeMuscleGroup={activeMuscleGroup} />

      <ProgressImageUpload />
    </KeyboardAwareScrollView>
  );
};

export default MeasurementsWindow;
