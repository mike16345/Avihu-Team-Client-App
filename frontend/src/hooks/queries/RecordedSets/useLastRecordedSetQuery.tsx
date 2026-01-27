import { useMemo } from "react";
import useRecordedSetsQuery from "./useRecordedSetsQuery";
import { toLine } from "@/components/WorkoutPlan/RecordExercise/PreviousSetCard";
import { IRecordedSetRes } from "@/interfaces/Workout";
import DateUtils from "@/utils/dateUtils";

type LastRecorded = {
  formattedSets: string[];
  lastRecordedSets: IRecordedSetRes[];
  date: string | null;
};

const _lastRecordedCache = new WeakMap<object, Map<string, LastRecorded>>();

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

function computeForExercise(
  data: any[],
  exercise: string,
  toLine: (s: IRecordedSetRes) => string
): LastRecorded {
  if (!data?.length) return { formattedSets: [], lastRecordedSets: [], date: null };

  let latestSet: IRecordedSetRes | undefined;

  for (const item of data) {
    const sets = item?.recordedSets?.[exercise];
    if (!Array.isArray(sets)) continue;

    for (const s of sets) {
      if (!s?.date) continue;
      const d = new Date(s.date);

      if (!latestSet || (latestSet.date && d > new Date(latestSet.date))) {
        latestSet = s;
      }
    }
  }

  if (!latestSet?.date) return { formattedSets: [], lastRecordedSets: [], date: null };

  const latestDay = new Date(latestSet.date);
  const sameDaySets: IRecordedSetRes[] = [];

  // collect all sets for that same day to show the full session
  for (const item of data) {
    const sets = item?.recordedSets?.[exercise];
    if (!Array.isArray(sets)) continue;

    for (const s of sets) {
      if (s?.date && isSameDay(new Date(s.date), latestDay)) {
        sameDaySets.push(s);
      }
    }
  }

  sameDaySets.sort((a, b) => (a?.setNumber ?? 0) - (b?.setNumber ?? 0));

  const formattedSets = sameDaySets.length ? sameDaySets.map((s) => toLine(s)) : [];
  const date = DateUtils.formatDate(latestDay, "DD.MM.YY");

  return { formattedSets, lastRecordedSets: sameDaySets, date };
}

function findLastSetForSetNumber(
  data: any[],
  exercise: string,
  targetSetNumber: number
): IRecordedSetRes | null {
  if (!data?.length) return null;

  let lastMatch: IRecordedSetRes | null = null;

  for (const item of data) {
    const sets = item?.recordedSets?.[exercise];
    if (!Array.isArray(sets)) continue;

    for (const s of sets) {
      if (s?.setNumber !== targetSetNumber || !s?.date) continue;

      const setDate = new Date(s.date);
      if (!lastMatch || (lastMatch.date && setDate > new Date(lastMatch.date))) {
        lastMatch = s;
      }
    }
  }

  return lastMatch;
}

export const useGetLastRecordedSetForSetNumber = (exercise: string, setNumber: number) => {
  const { data } = useRecordedSetsQuery();

  return useMemo<IRecordedSetRes | null>(() => {
    if (!data) return null;
    return findLastSetForSetNumber(data, exercise, setNumber);
  }, [data, exercise, setNumber]);
};

const useGetLastRecordedSet = (exercise: string) => {
  const { data } = useRecordedSetsQuery();

  return useMemo<LastRecorded>(() => {
    if (!data) return { formattedSets: [], lastRecordedSets: [], date: null };

    const ref = data as unknown as object;
    let perExercise = _lastRecordedCache.get(ref);
    if (!perExercise) {
      perExercise = new Map<string, LastRecorded>();
      _lastRecordedCache.set(ref, perExercise);
    }

    if (perExercise.has(exercise)) {
      return perExercise.get(exercise)!;
    }

    const computed = computeForExercise(data, exercise, toLine);
    perExercise.set(exercise, computed);

    return computed;
  }, [data, exercise]);
};

export default useGetLastRecordedSet;
