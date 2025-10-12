import { useMemo } from "react";
import useRecordedSetsQuery from "./useRecordedSetsQuery";
import { toLine } from "@/components/WorkoutPlan/RecordExercise/PreviousSetCard";
import { IRecordedSetRes } from "@/interfaces/Workout";
import DateUtils from "@/utils/dateUtils";

type LastRecorded = {
  details: string;
  lastRecordedSets: string[];
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
  if (!data?.length) return { details: "", lastRecordedSets: [], date: null };

  let latestSet: IRecordedSetRes | undefined;

  // find latest set (by date) for this exercise across all docs
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

  if (!latestSet?.date) return { details: "", lastRecordedSets: [], date: null };

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

  const details = sameDaySets.length ? toLine(sameDaySets[sameDaySets.length - 1]) : "";
  const lastRecordedSets = sameDaySets.map(toLine);
  const date = DateUtils.formatDate(latestDay, "DD.MM.YY");

  return { details, lastRecordedSets, date };
}

const useGetLastRecordedSet = (exercise: string) => {
  const { data } = useRecordedSetsQuery();

  return useMemo<LastRecorded>(() => {
    console.log("running use memo");
    if (!data) return { details: "", lastRecordedSets: [], date: null };

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
