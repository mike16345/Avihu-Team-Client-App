import { ONE_DAY } from "@/constants/reactQuery";
import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: ONE_DAY,
    },
  },
});

export default queryClient;
