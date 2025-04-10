import { View, Text } from "react-native";
import React from "react";
import { ICardioPlan } from "@/interfaces/Workout";
import SimpleCardioContainer from "./SimpleCardioContainer";
import ComplexCardioWrapper from "./ComplexCardioWrapper";
import useStyles from "@/styles/useGlobalStyles";
import { ConditionalRender } from "@/components/ui/ConditionalRender";

interface CardioWrapperProps {
  cardioPlan?: ICardioPlan;
}

const CardioWrapper: React.FC<CardioWrapperProps> = ({ cardioPlan }) => {
  const { colors, layout, spacing } = useStyles();

  return (
    <View style={[colors.background, layout.heightFull, spacing.pdHorizontalDefault]}>
      <Text>CardioWrapper</Text>
      <ConditionalRender condition={cardioPlan?.type == `simple`}>
        <SimpleCardioContainer plan={cardioPlan?.plan} />
      </ConditionalRender>
      <ConditionalRender condition={cardioPlan?.type == `complex`}>
        <ComplexCardioWrapper plan={cardioPlan?.plan?.weeks || []} />
      </ConditionalRender>
    </View>
  );
};

export default CardioWrapper;
