import { useQuery } from "@tanstack/react-query";
import { ARTICLE_COUNT_KEY, ONE_DAY } from "@/constants/reactQuery";
import { useBlogsApi } from "@/hooks/api/useBlogsApi";
import { IBlogCount } from "@/interfaces/IBlog";
import { PaginationParams, PaginationResult } from "@/interfaces/IPagination";

const useArticleCountQuery = (pagination: PaginationParams) => {
  const { getPaginatedPosts } = useBlogsApi();

  return useQuery<any, any, PaginationResult<IBlogCount[]>, any>({
    queryFn: () => getPaginatedPosts(pagination),
    queryKey: [ARTICLE_COUNT_KEY],
    enabled: !!pagination,
    staleTime: ONE_DAY,
  });
};

export default useArticleCountQuery;
