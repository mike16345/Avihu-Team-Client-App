import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "recent-article-searches";
const LIMIT = 6;

export const useRecentArticleSearches = () => {
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) setRecent(JSON.parse(raw));
      } catch {}
    })();
  }, []);

  const add = useCallback(
    async (term: string) => {
      const t = term.trim();
      if (t.length < 2) return;
      const next = [t, ...recent.filter((x) => x !== t)].slice(0, LIMIT);
      setRecent(next);
      try {
        await AsyncStorage.setItem(KEY, JSON.stringify(next));
      } catch {}
    },
    [recent]
  );

  const clear = useCallback(async () => {
    setRecent([]);
    try {
      await AsyncStorage.removeItem(KEY);
    } catch {}
  }, []);

  return { recent, add, clear };
};
