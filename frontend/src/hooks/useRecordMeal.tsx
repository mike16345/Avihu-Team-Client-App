import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { IMeal } from "@/interfaces/DietPlan";
import { generateUniqueId, getTotalCaloriesFromServings } from "@/utils/utils";
import { useDietPlanStore } from "@/store/useDietPlanStore";

const SESSION_KEY = "RecordedMealSession";
const SESSION_EXPIRY_HOURS = 36;
const MODAL_PROMPT_HOURS = 24;

interface RecordedMealServings {
  protein: number;
  carbs: number;
  veggies: number;
  fats: number;
}

interface RecordedMeal {
  id: string;
  name: string;
  calories: number;
  servings?: RecordedMealServings;
  recordedAt: string;
  synced: boolean;
}

interface RecordedMealSession {
  sessionId: string;
  startedAt: string;
  meals: RecordedMeal[];
  freeCaloriesConsumed: boolean;
  freeCalories: number;
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

function getMealServingsSnapshot(meal: IMeal): RecordedMealServings {
  return {
    protein: Number(meal.totalProtein?.quantity) || 0,
    carbs: Number(meal.totalCarbs?.quantity) || 0,
    veggies: Number(meal.totalVeggies?.quantity) || 0,
    fats: Number(meal.totalFats?.quantity) || 0,
  };
}

function getRecordedMealCalories(meal: RecordedMeal) {
  if (!meal.servings) return meal.calories || 0;

  return getTotalCaloriesFromServings(meal.servings);
}

function getSessionCalories(session: RecordedMealSession) {
  const mealCalories = session.meals.reduce((acc, meal) => acc + getRecordedMealCalories(meal), 0);
  const freeCalories = session.freeCaloriesConsumed ? session.freeCalories : 0;

  return mealCalories + freeCalories;
}

function hasLegacyRecordedMeals(session: RecordedMealSession) {
  return session.meals.some((meal) => !meal.servings);
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
      freeCaloriesConsumed: false,
      freeCalories: 0,
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

  const recordFreeCalorieConsumption = async (hasConsumed: boolean, calories: number) => {
    const storedSession = await getSessionFromStorage();

    if (!storedSession) return;

    const updatedSession: RecordedMealSession = {
      ...storedSession,
      freeCaloriesConsumed: hasConsumed,
      freeCalories: calories,
    };

    await persist(updatedSession);
    setTotalCaloriesEaten(getSessionCalories(updatedSession), true);
  };

  const recordMeal = async (meal: IMeal, mealNumber: number) => {
    const storedSession = await getSessionFromStorage();

    if (!storedSession) return;

    const servings = getMealServingsSnapshot(meal);
    const totalCalories = getTotalCaloriesFromServings(servings);

    const recordedMeal: RecordedMeal = {
      id: meal._id,
      name: `ארוחה ${mealNumber + 1}`,
      calories: totalCalories,
      servings,
      recordedAt: new Date().toLocaleTimeString(),
      synced: false,
    };

    const updatedSession: RecordedMealSession = {
      ...storedSession,
      meals: [...storedSession.meals, recordedMeal],
    };

    await persist(updatedSession);
    setTotalCaloriesEaten(getSessionCalories(updatedSession), true);

    try {
      // TODO: Post meal to API
    } catch (err) {
      console.warn("Failed to sync meal", err);
    }
  };

  const cancelMeal = async (mealId: string) => {
    const storedSession = await getSessionFromStorage();
    if (!storedSession) return;

    const mealToCancel = storedSession.meals.find((meal) => meal.id === mealId);
    if (!mealToCancel) return;

    const updatedSession: RecordedMealSession = {
      ...storedSession,
      meals: storedSession.meals.filter((meal) => meal.id !== mealId),
    };

    setTotalCaloriesEaten(getSessionCalories(updatedSession), true);
    await persist(updatedSession);

    try {
      // TODO: delete meal from API
    } catch (err) {
      console.warn("Failed to sync meal deletion", err);
    }
  };

  const getLocalSession = async () => {
    const storedSession = await getSessionFromStorage();

    if (!storedSession) return await startNewSession();

    if (isExpired(storedSession.startedAt)) return await startNewSession();
    if (hasLegacyRecordedMeals(storedSession)) return await startNewSession();

    if (needsPrompt(storedSession.startedAt)) {
      setShowPrompt(true);
    }

    setTotalCaloriesEaten(getSessionCalories(storedSession), true);
    setSession(storedSession);
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
    recordFreeCalorieConsumption,
  };
}
