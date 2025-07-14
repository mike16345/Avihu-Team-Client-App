import useStyles from "@/styles/useGlobalStyles";
import React from "react";
import { View } from "react-native";
import SkeletonLoader from "./SkeletonLoader";

const WorkoutProgressScreenSkeleton = () => {
  const { layout, spacing, colors } = useStyles();
  return (
    <View
      style={[
        layout.flex1,
        layout.heightFull,
        layout.widthFull,
        spacing.pdMd,
        spacing.gapMd,
        colors.background,
      ]}
    >
      <SkeletonLoader height={40} />
      <SkeletonLoader height={40} />
      <SkeletonLoader height={260} />
      <SkeletonLoader height={260} />
    </View>
  );
};

export default WorkoutProgressScreenSkeleton;
