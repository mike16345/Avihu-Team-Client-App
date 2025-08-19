import React from "react";
import { muscleImageName, muscleImages } from "@/constants/muscleGroups";

interface MuscleDisplayProps {
  name?: muscleImageName;
  width: number;
  height: number;
}

const MuscleDisplay: React.FC<MuscleDisplayProps> = ({ height, name, width }) => {
  const MuscleImage = muscleImages[name];

  if (!muscleImages) return null;

  return <MuscleImage height={height} width={width} />;
};

export default MuscleDisplay;
