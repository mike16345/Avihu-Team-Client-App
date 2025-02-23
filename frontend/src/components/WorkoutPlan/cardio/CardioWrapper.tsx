import { View, Text } from "react-native";
import React from "react";
import { ICardioPlan } from "@/interfaces/Workout";
import SimpleCardioContainer from "./SimpleCardioContainer";
import ComplexCardioWrapper from "./ComplexCardioWrapper";
import useStyles from "@/styles/useGlobalStyles";

interface CardioWrapperProps {
  cardioPlan?: ICardioPlan;
}

const CardioWrapper: React.FC<CardioWrapperProps> = ({ cardioPlan }) => {
  const { colors, layout, spacing } = useStyles();

  return (
    <View style={[colors.background, layout.heightFull, spacing.pdHorizontalDefault]}>
      <Text>CardioWrapper</Text>
      {cardioPlan?.type == `simple` && <SimpleCardioContainer plan={cardioPlan.plan} />}
      {cardioPlan?.type == `complex` && <ComplexCardioWrapper plan={cardioPlan.plan.weeks} />}
    </View>
  );
};

export default CardioWrapper;
