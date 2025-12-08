import { IRecordedSet } from "@/interfaces/Workout";
import DateUtils from "./dateUtils";
import { GraphData } from "@/hooks/graph/useGraphWeighIns";

type SetsSummaryByDate = Record<string, { totalReps: number; totalWeight: number; count: number }>;

type SetsSummaries = Record<string, GraphData[]>;

export const groupRecordedSetsByDate = (recordedSets: IRecordedSet[]): SetsSummaryByDate => {
  return recordedSets.reduce((acc: Record<any, any>, current: IRecordedSet) => {
    const { date, repsDone, weight } = current;
    const formattedDate = DateUtils.formatDate(date, "DD.MM");

    if (!acc[formattedDate]) {
      acc[formattedDate] = { totalReps: 0, totalWeight: 0, count: 0 };
    }

    acc[formattedDate].totalReps += repsDone;
    acc[formattedDate].totalWeight += weight;
    acc[formattedDate].count += 1;

    return acc;
  }, {} as SetsSummaryByDate);
};

export const getDataAvgPerDate = (groupedSetsByDate: SetsSummaryByDate): SetsSummaries => {
  const repAverages: GraphData[] = [];
  const weightAverages: GraphData[] = [];

  const avgByDate = Object.fromEntries(
    Object.entries(groupedSetsByDate).map(([date, { totalReps, totalWeight, count }]) => [
      date,
      {
        avgReps: Math.round(totalReps / count),
        avgWeight: +(totalWeight / count).toFixed(2),
      },
    ])
  );

  for (const [date, { avgReps, avgWeight }] of Object.entries(avgByDate)) {
    repAverages.push({ value: avgReps, label: date });
    weightAverages.push({ value: avgWeight, label: date });
  }

  return { repAverages, weightAverages };
};

export const getGrowthTrend = (lastItem: number, firstItem: number) =>
  Math.round(((lastItem - firstItem) / firstItem) * 100);
