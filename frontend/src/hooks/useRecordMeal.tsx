import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuidv4 } from "uuid";

const SESSION_KEY = "mealSession";
const SESSION_EXPIRY_HOURS = 36;
const MODAL_PROMPT_HOURS = 24;

interface Meal {
  id: string;
  name: string;
  calories: number;
  recordedAt: string;
  synced: boolean;
}

interface MealSession {
  sessionId: string;
  startedAt: string;
  meals: Meal[];
  expiresAt: string;
  active: boolean;
}

function isExpired(startedAt: string) {
  return Date.now() - new Date(startedAt).getTime() > SESSION_EXPIRY_HOURS * 60 * 60 * 1000;
}

function needsPrompt(startedAt: string) {
  const elapsed = Date.now() - new Date(startedAt).getTime();
  return (
    elapsed > MODAL_PROMPT_HOURS * 60 * 60 * 1000 && elapsed < SESSION_EXPIRY_HOURS * 60 * 60 * 1000
  );
}

export function useRecordMeal() {
  const [session, setSession] = useState<MealSession | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  const persist = async (s: MealSession) => {
    setSession(s);
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(s));
  };

  const startNewSession = async () => {
    const newSession: MealSession = {
      sessionId: uuidv4(),
      startedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000).toISOString(),
      meals: [],
      active: true,
    };

    await persist(newSession);

    try {
      // TODO: Sync meal to API
    } catch (err) {
      console.warn("Failed to sync session start", err);
    }

    return newSession;
  };

  const expireSession = async () => {
    if (!session) return;

    const expired = { ...session, active: false };

    await persist(expired);

    try {
      // TODO: Expire meal in API
    } catch (err) {
      console.warn("Failed to sync expire", err);
    }

    await startNewSession();
  };

  const recordMeal = async (name: string, calories: number) => {
    if (!session) return;
    const meal: Meal = {
      id: uuidv4(),
      name,
      calories,
      recordedAt: new Date().toISOString(),
      synced: false,
    };

    const updated: MealSession = {
      ...session,
      meals: [...session.meals, meal],
    };
    await persist(updated);

    try {
      // TODO: Post meal to API
    } catch (err) {
      console.warn("Failed to sync meal", err);
    }
  };

  const getLocalSession = async () => {
    const raw = await AsyncStorage.getItem(SESSION_KEY);

    if (!raw) return await startNewSession();
    const parsed: MealSession = JSON.parse(raw);

    if (isExpired(parsed.startedAt)) return await startNewSession();

    if (needsPrompt(parsed.startedAt)) {
      setShowPrompt(true);
    }
    setSession(parsed);
  };

  useEffect(() => {
    getLocalSession();
  }, []);

  return {
    session,
    showPrompt,
    startNewSession,
    expireSession,
    recordMeal,
  };
}
