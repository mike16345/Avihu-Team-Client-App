import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { IMeal } from "@/interfaces/DietPlan";
import { generateUniqueId, getTotalCaloriesInMeal } from "@/utils/utils";
import { useDietPlanStore } from "@/store/useDietPlanStore";

const SESSION_KEY = "RecordedMealSession";
const SESSION_EXPIRY_HOURS = 36;
const MODAL_PROMPT_HOURS = 24;

interface RecordedMeal {
  id: string;
  name: string;
  calories: number;
  recordedAt: string;
  synced: boolean;
}

interface RecordedMealSession {
  sessionId: string;
  startedAt: string;
  meals: RecordedMeal[];
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
  const setTotalCaloriesEaten = useDietPlanStore((state) => state.setTotalCaloriesEaten);

  const [session, setSession] = useState<RecordedMealSession | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  const persist = async (s: RecordedMealSession) => {
    setSession(s);
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(s));
  };

  const startNewSession = async () => {
    const newSession: RecordedMealSession = {
      sessionId: generateUniqueId(),
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

  const getSessionFromStorage = async () => {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    if (!raw) return;
    const parsed: RecordedMealSession = JSON.parse(raw);

    return parsed;
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

  const recordMeal = async (meal: IMeal, mealNumber: number) => {
    const session = await getSessionFromStorage();
    if (!session) return;

    const totalCalories = getTotalCaloriesInMeal(meal);
    const recordedMeal: RecordedMeal = {
      id: meal._id,
      name: `ארוחה ${mealNumber + 1}`,
      calories: totalCalories,
      recordedAt: new Date().toLocaleTimeString(),
      synced: false,
    };

    const updated: RecordedMealSession = {
      ...session,
      meals: [...session.meals, recordedMeal],
    };
    await persist(updated);
    setTotalCaloriesEaten(totalCalories, false);

    try {
      // TODO: Post meal to API
    } catch (err) {
      console.warn("Failed to sync meal", err);
    }
  };

  const cancelMeal = async (mealId: string) => {
    const session = await getSessionFromStorage();
    if (!session) return;

    const updatedMeals = session.meals.filter((m) => m.id !== mealId);
    const updated: RecordedMealSession = { ...session, meals: updatedMeals };
    const total = updatedMeals.reduce((sum, m) => sum + m.calories, 0);
    setTotalCaloriesEaten(total);

    await persist(updated);

    try {
      // TODO: delete meal from API
    } catch (err) {
      console.warn("Failed to sync meal deletion", err);
    }
  };

  const getLocalSession = async () => {
    // return await AsyncStorage.removeItem(SESSION_KEY);
    const session = await getSessionFromStorage();

    if (!session) return await startNewSession();

    if (isExpired(session.startedAt)) return await startNewSession();

    if (needsPrompt(session.startedAt)) {
      setShowPrompt(true);
    }

    const totalCalories = session.meals.reduce((acc, m) => acc + m.calories, 0);
    setTotalCaloriesEaten(totalCalories, true);
    setSession(session);
  };

  useEffect(() => {
    getLocalSession();
  }, []);

  return {
    session,
    showPrompt,
    getSessionFromStorage,
    startNewSession,
    expireSession,
    recordMeal,
    cancelMeal,
  };
}
