import React, { useState } from "react";

const usePullDownToRefresh = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = async (apiCall: () => Promise<any>) => {
    setIsRefreshing(true);
    await apiCall();
    setIsRefreshing(false);
  };

  return { isRefreshing, refresh };
};

export default usePullDownToRefresh;
