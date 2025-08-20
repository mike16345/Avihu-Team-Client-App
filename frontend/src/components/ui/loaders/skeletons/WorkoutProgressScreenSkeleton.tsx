import useStyles from "@/styles/useGlobalStyles";
import React from "react";
import { useWindowDimensions, View } from "react-native";
import SkeletonLoader from "./SkeletonLoader";

const WorkoutProgressScreenSkeleton = () => {
  const { layout, spacing, colors } = useStyles();

  const { width } = useWindowDimensions();

  return (
    <View
      style={[
        layout.flex1,
        layout.heightFull,
        layout.widthFull,
        spacing.pdMd,
        spacing.gapMd,
        colors.background,
        ,
        { overflow: "hidden" },
      ]}
    >
      <View style={[layout.flexRow, spacing.gapDefault]}>
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonLoader key={i} height={40} width={width / 5} />
        ))}
      </View>

      <SkeletonLoader height={200} />
      <SkeletonLoader style={layout.flex1} />
      <SkeletonLoader height={40} />
    </View>
  );
};

export default WorkoutProgressScreenSkeleton;
