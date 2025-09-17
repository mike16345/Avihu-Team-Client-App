import { KeyboardAvoidingView, ScrollView } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import { Text } from "@/components/ui/Text";
import HorizontalSelector from "@/components/ui/HorizontalSelector";
import { MEASUREMENT_MUSCLE_GROUPS } from "@/constants/measurements";
import { useState } from "react";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import MeasurementInput from "@/components/measurements/MeasurementInput";

const MeasurementsWindow = () => {
  const { layout, colors, common, fonts, spacing, text } = useStyles();

  const [activeMuscleGroup, setActiveMuscleGroup] = useState<string>(MEASUREMENT_MUSCLE_GROUPS[0]);

  return (
    <KeyboardAvoidingView behavior="padding" style={[layout.flex1]}>
      <ScrollView
        nestedScrollEnabled
        style={layout.flex1}
        contentContainerStyle={[spacing.gap20, spacing.pdLg]}
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

        <PrimaryButton mode="light" block icon="camera">
          <Text fontSize={16} fontVariant="bold">
            העלאת תמונת התקדמות
          </Text>
        </PrimaryButton>

        <Text style={text.textCenter} fontVariant="light">
          העלו תמונה של ההתקדמות שלכם למאמן
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default MeasurementsWindow;
