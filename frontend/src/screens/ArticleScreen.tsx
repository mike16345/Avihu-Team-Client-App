import ArticleGroup from "@/components/Articles/ArticleGroup";
import { Text } from "@/components/ui/Text";
import useArticleCountQuery from "@/hooks/queries/articles/useArticleCountQuery";
import useStyles from "@/styles/useGlobalStyles";
import { useEffect, useMemo } from "react";
import { ScrollView, View } from "react-native";

const ArticleScreen = () => {
  const { colors, common, fonts, layout, spacing, text } = useStyles();

  const { data, isLoading, isError, error } = useArticleCountQuery();

  const articleGroups = useMemo(() => {
    if (!data) return [];

    return data.map((group, i) => <ArticleGroup key={i} articleGroup={group} />);
  }, [data]);

  return (
    <ScrollView
      style={[colors.background, layout.flex1]}
      contentContainerStyle={[
        layout.itemsStart,
        spacing.gap20,
        spacing.pdLg,
        spacing.pdStatusBar,
        spacing.pdBottomBar,
      ]}
    >
      <Text fontSize={24} fontVariant="light">
        מאמרים
      </Text>

      {articleGroups}
    </ScrollView>
  );
};

export default ArticleScreen;
