import {
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  ScrollView,
} from "react-native";
import React, { useMemo } from "react";
import useArticleQuery from "@/hooks/queries/articles/useArticleQuery";
import useStyles from "@/styles/useGlobalStyles";
import usePullDownToRefresh from "@/hooks/usePullDownToRefresh";
import { Text } from "../../ui/Text";
import ArticleCard from "../ArticleCard";
import { ConditionalRender } from "../../ui/ConditionalRender";
import ErrorScreen from "@/screens/ErrorScreen";

interface ArticleGroupContentProps {
  groupId: string;
}

const ArticleGroupContent: React.FC<ArticleGroupContentProps> = ({ groupId }) => {
  const { layout, spacing, text } = useStyles();
  const { isRefreshing } = usePullDownToRefresh();

  const {
    data: articleRes,
    isFetchingNextPage,
    fetchNextPage,
    isLoading,
    isError,
    refetch,
  } = useArticleQuery(groupId);

  const articles = useMemo(() => {
    const articles = articleRes?.pages.flatMap((page) => page.results) ?? [];
    if ((!articles || !articles.length) && !isLoading)
      return <Text style={[text.textCenter, spacing.pdXl]}>לא נמצאו מאמרים לקבוצה זו</Text>;

    return articles.map((article) => <ArticleCard key={article._id} article={article} />);
  }, [articleRes]);

  const handleRefresh = () => {
    refetch();
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;

    const paddingToBottom = 20; // optional buffer
    const isBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;

    if (!isBottom || isLoading || isFetchingNextPage) return;

    fetchNextPage();
  };

  if (isError) return <ErrorScreen />;

  return (
    <>
      <ScrollView
        style={[layout.flex1]}
        contentContainerStyle={[spacing.gap20]}
        onScroll={handleScroll}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      >
        {articles}
      </ScrollView>

      <ConditionalRender condition={isLoading || isFetchingNextPage}>
        <ActivityIndicator />
      </ConditionalRender>
    </>
  );
};

export default ArticleGroupContent;
