import { TouchableOpacity, View } from "react-native";
import { ArticleStackParamsList } from "@/types/navigatorTypes";
import { RouteProp, useRoute } from "@react-navigation/native";
import useStyles from "@/styles/useGlobalStyles";
import ArticleGroupHeader from "./ArticleGroupHeader";

const ArticleGroupScreen = () => {
  const { colors, common, fonts, layout, spacing, text } = useStyles();
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
    </View>
  );
};

export default ArticleGroupScreen;
