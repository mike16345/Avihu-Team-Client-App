import { IWeighIn } from "@/interfaces/User";
import { useMemo } from "react";

type GraphWeighIns = {
  dailyWeighIns: number[];
  dailyLabels: string[];
  weeklyWeighIns: number[];
  weeklyLabels: string[];
  monthlyWeighIns: number[];
  monthlyLabels: string[];
};

export type GraphTab = "יומי" | "שבועי" | "חודשי";

const LARGE_AMOUNT_OF_WEIGH_INS = 75;
const THIRTY_DAYS_AGO = new Date();
THIRTY_DAYS_AGO.setDate(THIRTY_DAYS_AGO.getDate() - 30);

export function useGraphWeighIns(data: IWeighIn[] | undefined) {
  const {
    dailyWeighIns,
    dailyLabels,
    weeklyWeighIns,
    weeklyLabels,
    monthlyWeighIns,
    monthlyLabels,
  } = useMemo(() => {
    if (!data) {
      return {
        dailyWeighIns: [],
        dailyLabels: [],
        weeklyWeighIns: [],
        weeklyLabels: [],
        monthlyWeighIns: [],
        monthlyLabels: [],
      };
    }

    let weekBuffer: { weight: number; date: string }[] = [];
    const dailyWeighIns: number[] = [];
    const dailyLabels: string[] = [];

    const weeklyWeighIns: number[] = [];
    const weeklyLabels: string[] = [];

    const monthlyMap: Record<string, { total: number; count: number }> = {};
    const monthlyLabels: string[] = [];
    const monthOrder: string[] = [];

    data.forEach((item, idx) => {
      const dateObj = new Date(item.date);
      const dayLabel = dateObj.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
      });

      // ---- Daily ----
      if (data.length < LARGE_AMOUNT_OF_WEIGH_INS) {
        dailyWeighIns.push(item.weight);
        dailyLabels.push(dayLabel);
      } else if (idx % 2 == 0 && new Date(item.date) >= THIRTY_DAYS_AGO) {
        dailyWeighIns.push(item.weight);
        dailyLabels.push(dayLabel);
      }

      // ---- Weekly ----
      weekBuffer.push({ weight: item.weight, date: item.date });
      if (weekBuffer.length === 7) {
        const avg = weekBuffer.reduce((s, w) => s + w.weight, 0) / 7;

        weeklyWeighIns.push(avg);

        const start = new Date(weekBuffer[0].date)
          .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
          })
          .replace("/", ".");
        const end = new Date(weekBuffer[weekBuffer.length - 1].date)
          .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
          })
          .replace("/", ".");

        weeklyLabels.push(`${start} - ${end}`);
        weekBuffer = [];
      }

      // ---- Monthly ----
      const monthKey = dateObj.toISOString().slice(0, 7);

      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { total: 0, count: 0 };
        monthOrder.push(monthKey);
      }
      monthlyMap[monthKey].total += item.weight;
      monthlyMap[monthKey].count += 1;
    });

    // Last week if <7 days
    if (weekBuffer.length > 0) {
      const avg = weekBuffer.reduce((s, w) => s + w.weight, 0) / weekBuffer.length;

      weeklyWeighIns.push(avg);

      const start = new Date(weekBuffer[0].date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
      });
      const end = new Date(weekBuffer[weekBuffer.length - 1].date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
      });

      weeklyLabels.push(`${start} - ${end}`);
    }

    const monthlyWeighIns = monthOrder.map((monthKey) => {
      const { total, count } = monthlyMap[monthKey];
      const monthName = new Date(monthKey + "-01").toLocaleString("en-US", {
        month: "short",
      });
      monthlyLabels.push(monthName);

      return total / count;
    });

    return {
      dailyWeighIns,
      dailyLabels,
      weeklyWeighIns,
      weeklyLabels,
      monthlyWeighIns,
      monthlyLabels,
    };
  }, [data]);

  const getWeighInsByTab = (tab: GraphTab): { weighIns: number[]; labels: string[] } => {
    switch (tab) {
      case "שבועי":
        return { weighIns: weeklyWeighIns, labels: weeklyLabels };
      case "חודשי":
        return { weighIns: monthlyWeighIns, labels: monthlyLabels };
      case "יומי":
      default:
        return { weighIns: dailyWeighIns, labels: dailyLabels };
    }
  };

  return { getWeighInsByTab };
}
