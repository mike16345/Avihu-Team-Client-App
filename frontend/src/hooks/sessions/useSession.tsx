import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const makeSessionQK = (sessionKey: string) => ["local-session", sessionKey];

const useSession = <T,>(
  sessionKey: string,
  opts?: {
    serialize?: (v: T) => string;
    deserialize?: (s: string) => T;
  }
) => {
  const queryClient = useQueryClient();
  const qk = makeSessionQK(sessionKey);

  const serialize = opts?.serialize ?? ((v: T) => JSON.stringify(v));
  const deserialize = opts?.deserialize ?? ((s: string) => JSON.parse(s) as T);

  const {
    data: session,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: qk,
    queryFn: async () => {
      const raw = await AsyncStorage.getItem(sessionKey);
      return raw ? (deserialize(raw) as T) : null;
    },
    staleTime: Infinity,
    gcTime: Infinity,
    initialData: null as T | null,
  });

  const setLocal = useCallback(
    async (value: T) => {
      await AsyncStorage.setItem(sessionKey, serialize(value));
      queryClient.setQueryData(qk, { ...(value as any) } as T);
    },
    [queryClient, qk, sessionKey, serialize]
  );

  const removeLocal = useCallback(async () => {
    await AsyncStorage.removeItem(sessionKey);
    queryClient.setQueryData(qk, null);
  }, [queryClient, qk, sessionKey]);

  return {
    isLoading,
    session,
    readLocal: refetch,
    setLocal,
    removeLocal,
  };
};

export default useSession;
