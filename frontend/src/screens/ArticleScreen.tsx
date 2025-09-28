import ArticleGroup from "@/components/Articles/ArticleGroup";
import ArticleSkeleton from "@/components/ui/loaders/skeletons/ArticleSkeleton";
import { Text } from "@/components/ui/Text";
import useArticleCountQuery from "@/hooks/queries/articles/useArticleCountQuery";
import useStyles from "@/styles/useGlobalStyles";
import { useMemo } from "react";
import { ScrollView } from "react-native";

const ArticleScreen = () => {
  const { colors, layout, spacing, text } = useStyles();

  const { data, isLoading } = useArticleCountQuery();

  const articleGroups = useMemo(() => {
    if (!data)
      return (
        <Text style={[text.textCenter, layout.widthFull, spacing.pdVertical20]}>
          אין מאמרים להצגה
        </Text>
      );

    return data.map((group, i) => <ArticleGroup key={i} articleGroup={group} />);
  }, [data]);

  if (isLoading) return <ArticleSkeleton />;

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
