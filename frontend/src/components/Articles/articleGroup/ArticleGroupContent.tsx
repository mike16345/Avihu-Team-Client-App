import {
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
} from "react-native";
import React, { useMemo } from "react";
import useArticleQuery from "@/hooks/queries/articles/useArticleQuery";
import useStyles from "@/styles/useGlobalStyles";
import usePullDownToRefresh from "@/hooks/usePullDownToRefresh";
import { Text } from "../../ui/Text";
import ArticleCard from "../ArticleCard";
import { ConditionalRender } from "../../ui/ConditionalRender";
import ErrorScreen from "@/screens/ErrorScreen";
import CustomScrollView from "@/components/ui/scrollview/CustomScrollView";
import { useQueryClient } from "@tanstack/react-query";
import { ARTICLE_KEY } from "@/constants/reactQuery";

interface ArticleGroupContentProps {
  groupId: string;
}

const ArticleGroupContent: React.FC<ArticleGroupContentProps> = ({ groupId }) => {
  const queryClient = useQueryClient();

  const { layout, spacing, text } = useStyles();
  const { isRefreshing } = usePullDownToRefresh();

  const {
    data: articleRes,
    isFetchingNextPage,
    fetchNextPage,
    isLoading,
    isError,
  } = useArticleQuery(groupId);

  const articles = useMemo(() => {
    const articles = articleRes?.pages.flatMap((page) => page.results) ?? [];
    if ((!articles || !articles.length) && !isLoading)
      return <Text style={[text.textCenter, spacing.pdXl]}>לא נמצאו מאמרים לקבוצה זו</Text>;

    return articles.map((article) => <ArticleCard key={article._id} article={article} />);
  }, [articleRes?.pageParams, articleRes?.pages]);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: [ARTICLE_KEY + groupId] });
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
      <CustomScrollView
        style={[layout.flex1]}
        contentContainerStyle={[spacing.gap20, spacing.pdHorizontalLg]}
        onScroll={handleScroll}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
        topShadow={false}
      >
        {articles}
      </CustomScrollView>

      <ConditionalRender condition={isLoading || isFetchingNextPage}>
        <ActivityIndicator />
      </ConditionalRender>
    </>
  );
};

export default ArticleGroupContent;
