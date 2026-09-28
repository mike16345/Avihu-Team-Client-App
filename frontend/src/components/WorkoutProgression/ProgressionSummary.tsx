import React, { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Text } from "@/components/ui/Text";
import Icon from "@/components/Icon/Icon";
import useStyles from "@/styles/useGlobalStyles";
import Collapsible from "@/components/ui/Collapsible";
import { IRecordedSetRes } from "@/interfaces/Workout";
import DateUtils from "@/utils/dateUtils";

interface ProgressionSummaryProps {
  recordedSets: IRecordedSetRes[];
}

type RecordEvent = {
  key: string;
  date: string;
  weight: number;
  repsDone: number;
  isFirst: boolean;
};

const bestOf = (sets: IRecordedSetRes[]) => {
  if (!sets.length) return null;
  return sets.reduce(
    (best, current) => {
      if (
        current.weight > best.weight ||
        (current.weight === best.weight && current.repsDone > best.repsDone)
      ) {
        return { weight: current.weight, repsDone: current.repsDone, date: current.date };
      }
      return best;
    },
    { weight: sets[0].weight, repsDone: sets[0].repsDone, date: sets[0].date }
  );
};

const beats = (
  candidate: { weight: number; repsDone: number },
  current: { weight: number; repsDone: number }
) => {
  if (candidate.weight > current.weight) return true;
  if (candidate.weight === current.weight && candidate.repsDone > current.repsDone) return true;
  return false;
};

const DEMO_EXTRA_RECORDS = true;

