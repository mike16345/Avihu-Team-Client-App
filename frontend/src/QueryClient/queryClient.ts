import { ONE_DAY } from "@/constants/reactQuery";
import { reportQueryFailure, reportMutationFailure } from "@/services/errorReporting/queryReporting";
import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";

const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: reportQueryFailure }),
  mutationCache: new MutationCache({ onError: (error, variables, _context, mutation) => reportMutationFailure(error, variables, mutation) }),
  defaultOptions: {
    queries: {
      gcTime: ONE_DAY,
    },
  },
});

export default queryClient;
