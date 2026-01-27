import { useQuery } from "@tanstack/react-query";
import { ARTICLE_KEY, ONE_DAY } from "@/constants/reactQuery";
import { useArticleApi } from "@/hooks/api/useArticleApi";
import { IArticle } from "@/interfaces/IArticle";

const useOneArticleQuery = (articleId: string) => {
  const { getOneArticle } = useArticleApi();

  return useQuery<any, any, IArticle, any>({
    queryFn: () => getOneArticle(articleId),
    queryKey: [ARTICLE_KEY + articleId],
    enabled: !!articleId,
    staleTime: ONE_DAY,
  });
};

export default useOneArticleQuery;
