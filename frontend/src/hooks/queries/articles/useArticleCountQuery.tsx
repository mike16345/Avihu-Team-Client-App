import { useQuery } from "@tanstack/react-query";
import { ARTICLE_COUNT_KEY, ONE_DAY } from "@/constants/reactQuery";
import { useBlogsApi } from "@/hooks/api/useBlogsApi";
import { IBlogCount } from "@/interfaces/IBlog";

const useArticleCountQuery = () => {
  const { getPostCountByGroup } = useBlogsApi();

  return useQuery<any, any, IBlogCount[], any>({
    queryFn: () => getPostCountByGroup(),
    queryKey: [ARTICLE_COUNT_KEY],
    staleTime: ONE_DAY,
  });
};

export default useArticleCountQuery;
