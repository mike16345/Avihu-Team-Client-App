import { useInfiniteQuery } from "@tanstack/react-query";
import { ARTICLE_KEY } from "@/constants/reactQuery";
import { useArticleApi } from "@/hooks/api/useArticleApi";
import { IArticle } from "@/interfaces/IArticle";
import { PaginationResult } from "@/interfaces/IPagination";

const LIMIT = 10;

const useArticleQuery = (group: string, planType: string) => {
  const { getPaginatedPosts } = useArticleApi();

  return useInfiniteQuery({
    queryFn: ({ pageParam = { page: 1, limit: LIMIT } }) =>
      getPaginatedPosts({
        ...pageParam,
        query: planType
          ? { group, planType: { $in: [planType, "כללי"] } }
          : { group },
      }),
    queryKey: [ARTICLE_KEY + group + planType],
    initialPageParam: { page: 1, limit: LIMIT },
    getNextPageParam: (lastPage: PaginationResult<IArticle>) => {
      return lastPage.hasNextPage ? { page: +lastPage.currentPage + 1, limit: LIMIT } : undefined;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnMount: true,
  });
};

export default useArticleQuery;
