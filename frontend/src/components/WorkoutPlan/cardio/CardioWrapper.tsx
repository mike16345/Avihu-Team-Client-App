import React from "react";
import { View } from "react-native";
import { ICardioPlan, IStepsCardioType, ISimpleCardioType } from "@/interfaces/Workout";
import StepsCardioContainer from "./StepsCardioContainer";
import SimpleCardioContainer from "./SimpleCardioContainer";
import useStyles from "@/styles/useGlobalStyles";

interface CardioWrapperProps {
  cardioPlan?: ICardioPlan;
}

const CardioWrapper: React.FC<CardioWrapperProps> = ({ cardioPlan }) => {
  const { layout } = useStyles();

  const renderCardio = () => {
    if (!cardioPlan) return null;
    if (cardioPlan.type === "steps") {
      return <StepsCardioContainer plan={cardioPlan.plan as IStepsCardioType} />;
    }
    if (cardioPlan.type === "simple") {
      return <SimpleCardioContainer plan={cardioPlan.plan as ISimpleCardioType} />;
    }
    return null;
  };

  return <View style={[layout.flex1, { backgroundColor: "#FFFFFF" }]}>{renderCardio()}</View>;
};

export default CardioWrapper;
