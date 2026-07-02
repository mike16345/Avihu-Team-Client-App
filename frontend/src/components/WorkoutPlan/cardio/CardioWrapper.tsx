import React from "react";
import {
  ICardioPlan,
  IComplexCardioType,
  ISimpleCardioType,
  IStepsCardioType,
} from "@/interfaces/Workout";
import StepsCardioContainer from "./StepsCardioContainer";
import SimpleCardioContainer from "./SimpleCardioContainer";
import ComplexCardioWrapper from "./ComplexCardioWrapper";

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
  return getCardioContent(cardioPlan);
};

export default CardioWrapper;
