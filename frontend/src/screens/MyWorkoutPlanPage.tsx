import { ScrollView, View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import SecondaryButton from "@/components/ui/buttons/SecondaryButton";
import DropdownMenu from "@/components/ui/DropdownMenu";
import { MOCK_WORKOUT_PLAN } from "@/constants/mockData";
import { useState } from "react";
import { IWorkoutPlan } from "@/interfaces/Workout";
import MuscleGroupContainer from "@/components/WorkoutPlan/new/MuscleGroupContainer";
import TipsModal from "@/components/ui/modals/TipsModal";

const MyWorkoutPlanScreen = () => {
  const { colors, common, fonts, layout, spacing, text } = useStyles();

  const plans = MOCK_WORKOUT_PLAN.workoutPlans.map((p) => {
    return { label: p.planName, value: p._id };
  });

  const [selectedPlan, setSelectedPlan] = useState<IWorkoutPlan>(MOCK_WORKOUT_PLAN.workoutPlans[0]);
  const [showTips, setShowTips] = useState(false);

  const handleSelect = (val: any) => {
    const selected = MOCK_WORKOUT_PLAN.workoutPlans.find((plan) => plan._id === val);

    setSelectedPlan(selected);
  };

  return (
    <>
      <View
        style={[
          colors.background,
          layout.flex1,
          spacing.pdStatusBar,
          spacing.pdBottomBar,
          spacing.pdDefault,
          spacing.gapLg,
        ]}
      >
        <Card variant="gray" style={[spacing.gapLg]}>
          <Card.Header>
            <View style={[layout.flexRow, layout.justifyBetween, layout.itemsCenter]}>
              <Text style={[text.textBold]}>יום שלישי | אימון D</Text>

              <SecondaryButton rightIcon="info" onPress={() => setShowTips(true)}>
                דגשים לאימון
              </SecondaryButton>
            </View>
          </Card.Header>
          <Card.Content>
            <DropdownMenu
              onSelect={handleSelect}
              items={plans}
              selectedValue={selectedPlan.planName}
            />
          </Card.Content>
        </Card>

        <ScrollView
          style={[{ zIndex: -1 }, layout.flex1]}
          contentContainerStyle={[spacing.gapXxl, spacing.pdDefault, spacing.pdBottomBar]}
        >
          {selectedPlan.muscleGroups.map((muscleGroup, i) => (
            <MuscleGroupContainer key={i} muscleGroup={muscleGroup} />
          ))}
        </ScrollView>
      </View>

      <TipsModal
        tips={MOCK_WORKOUT_PLAN.tips}
        visible={showTips}
        onDismiss={() => setShowTips(false)}
      />
    </>
  );
};

export default MyWorkoutPlanScreen;