const ProgressionSummary: React.FC<ProgressionSummaryProps> = ({ recordedSets }) => {
  const { colors, layout, spacing } = useStyles();

  const summary = useMemo(() => {
    if (!recordedSets?.length) return null;

    const groupedByDate: Record<string, IRecordedSetRes[]> = {};
    for (const set of recordedSets) {
      const day = DateUtils.formatDate(set.date, "YYYY-MM-DD");
      if (!groupedByDate[day]) groupedByDate[day] = [];
      groupedByDate[day].push(set);
    }
    const days = Object.keys(groupedByDate).sort();
    if (days.length === 0) return null;

    const records: RecordEvent[] = [];
    let currentBest: { weight: number; repsDone: number } | null = null;

    days.forEach((day, index) => {
      const best = bestOf(groupedByDate[day]);
      if (!best) return;

      const isFirst = index === 0;
      if (isFirst) {
        records.push({
          key: day,
          date: best.date,
          weight: best.weight,
          repsDone: best.repsDone,
          isFirst: true,
        });
        currentBest = { weight: best.weight, repsDone: best.repsDone };
        return;
      }

      if (currentBest && beats(best, currentBest)) {
        records.push({
          key: day,
          date: best.date,
          weight: best.weight,
          repsDone: best.repsDone,
          isFirst: false,
        });
        currentBest = { weight: best.weight, repsDone: best.repsDone };
      }
    });

    if (!records.length) return null;

    if (DEMO_EXTRA_RECORDS && records.length < 5) {
      const firstDate = new Date(records[0].date);
      const demoRecords: RecordEvent[] = [
        {
          key: "demo-start",
          date: new Date(firstDate.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          weight: 60,
          repsDone: 6,
          isFirst: true,
        },
        {
          key: "demo-1",
          date: new Date(firstDate.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          weight: 70,
          repsDone: 6,
          isFirst: false,
        },
        {
          key: "demo-2",
          date: new Date(firstDate.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          weight: 80,
          repsDone: 8,
          isFirst: false,
        },
        {
          key: "demo-3",
          date: new Date(firstDate.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          weight: 90,
          repsDone: 8,
          isFirst: false,
        },
      ];
      records.splice(0, records[0].isFirst ? 1 : 0, ...demoRecords);
    }

    const first = records[0];
    const latest = records[records.length - 1];
    const trend =
      first.repsDone > 0
        ? Math.round(((latest.repsDone - first.repsDone) / first.repsDone) * 100)
        : 0;

    return { records, trend };
  }, [recordedSets]);

  if (!summary) {
    return (
      <View style={styles.emptyWrap}>
        <Text fontSize={14} style={styles.mutedText}>
          עוד לא הוקלטו סטים לתרגיל זה
        </Text>
      </View>
    );
  }

  const { records, trend } = summary;
  const trendPositive = trend >= 0;

  return (
    <Collapsible
      isCollapsed={false}
      style={[layout.flex1]}
      customHeight={210}
      keepMounted
      trigger={
        <View style={[layout.flexRow, layout.itemsCenter, layout.justifyBetween]}>
          <Text fontSize={16} fontVariant="semibold">
            ציר התקדמות
          </Text>

          <View style={[layout.flexRow, spacing.gapDefault, layout.itemsCenter]}>
            <Text fontSize={14} style={styles.mutedText}>
              {trend}%
            </Text>
            <Icon
              width={14}
              height={14}
              name="growthIndicator"
              color={trendPositive ? colors.textSuccess.color : colors.textDanger.color}
              rotation={trendPositive ? 0 : 90}
            />
          </View>
        </View>
      }
    >
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.timeline}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        {records
          .slice()
          .reverse()
          .map((record, indexReversed, arr) => {
            const isBottomOfList = indexReversed === arr.length - 1;
            const isLatestRecord = indexReversed === 0 && !record.isFirst;
            const isRecord = !record.isFirst;
            const label = record.isFirst
              ? "התחלה"
              : isLatestRecord
                ? "שיא נוכחי"
                : "שיא חדש";

            return (
              <View key={record.key} style={styles.milestoneRow}>
                <View style={styles.axis}>
                  <View style={[styles.dot, isRecord ? styles.dotRecord : styles.dotRegular]} />
                  {!isBottomOfList && <View style={styles.line} />}
                </View>

                <View style={styles.content}>
                  <View style={styles.headerLine}>
                    <Text fontSize={13} fontVariant="semibold">
                      {label}
                    </Text>
                    <Text fontSize={11} style={styles.mutedText}>
                      {DateUtils.formatDate(record.date, "DD/MM/YYYY")}
                    </Text>
                  </View>
                  <Text
                    fontSize={15}
                    fontVariant={isRecord ? "bold" : "regular"}
                    style={isRecord ? styles.recordValue : undefined}
                  >
                    {`${record.repsDone} חזרות · ${record.weight} ק"ג`}
                  </Text>
                </View>
              </View>
            );
          })}
      </ScrollView>
    </Collapsible>
  );
};

const AXIS_WIDTH = 22;
const DOT_SIZE = 10;

const styles = StyleSheet.create({
  scrollArea: {
    maxHeight: 190,
    marginTop: 10,
  },
  timeline: {
    paddingBottom: 4,
  },
  milestoneRow: {
    flexDirection: "row-reverse",
    alignItems: "stretch",
    gap: 12,
  },
  axis: {
    width: AXIS_WIDTH,
    alignItems: "center",
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    marginTop: 4,
  },
  dotRegular: {
    backgroundColor: "rgba(7, 39, 35, 0.35)",
  },
  dotRecord: {
    backgroundColor: "#17B26A",
    borderWidth: 3,
    borderColor: "#DCFCE7",
    width: DOT_SIZE + 4,
    height: DOT_SIZE + 4,
    borderRadius: (DOT_SIZE + 4) / 2,
    marginTop: 2,
  },
  line: {
    flex: 1,
    width: 1.5,
    backgroundColor: "rgba(7, 39, 35, 0.08)",
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingBottom: 16,
    gap: 2,
  },
  headerLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  recordValue: {
    color: "#0F8555",
  },
  mutedText: {
    color: "#6B7280",
  },
  emptyWrap: {
    padding: 24,
    alignItems: "center",
  },
});

export default ProgressionSummary;
