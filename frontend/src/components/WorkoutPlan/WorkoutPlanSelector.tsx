import { View } from "react-native";
import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import useStyles from "@/styles/useGlobalStyles";
import { Text } from "@/components/ui/Text";
import SecondaryButton from "@/components/ui/buttons/SecondaryButton";
import DropdownMenu from "@/components/ui/DropdownMenu";
import TipsModal from "@/components/ui/modals/TipsModal";
import { ItemType } from "react-native-dropdown-picker";
import DateUtils from "@/utils/dateUtils";

interface WorkoutPlanSelectorProps {
  plans: ItemType<string>[];
  selectedPlan: string;
  tips: string[];
  handleSelect: (val: string) => void;
}

const WorkoutPlanSelector: React.FC<WorkoutPlanSelectorProps> = ({
  plans,
  selectedPlan,
  tips,
  handleSelect,
}) => {
  const { layout, spacing, text } = useStyles();

  const [showTips, setShowTips] = useState(false);

  return (
    <>
      <Card variant="gray" style={spacing.gapLg}>
        <Card.Header>
          <View style={[layout.flexRow, layout.justifyBetween, layout.itemsCenter]}>
            <Text style={[text.textBold]}>
              יום {DateUtils.getDay()} | {selectedPlan}
            </Text>

            <SecondaryButton rightIcon="info" onPress={() => setShowTips(true)}>
              דגשים לאימון
            </SecondaryButton>
          </View>
        </Card.Header>
        <Card.Content style={{ zIndex: 2 }}>
          <DropdownMenu onSelect={handleSelect} items={plans || []} selectedValue={selectedPlan} />
        </Card.Content>
      </Card>

      <TipsModal tips={tips} visible={showTips} onDismiss={() => setShowTips(false)} />
    </>
  );
};

export default WorkoutPlanSelector;
