import useStyles from "@/styles/useGlobalStyles";
import { Text } from "@/components/ui/Text";
import HorizontalSelector from "@/components/ui/HorizontalSelector";
import { MEASUREMENT_MUSCLE_GROUPS } from "@/constants/measurements";
import { useState } from "react";
import MeasurementInput from "@/components/measurements/MeasurementInput";
import ProgressImageUpload from "@/components/measurements/ProgressImageUpload";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { View } from "react-native";

const MeasurementsWindow = () => {
  const { layout, spacing } = useStyles();

  const [activeMuscleGroup, setActiveMuscleGroup] = useState<string>(MEASUREMENT_MUSCLE_GROUPS[0]);

  return (
    <KeyboardAwareScrollView
      bottomOffset={100}
      nestedScrollEnabled
      style={layout.flex1}
      contentContainerStyle={[spacing.gapLg]}
    >
      <View style={[spacing.gapLg, { paddingStart: 24 }]}>
        <Text style={[layout.alignSelfStart]} fontSize={16}>
          מדידת היקפים
        </Text>

        <HorizontalSelector
          items={MEASUREMENT_MUSCLE_GROUPS}
          selected={activeMuscleGroup}
          onSelect={(selected) => setActiveMuscleGroup(selected)}
        />
      </View>

      <View style={[spacing.pdHorizontalLg, spacing.gapLg]}>
        <MeasurementInput activeMuscleGroup={activeMuscleGroup} />

        <ProgressImageUpload />
      </View>
    </KeyboardAwareScrollView>
  );
};

export default MeasurementsWindow;
