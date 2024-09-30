import useStyles from "@/styles/useGlobalStyles";
import React from "react";
import { View } from "react-native";
import SkeletonLoader from "./SkeletonLoader";

const WorkoutplanSkeleton = () => {
  const { layout, spacing } = useStyles();
  return (
    <View style={[layout.container, layout.heightFull, spacing.gapDefault, layout.itemsEnd]}>
      <SkeletonLoader height={40} />
      <SkeletonLoader height={20} width={50} />
      <SkeletonLoader height={80} />
      <SkeletonLoader height={80} />
      <SkeletonLoader height={80} />
      <SkeletonLoader height={80} />
      <SkeletonLoader height={80} />
    </View>
  );
};

export default WorkoutplanSkeleton;
