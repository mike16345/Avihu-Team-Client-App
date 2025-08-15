import useStyles from "@/styles/useGlobalStyles";
import { View } from "react-native";
import SkeletonLoader from "./SkeletonLoader";

const WorkoutPlanSkeletonLoader = () => {
  const { layout, spacing, colors } = useStyles();

  return (
    <View
      style={[
        layout.container,
        layout.heightFull,
        spacing.gapLg,
        layout.itemsEnd,
        spacing.pdLg,
        colors.background,
      ]}
    >
      <SkeletonLoader height={120} style={spacing.mgVerticalLg} />
      <SkeletonLoader height={30} width={70} style={layout.alignSelfStart} />
      <SkeletonLoader height={80} />
      <SkeletonLoader height={80} />
      <SkeletonLoader height={30} width={70} style={layout.alignSelfStart} />
      <SkeletonLoader height={80} />
      <SkeletonLoader height={80} />
      <SkeletonLoader height={80} />
    </View>
  );
};

export default WorkoutPlanSkeletonLoader;
