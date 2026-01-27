import { View } from "react-native";
import React from "react";
import { ISimpleCardioType } from "@/interfaces/Workout";
import useStyles from "@/styles/useGlobalStyles";
import { Text } from "@/components/ui/Text";
import { Card } from "@/components/ui/Card";
import { useCardioData } from "@/hooks/useCardioData";
import CardioWorkouts from "./CardioWorkouts";

interface SimpleCardioContainerProps {
  plan?: ISimpleCardioType;
}

const SimpleCardioContainer: React.FC<SimpleCardioContainerProps> = ({ plan }) => {
  const { colors, common, layout, spacing } = useStyles();

  const cardioData = useCardioData(plan);

  return (
    <View style={[common.rounded, , spacing.gapLg]}>
      <View style={[spacing.gapLg]}>
        {cardioData?.map(({ title, value }, i) => (
          <Card variant="gray" style={[layout.itemsCenter, spacing.pdDefault]} key={i}>
            <Text style={colors.textPrimary}>{title}</Text>

            {value}
          </Card>
        ))}

        <CardioWorkouts />
      </View>
    </View>
  );
};

export default SimpleCardioContainer;
