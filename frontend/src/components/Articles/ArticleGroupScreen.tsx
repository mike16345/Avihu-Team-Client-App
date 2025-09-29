import { View } from "react-native";
import { ArticleStackParamsList } from "@/types/navigatorTypes";
import { RouteProp, useRoute } from "@react-navigation/native";
import useStyles from "@/styles/useGlobalStyles";
import ArticleGroupHeader from "./ArticleGroupHeader";
import ArticleGroupContent from "./ArticleGroupContent";

const ArticleGroupScreen = () => {
  const { colors, layout, spacing } = useStyles();
  const route = useRoute<RouteProp<ArticleStackParamsList, "ArticleGroup">>();
  const { articleGroup } = route.params;

  return (
    <View
      style={[
        spacing.pdStatusBar,
        spacing.pdBottomBar,
        colors.background,
        spacing.pdLg,
        layout.flex1,
        spacing.gap20,
      ]}
    >
      <ArticleGroupHeader articleGroup={articleGroup} />

      <ArticleGroupContent groupId={articleGroup.id} />
    </View>
  );
};

export default ArticleGroupScreen;
