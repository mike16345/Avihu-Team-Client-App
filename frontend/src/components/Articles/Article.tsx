import { ArticleStackParamsList } from "@/types/navigatorTypes";
import { RouteProp, useRoute } from "@react-navigation/native";
import { View, Text } from "react-native";

const Article = () => {
  const route = useRoute<RouteProp<ArticleStackParamsList, "ViewArticle">>();
  const { articleId } = route.params;

  return (
    <View>
      <Text>Article</Text>
      <Text>{articleId}</Text>
    </View>
  );
};

export default Article;
