import useStyles from "@/styles/useGlobalStyles";
import { View, Dimensions } from "react-native";
import SkeletonLoader from "./SkeletonLoader";

const DietPlanSkeleton = () => {
  const { height: viewportHeight } = Dimensions.get("window");
  const seventyVhHeight = viewportHeight * 0.7;
  const { layout, spacing } = useStyles();

  return (
    <View
      style={[
        layout.widthFull,
        spacing.pdMd,
        spacing.pdVerticalXxl,
        spacing.gapXxl,
        { height: seventyVhHeight },
      ]}
    >
      <View style={[layout.flexRowReverse, layout.justifyBetween, spacing.gapDefault]}>
        <SkeletonLoader height={70} style={{ width: `48%` }} />
        <SkeletonLoader height={70} style={{ width: `48%` }} />
      </View>
      <SkeletonLoader height={70} />
      <SkeletonLoader height={70} />
      <SkeletonLoader height={70} />
      <SkeletonLoader height={70} />
    </View>
  );
};

export default DietPlanSkeleton;
