import { useQuery } from "@tanstack/react-query";
import { ARTICLE_COUNT_KEY, ONE_DAY } from "@/constants/reactQuery";
import { useBlogsApi } from "@/hooks/api/useBlogsApi";
import { IBlog } from "@/interfaces/IBlog";
import { PaginationParams, PaginationResult } from "@/interfaces/IPagination";

const useArticleQuery = (pagination: PaginationParams) => {
  const { getPaginatedPosts } = useBlogsApi();

  return useQuery<any, any, PaginationResult<IBlog>, any>({
    queryFn: () => getPaginatedPosts(pagination),
    queryKey: [ARTICLE_COUNT_KEY, JSON.stringify(pagination.query)],
    enabled: !!pagination,
    staleTime: ONE_DAY,
  });
};

export default useArticleQuery;
