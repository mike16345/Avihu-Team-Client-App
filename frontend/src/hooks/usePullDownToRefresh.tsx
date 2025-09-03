import { useState } from "react";

const usePullDownToRefresh = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshCount, setRefreshCount] = useState<number>(0);

  const startRefreshCount = () => {
    setTimeout(() => {
      setRefreshCount(0);
    }, 60000);
  };

  const handleRefresh = async (apiCall: () => Promise<any>) => {
    setRefreshCount((prev) => prev + 1);
    setIsRefreshing(true);
    await apiCall();
    setIsRefreshing(false);
  };

  const refresh = (apiCall: () => Promise<any>) => {
    if (refreshCount > 3) return;

    if (refreshCount == 0) {
      startRefreshCount();
    }

    handleRefresh(apiCall);
  };

  return { isRefreshing, refresh };
};

export default usePullDownToRefresh;
