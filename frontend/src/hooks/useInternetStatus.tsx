import { useEffect, useState } from "react";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";

type InternetStatus = {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
  isOnline: boolean;
  isLoading: boolean;
  refresh: () => Promise<void>;
};

const useInternetStatus = (): InternetStatus => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const updateState = (state: NetInfoState) => {
    setIsConnected(state.isConnected);
    setIsInternetReachable(state.isInternetReachable);
    setIsLoading(false);
  };

  const refresh = async () => {
    const state = await NetInfo.fetch();
    updateState(state);
  };

  useEffect(() => {
    refresh().catch((error) => {
      console.error("Error fetching internet status:", error);
      setIsLoading(false);
    });

    const unsubscribe = NetInfo.addEventListener(updateState);

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    isConnected,
    isInternetReachable,
    isOnline: isConnected === true && isInternetReachable !== false,
    isLoading,
    refresh,
  };
};

export default useInternetStatus;
