import { useQuery } from "@tanstack/react-query";
import { ARTICLE_COUNT_KEY, ONE_DAY } from "@/constants/reactQuery";
import { useArticleApi } from "@/hooks/api/useArticleApi";
import { IArticleCount } from "@/interfaces/IArticle";
import { createRetryFunction } from "@/utils/utils";

const useArticleCountQuery = (planType: string) => {
  const { getPostCountByGroup } = useArticleApi();

  return useQuery<any, any, IArticleCount[], any>({
    queryFn: () => getPostCountByGroup(planType),
    queryKey: [ARTICLE_COUNT_KEY + planType],
    staleTime: ONE_DAY,
    retry: createRetryFunction(404, 2),
  });
};

export default useArticleCountQuery;
