import { IWeighIn } from "@/interfaces/User";
import { useMemo } from "react";

export type GraphData = {
  weight: number;
  date: string;
};

export type GraphTab = "יומי" | "שבועי" | "חודשי";

const LARGE_AMOUNT_OF_WEIGH_INS = 50;
const THIRTY_DAYS_AGO = new Date();
THIRTY_DAYS_AGO.setDate(THIRTY_DAYS_AGO.getDate() - 30);
const SEVEN_DAYS_AGO = new Date();
SEVEN_DAYS_AGO.setDate(SEVEN_DAYS_AGO.getDate() - 7);

export function useVictoryNativeGraphWeighIns(data: IWeighIn[] | undefined) {
  const { dailyWeighIns, weeklyWeighIns, monthlyWeighIns } = useMemo(() => {
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
    const dailyWeighIns: GraphData[] = [];
    const weeklyWeighIns: GraphData[] = [];
    const monthlyMap: Record<string, { total: number; count: number }> = {};
    const monthOrder: string[] = [];

    data.forEach((item, idx) => {
      const dateObj = new Date(item.date);

      const today = new Date(item.date);
      const isRecordedInLastSevenDays = today >= SEVEN_DAYS_AGO && today <= new Date();

      // ---- Daily ----
      if (isRecordedInLastSevenDays || idx % 2 == 0) {
        const dayLabel = dateObj
          .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
          })
          .replace("/", ".");

        dailyWeighIns.push({ weight: item.weight, date: dayLabel });
      }

      // ---- Weekly ----
      weekBuffer.push({ weight: item.weight, date: item.date });
      if (weekBuffer.length === 7) {
        const avg = weekBuffer.reduce((s, w) => s + w.weight, 0) / 7;

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

        weeklyWeighIns.push({ weight: avg, date: `${start} - ${end}` });

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

      const start = new Date(weekBuffer[0].date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
      });
      const end = new Date(weekBuffer[weekBuffer.length - 1].date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
      });

      weeklyWeighIns.push({ weight: avg, date: `${start}-${end}` });
    }

    const monthlyWeighIns: GraphData[] = monthOrder.map((monthKey) => {
      const { total, count } = monthlyMap[monthKey];
      const monthName = new Date(monthKey + "-01").toLocaleString("en-US", {
        month: "short",
      });

      return { weight: total / count, date: monthName };
    });

    return {
      dailyWeighIns,
      weeklyWeighIns,
      monthlyWeighIns,
    };
  }, [data]);

  const getWeighInsByTab = (tab: GraphTab): GraphData[] => {
    switch (tab) {
      case "שבועי":
        return weeklyWeighIns;
      case "חודשי":
        return monthlyWeighIns;
      case "יומי":
      default:
        return dailyWeighIns;
    }
  };

  return { dailyWeighIns, weeklyWeighIns, monthlyWeighIns };
}
