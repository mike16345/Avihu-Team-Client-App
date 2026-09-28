import { Pressable, StyleSheet, View } from "react-native";
import Icon from "@/components/Icon/Icon";
import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import useStyles from "@/styles/useGlobalStyles";
import { Text } from "@/components/ui/Text";
import SecondaryButton from "@/components/ui/buttons/SecondaryButton";
import TipsModal from "@/components/ui/modals/TipsModal";
import DateUtils from "@/utils/dateUtils";
import DropDownContent from "../ui/dropwdown/DropDownContent";
import DropDownTrigger from "../ui/dropwdown/DropDownTrigger";
import useWorkoutPlanQuery from "@/hooks/queries/useWorkoutPlanQuery";
import { ConditionalRender } from "../ui/ConditionalRender";
import WorkoutProgressionPopup from "../WorkoutProgression/WorkoutProgressionPopup";

interface WorkoutPlanSelectorProps {
  selectedPlan: string;
  isCardio: boolean;
  overrideTips?: string[];
}

const WorkoutPlanSelector: React.FC<WorkoutPlanSelectorProps> = ({
  selectedPlan,
  isCardio,
  overrideTips,
}) => {
  const { layout, spacing, common } = useStyles();
  const { data } = useWorkoutPlanQuery();

  const [showTips, setShowTips] = useState(false);
  const [showProgression, setShowProgression] = useState(false);

  const tips = isCardio
    ? data?.cardio.plan.tips
      ? [data.cardio.plan.tips]
      : []
    : overrideTips && overrideTips.length > 0
      ? overrideTips
      : data?.tips || [];

  return (
    <>
      <View style={[spacing.gapDefault]}>
        <Card variant="gray" shadow={false} style={[spacing.gapLg, common.roundedMd]}>
          <Card.Header style={[spacing.pdVerticalDefault]}>
            <View style={[layout.flexRow, layout.justifyBetween, layout.itemsCenter]}>
              <Text fontVariant="bold">
                יום {DateUtils.getDay()} | {selectedPlan}
              </Text>

              <View style={[layout.flexRow, spacing.gapSm]}>
                <ConditionalRender condition={!isCardio}>
                  <Pressable
                    onPress={() => setShowProgression(true)}
                    hitSlop={8}
                    accessibilityLabel="התקדמות אימונים"
                    style={styles.iconBtn}
                  >
                    <Icon name="trendingUp" width={20} height={20} />
                  </Pressable>
                </ConditionalRender>
                <ConditionalRender condition={tips.length > 0}>
                  <SecondaryButton rightIcon="info" onPress={() => setShowTips(true)}>
                    דגשים לאימון
                  </SecondaryButton>
                </ConditionalRender>
              </View>
            </View>
          </Card.Header>
          <Card.Content style={{ zIndex: 2000, elevation: 2000 }}>
            <DropDownTrigger />
          </Card.Content>
        </Card>

        <DropDownContent />
      </View>

      <TipsModal
        tips={tips}
        useHtmlRenderer
        visible={showTips}
        onDismiss={() => setShowTips(false)}
      />
      <WorkoutProgressionPopup
        visible={showProgression}
        onClose={() => setShowProgression(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(7, 39, 35, 0.15)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
});

export default WorkoutPlanSelector;
