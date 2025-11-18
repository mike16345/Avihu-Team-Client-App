import useStyles from "@/styles/useGlobalStyles";
import { Text } from "@/components/ui/Text";
import HorizontalSelector from "@/components/ui/HorizontalSelector";
import { MEASUREMENT_MUSCLE_GROUPS } from "@/constants/measurements";
import { useState } from "react";
import MeasurementInput from "@/components/measurements/MeasurementInput";
import ProgressImageUpload from "@/components/measurements/ProgressImageUpload";
import { View } from "react-native";
import CustomScrollView from "@/components/ui/scrollview/CustomScrollView";

const MeasurementsWindow = () => {
  const { layout, spacing } = useStyles();

  const [activeMuscleGroup, setActiveMuscleGroup] = useState<string>(MEASUREMENT_MUSCLE_GROUPS[0]);

  return (
    <CustomScrollView
      bottomOffset={100}
      nestedScrollEnabled
      style={layout.flex1}
      contentContainerStyle={[spacing.gapLg]}
    >
      <View style={[spacing.gapLg]}>
        <Text style={[layout.alignSelfStart, { paddingStart: 24 }]} fontSize={16}>
          מדידת היקפים
        </Text>

        <HorizontalSelector
          items={MEASUREMENT_MUSCLE_GROUPS}
          selected={activeMuscleGroup}
          onSelect={(selected) => setActiveMuscleGroup(selected)}
          style={{ paddingStart: 24 }}
        />
      </View>

      <View style={[spacing.pdHorizontalLg, spacing.gapLg]}>
        <MeasurementInput activeMuscleGroup={activeMuscleGroup} />

        <ProgressImageUpload />
      </View>
    </CustomScrollView>
  );
};

export default MeasurementsWindow;
