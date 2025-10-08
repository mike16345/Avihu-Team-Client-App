import {
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  ScrollView,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import useArticleQuery from "@/hooks/queries/articles/useArticleQuery";
import useStyles from "@/styles/useGlobalStyles";
import usePullDownToRefresh from "@/hooks/usePullDownToRefresh";
import { Text } from "../../ui/Text";
import ArticleCard from "../ArticleCard";
import { IArticle } from "@/interfaces/IArticle";
import { ConditionalRender } from "../../ui/ConditionalRender";
import ErrorScreen from "@/screens/ErrorScreen";

const PAGINATION_LIMIT = 5;

interface ArticleGroupContentProps {
  groupId: string;
}

const ArticleGroupContent: React.FC<ArticleGroupContentProps> = ({ groupId }) => {
  const { layout, spacing, text } = useStyles();
  const { isRefreshing, refresh } = usePullDownToRefresh();

  const [page, setPage] = useState<number>(1);
  const [data, setData] = useState<IArticle[]>([]);

  const {
    data: articleRes,
    isLoading,
    isError,
    refetch,
  } = useArticleQuery({
    limit: PAGINATION_LIMIT,
    page: page,
    query: { group: groupId },
  });

  const articles = useMemo(() => {
    if ((!data || !data.length) && !isLoading)
      return <Text style={[text.textCenter, spacing.pdXl]}>לא נמצאו מאמרים לקבוצה זו</Text>;

    return data.map((article) => <ArticleCard key={article._id} article={article} />);
  }, [data]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;

    const paddingToBottom = 20; // optional buffer
    const isBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;

    if (!isBottom || !articleRes?.hasNextPage || isLoading) return;

    setPage((prev) => prev + 1);
  };

  useEffect(() => {
    if (!articleRes?.results || page * PAGINATION_LIMIT === data.length) return;

    setData((prev) => [...prev, ...articleRes.results]);
  }, [articleRes]);

  if (isError) return <ErrorScreen />;

  return (
    <>
      <ScrollView
        style={[layout.flex1]}
        contentContainerStyle={[spacing.gap20]}
        onScroll={handleScroll}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => refresh(refetch)} />
        }
      >
        {articles}
      </ScrollView>

      <ConditionalRender condition={isLoading}>
        <ActivityIndicator />
      </ConditionalRender>
    </>
  );
};

export default ArticleGroupContent;
