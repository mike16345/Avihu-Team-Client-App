import { View } from "react-native";
import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import useStyles from "@/styles/useGlobalStyles";
import { Text } from "@/components/ui/Text";
import SecondaryButton from "@/components/ui/buttons/SecondaryButton";
import TipsModal from "@/components/ui/modals/TipsModal";
import DateUtils from "@/utils/dateUtils";
import DropDownContent from "../ui/dropwdown/DropDownContent";
import DropDownTrigger from "../ui/dropwdown/DropDownTrigger";

interface WorkoutPlanSelectorProps {
  selectedPlan: string;
  tips: string[];
}

const WorkoutPlanSelector: React.FC<WorkoutPlanSelectorProps> = ({ selectedPlan, tips }) => {
  const { layout, spacing, common } = useStyles();

  const [showTips, setShowTips] = useState(false);

  return (
    <>
      <View style={spacing.gapDefault}>
        <Card variant="gray" style={[spacing.gapLg, common.roundedMd]}>
          <Card.Header>
            <View style={[layout.flexRow, layout.justifyBetween, layout.itemsCenter]}>
              <Text fontVariant="bold">
                יום {DateUtils.getDay()} | {selectedPlan}
              </Text>

              <SecondaryButton rightIcon="info" onPress={() => setShowTips(true)}>
                דגשים לאימון
              </SecondaryButton>
            </View>
          </Card.Header>
          <Card.Content style={{ zIndex: 2000, elevation: 2000 }}>
            <DropDownTrigger />
          </Card.Content>
        </Card>

        <DropDownContent />
      </View>

      <TipsModal tips={tips} visible={showTips} onDismiss={() => setShowTips(false)} />
    </>
  );
};

export default WorkoutPlanSelector;
