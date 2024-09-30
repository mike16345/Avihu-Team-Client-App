import useStyles from "@/styles/useGlobalStyles";
import { View } from "react-native";
import SkeletonLoader from "./SkeletonLoader";

const WorkoutPlanSkeleton = () => {
  const { layout, spacing } = useStyles();
  
  return (
    <View style={[layout.container, layout.heightFull, spacing.gapLg, layout.itemsEnd]}>
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

export default WorkoutPlanSkeleton;
