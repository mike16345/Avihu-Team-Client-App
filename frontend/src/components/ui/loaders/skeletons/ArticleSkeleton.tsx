import { View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import SkeletonLoader from "./SkeletonLoader";

const ArticleSkeleton = () => {
  const { spacing } = useStyles();

  return (
    <View style={[spacing.gap20, spacing.pdBottomBar, spacing.pdStatusBar, spacing.pdLg]}>
      <SkeletonLoader height={30} width={80} />

      {Array.from({ length: 5 }).map((_, i) => (
        <SkeletonLoader key={i} height={100} />
      ))}
    </View>
  );
};

export default ArticleSkeleton;
