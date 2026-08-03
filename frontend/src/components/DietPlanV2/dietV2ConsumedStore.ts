import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY_PREFIX = "diet-v2-consumed:";

const todayKey = (): string => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

interface StoredEntry {
  date: string;
  kinds: string[];
}

export const loadConsumedKinds = async (mealId: string): Promise<Set<string>> => {
  try {
    const raw = await AsyncStorage.getItem(`${KEY_PREFIX}${mealId}`);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as StoredEntry;
    if (parsed.date !== todayKey()) return new Set();
    return new Set(parsed.kinds);
  } catch {
    return new Set();
  }
};

export const saveConsumedKinds = async (
  mealId: string,
  kinds: Set<string>,
): Promise<void> => {
  try {
    const entry: StoredEntry = { date: todayKey(), kinds: Array.from(kinds) };
    await AsyncStorage.setItem(`${KEY_PREFIX}${mealId}`, JSON.stringify(entry));
  } catch {
  }
};
