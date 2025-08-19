import { View, Text, Image } from "react-native";
import React from "react";
import { muscleImages } from "@/constants/muscleGroups";
import torseFront from "@assets/muscles/torso_front.svg";

const MuscleDisplay = () => {
  return <Image source={torseFront} height={100} width={100} style={{ width: 100, height: 100 }} />;
};

export default MuscleDisplay;
