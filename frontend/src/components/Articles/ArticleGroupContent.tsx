import { RefreshControl, ScrollView } from "react-native";
import React, { useMemo, useState } from "react";
import useArticleQuery from "@/hooks/queries/articles/useArticleQuery";
import { PaginationParams } from "@/interfaces/IPagination";
import useStyles from "@/styles/useGlobalStyles";
import usePullDownToRefresh from "@/hooks/usePullDownToRefresh";
import { Text } from "../ui/Text";
import ArticleCard from "./ArticleCard";

interface ArticleGroupContentProps {
  groupId: string;
}

const ArticleGroupContent: React.FC<ArticleGroupContentProps> = ({ groupId }) => {
  const { layout, spacing, text } = useStyles();
  const { isRefreshing, refresh } = usePullDownToRefresh();

  const [pagination, setPagination] = useState<PaginationParams>({ limit: 5, page: 1 });
  const { data, isLoading, isError, error, refetch } = useArticleQuery({
    limit: pagination.limit,
    page: pagination.page,
    query: { group: groupId },
  });

  const articles = useMemo(() => {
    if (!data || !data.results.length)
      return <Text style={[text.textCenter, spacing.pdXl]}>לא נמצאו מאמרים לקבוצה זו</Text>;

    return data.results.map((article) => <ArticleCard key={article._id} article={article} />);
  }, [data]);

  return (
    <ScrollView
      style={[layout.flex1]}
      contentContainerStyle={[spacing.gap20]}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={() => refresh(refetch)} />
      }
    >
      {articles}
    </ScrollView>
  );
};

export default ArticleGroupContent;
