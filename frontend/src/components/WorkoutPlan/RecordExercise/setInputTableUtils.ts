import { IExercise, IRecordedSetRes } from "@/interfaces/Workout";
import { isIndexOutOfBounds } from "@/utils/utils";

export type RowState = {
  setNumber: number;
  weight: string;
  reps: string;
  rir: string;
  completed: boolean;
  saving: boolean;
  savedSetId?: string;
};

const SESSION_WINDOW_MS = 24 * 60 * 60 * 1000;

export const getPlannedReps = (exercise: IExercise, setNumber: number): number => {
  if (!exercise.sets || exercise.sets.length === 0) return 0;
  const isOutOfBounds = isIndexOutOfBounds(exercise.sets, setNumber - 1);
  const target = isOutOfBounds
    ? exercise.sets[exercise.sets.length - 1]
    : exercise.sets[setNumber - 1];
  return target?.minReps ?? 0;
};

export const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const isInSessionWindow = (setDate: Date, sessionStartDate?: Date): boolean => {
  if (sessionStartDate && !Number.isNaN(sessionStartDate.getTime())) {
    const startMs = sessionStartDate.getTime();
    const setMs = setDate.getTime();
    return setMs >= startMs && setMs <= startMs + SESSION_WINDOW_MS;
  }
  return isSameDay(setDate, new Date());
};

export const collectTodaySets = (
  data: { recordedSets: Record<string, IRecordedSetRes[]> }[] | undefined,
  exerciseName: string,
  sessionStartDate?: Date
): IRecordedSetRes[] => {
  if (!data) return [];
  const sets: IRecordedSetRes[] = [];
  for (const group of data) {
    const forExercise = group.recordedSets?.[exerciseName];
    if (!forExercise) continue;
    for (const s of forExercise) {
      if (s?.date && isInSessionWindow(new Date(s.date), sessionStartDate)) sets.push(s);
    }
  }
  return sets.sort((a, b) => a.setNumber - b.setNumber);
};

export const findTodaySetId = (
  data: { recordedSets: Record<string, IRecordedSetRes[]> }[] | undefined,
  exerciseName: string,
  setNumber: number,
  sessionStartDate?: Date
): string | undefined => {
  if (!data) return undefined;
  let latest: IRecordedSetRes | undefined;
  for (const group of data) {
    const forExercise = group.recordedSets?.[exerciseName];
    if (!forExercise) continue;
    for (const s of forExercise) {
      if (s.setNumber !== setNumber) continue;
      if (!s.date || !isInSessionWindow(new Date(s.date), sessionStartDate)) continue;
      if (!latest || new Date(s.date) > new Date(latest.date)) latest = s;
    }
  }
  return latest?._id;
};

export const emptyRow = (setNumber: number): RowState => ({
  setNumber,
  weight: "",
  reps: "",
  rir: "",
  completed: false,
  saving: false,
});

export const getLatestDeletableRowIndex = (rows: RowState[]): number => {
  for (let index = rows.length - 1; index >= 0; index -= 1) {
    const row = rows[index];
    if (!row.savedSetId) continue;

    return row.setNumber > 1 ? index : -1;
  }

  return -1;
};

export const getSetRowKey = (row: RowState): string =>
  row.savedSetId ? `saved-${row.savedSetId}` : `unsaved-${row.setNumber}`;

export const buildRowsFromServer = (sets: IRecordedSetRes[], maxSets: number): RowState[] => {
  const byNumber = new Map<number, IRecordedSetRes>();
  for (const s of sets) {
    const current = byNumber.get(s.setNumber);
    if (!current || new Date(s.date) > new Date(current.date)) byNumber.set(s.setNumber, s);
  }

  const rows: RowState[] = [];
  const highest = sets.length ? Math.max(...sets.map((s) => s.setNumber)) : 0;
  const total = Math.max(maxSets, highest);

  for (let n = 1; n <= total; n += 1) {
    const s = byNumber.get(n);
    if (s) {
      rows.push({
        setNumber: n,
        weight: String(s.weight),
        reps: String(s.repsDone),
        rir: s.rir !== undefined && s.rir !== null ? String(s.rir) : "",
        completed: true,
        saving: false,
        savedSetId: s._id,
      });
    } else {
      rows.push(emptyRow(n));
    }
  }
  return rows;
};
