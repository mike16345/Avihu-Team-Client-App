import { useInfiniteQuery } from "@tanstack/react-query";
import { ARTICLE_KEY, ONE_DAY } from "@/constants/reactQuery";
import { useArticleApi } from "@/hooks/api/useArticleApi";
import { IArticle } from "@/interfaces/IArticle";
import { PaginationResult } from "@/interfaces/IPagination";

const LIMIT = 5;

const useArticleQuery = (group: string) => {
  const { getPaginatedPosts } = useArticleApi();

  return useInfiniteQuery({
    queryFn: ({ pageParam = { page: 1, limit: LIMIT } }) =>
      getPaginatedPosts({ ...pageParam, query: { group } }),
    queryKey: [ARTICLE_KEY + group],
    initialPageParam: { page: 1, limit: LIMIT },
    getNextPageParam: (lastPage: PaginationResult<IArticle>) => {
      return lastPage.hasNextPage ? { page: +lastPage.currentPage + 1, limit: LIMIT } : undefined;
    },
    staleTime: ONE_DAY,
  });
};

export default useArticleQuery;
