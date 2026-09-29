import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useArticleApi } from "@/hooks/api/useArticleApi";
import { IArticle } from "@/interfaces/IArticle";
import { PaginationResult } from "@/interfaces/IPagination";

const KEY = "article-search";

const useArticleSearchQuery = (search: string, planType: string) => {
  const { getPaginatedPosts } = useArticleApi();
  const term = search.trim();

  return useQuery<PaginationResult<IArticle>>({
    queryKey: [KEY, term, planType],
    queryFn: () =>
      getPaginatedPosts({
        page: 1,
        limit: 30,
        query: {
          title: { $regex: term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" },
          ...(planType ? { planType } : {}),
        },
      }),
    enabled: term.length > 0,
    staleTime: 1000 * 30,
    placeholderData: keepPreviousData,
  });
};

export default useArticleSearchQuery;
