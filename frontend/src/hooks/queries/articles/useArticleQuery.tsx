import { useQuery } from "@tanstack/react-query";
import { ARTICLE_KEY, ONE_DAY } from "@/constants/reactQuery";
import { useArticleApi } from "@/hooks/api/useArticleApi";
import { IArticle } from "@/interfaces/IArticle";
import { PaginationParams, PaginationResult } from "@/interfaces/IPagination";

const useArticleQuery = (pagination: PaginationParams) => {
  const { getPaginatedPosts } = useArticleApi();

  return useQuery<any, any, PaginationResult<IArticle>, any>({
    queryFn: () => getPaginatedPosts(pagination),
    queryKey: [ARTICLE_KEY + pagination.query?.group, pagination.page],
    enabled: !!pagination,
    staleTime: ONE_DAY,
  });
};

export default useArticleQuery;
