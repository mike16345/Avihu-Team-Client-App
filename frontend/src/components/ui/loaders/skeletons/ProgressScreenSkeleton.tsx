import useStyles from "@/styles/useGlobalStyles";
import React from "react";
import { View } from "react-native";
import SkeletonLoader from "./SkeletonLoader";

const ProgressScreenSkeleton = () => {
  const { layout, spacing } = useStyles();
  return (
    <View
      style={[
        spacing.pdStatusBar,
        layout.flex1,
        layout.heightFull,
        layout.widthFull,
        spacing.pdMd,
        spacing.gapMd,
      ]}
    >
      <SkeletonLoader height={260} />
      <SkeletonLoader height={260} />
      <SkeletonLoader height={30} />
      <View style={[layout.flexRow, layout.center, layout.widthFull, spacing.gapDefault]}>
        <SkeletonLoader height={100} width={`48%`} />
        <SkeletonLoader height={100} width={`48%`} />
      </View>
    </View>
  );
};

export default ProgressScreenSkeleton;
