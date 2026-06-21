import { Card } from "@/components/ui/Card";
import SkeletonLoader from "@/components/ui/loaders/skeletons/SkeletonLoader";
import useStyles from "@/styles/useGlobalStyles";
import { View } from "react-native";

const ArticleGroupContentSkeleton = () => {
  const { layout, spacing } = useStyles();

  return (
    <View style={[layout.flex1, spacing.pdHorizontalLg, spacing.gap20]}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Card key={index} style={[spacing.gapLg]} shadow={false}>
          <SkeletonLoader height={22} width="55%" />
          <SkeletonLoader height={18} width="80%" />
          <SkeletonLoader height={150} />
          <View style={[layout.flexRow, spacing.gapLg]}>
            <SkeletonLoader height={18} width={48} />
            <SkeletonLoader height={18} width={48} />
          </View>
        </Card>
      ))}
    </View>
  );
};

export default ArticleGroupContentSkeleton;
