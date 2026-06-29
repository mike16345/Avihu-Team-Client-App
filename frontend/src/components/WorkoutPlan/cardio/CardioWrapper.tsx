import React from "react";
import { View } from "react-native";
import {
  ICardioPlan,
  IComplexCardioType,
  ISimpleCardioType,
  IStepsCardioType,
} from "@/interfaces/Workout";
import StepsCardioContainer from "./StepsCardioContainer";
import SimpleCardioContainer from "./SimpleCardioContainer";
import ComplexCardioWrapper from "./ComplexCardioWrapper";
import useStyles from "@/styles/useGlobalStyles";

interface CardioWrapperProps {
  cardioPlan?: ICardioPlan;
}

const getCardioContent = (cardioPlan?: ICardioPlan) => {
  if (!cardioPlan) {
    return null;
  }

  if (cardioPlan.type === "steps") {
    return <StepsCardioContainer plan={cardioPlan.plan as IStepsCardioType} />;
  }

  if (cardioPlan.type === "simple") {
    return <SimpleCardioContainer plan={cardioPlan.plan as ISimpleCardioType} />;
  }

  if (cardioPlan.type === "complex") {
    return <ComplexCardioWrapper plan={(cardioPlan.plan as IComplexCardioType).weeks} />;
  }

  return null;
};

const CardioWrapper: React.FC<CardioWrapperProps> = ({ cardioPlan }) => {
  const { layout } = useStyles();
  const cardioContent = getCardioContent(cardioPlan);

  return <View style={layout.flex1}>{cardioContent}</View>;
};

export default CardioWrapper;
