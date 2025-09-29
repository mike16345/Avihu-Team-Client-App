import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const useSession = <T,>(
  sessionKey: string,
  opts?: {
    serialize?: (v: T) => string;
    deserialize?: (s: string) => T;
  }
) => {
  const { setItem, getItem, removeItem } = useAsyncStorage(sessionKey);

  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<T | null>(null);

  const serializeData = opts?.serialize ?? ((value: T) => JSON.stringify(value));
  const deserializeData = opts?.deserialize ?? ((raw: string) => JSON.parse(raw) as T);

  const setLocal = useCallback(
    async (value: T) => {
      try {
        await setItem(serializeData(value));
        setSession(value);
      } catch (e) {
        throw e;
      }
    },
    [setItem]
  );

  const readLocal = useCallback(async (): Promise<T | null> => {
    setIsLoading(true);

    try {
      const raw = await getItem();

      if (!raw) return null;
      const parsed = deserializeData(raw);
      setSession(parsed);

      return parsed;
    } catch (e) {
      await removeItem();
      setSession(null);

      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [getItem, removeItem]);

  const removeLocal = useCallback(async () => {
    try {
      await removeItem();
    } catch (e) {
      throw e;
    } finally {
      setSession(null);
    }
  }, [removeItem]);

  useEffect(() => {
    readLocal().catch(() => {});
  }, []);

  return {
    isLoading,
    session,
    setLocal,
    readLocal,
    removeLocal,
  };
};

export default useSession;
