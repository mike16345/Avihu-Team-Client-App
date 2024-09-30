import useStyles from "@/styles/useGlobalStyles";
import React from "react";
import { Skeleton } from "@rneui/base";
import { ViewStyle } from "react-native";

interface SkeletonLoaderProps extends React.ComponentProps<typeof Skeleton> {
  style?: ViewStyle | ViewStyle[];
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ style, ...props }) => {
  const { colors, common } = useStyles();

  return (
    <Skeleton
      {...props}
      style={[{ ...style }, colors.background, { opacity: 0.5 }, common.rounded]}
    />
  );
};

export default SkeletonLoader;
