import {
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text as RNText,
  TextInput,
  View,
} from "react-native";
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Path,
  Stop,
} from "react-native-svg";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import useStyles from "@/styles/useGlobalStyles";
import { Text } from "@/components/ui/Text";
import Icon from "@/components/Icon/Icon";
import useWorkoutPlanQuery from "@/hooks/queries/useWorkoutPlanQuery";
import useRecordedSetsQuery from "@/hooks/queries/RecordedSets/useRecordedSetsQuery";
import useWeighInsQuery from "@/hooks/queries/WeighIns/useWeighInsQuery";
import useDietPlanQuery from "@/hooks/queries/useDietPlanQuery";
import { useRecordMeal } from "@/hooks/useRecordMeal";
import { useStepsTracking } from "@/context/StepsTrackingContext";
import { useSleepAverageStore } from "@/store/sleepAverageStore";
import { useProgressManualStore } from "@/store/progressManualStore";
import { useWeeklyFeedbackStore } from "@/store/weeklyFeedbackStore";
import { useNutritionDayNotesStore } from "@/store/nutritionDayNotesStore";
import { buildGoalsByDay, formatSteps, getLocalDateKey } from "@/utils/stepsUtils";
import { ISimpleCardioType, IStepsCardioType } from "@/interfaces/Workout";
import { useCardioMinutesStore } from "@/store/cardioMinutesStore";
import { useUserStore } from "@/store/userStore";
import { getPreviousWeekKey, useWeeklySignatureStore } from "@/store/weeklySignatureStore";
import { useWeeklyFeedbackApi } from "@/hooks/api/useWeeklyFeedbackApi";
import { selectionHaptic } from "@/utils/haptics";
import WheelPicker from "@/components/ui/WheelPicker";

const PRIMARY = "#072723";
const ACCENT = "#17B26A";
const ACCENT_LIGHT = "#86EFAC";
const ACCENT_SOFT = "#EDFFEB";
const MUTED = "#6B7280";
const CARD_BORDER = "rgba(7, 39, 35, 0.08)";
const TRACK = "rgba(7, 39, 35, 0.08)";
const SLEEP_TARGET_HOURS = 7.5;
const DEMO_WEEK_WEIGHTS = [105.4, 105.2, 105.0, 104.7, 104.5, 104.3, 104.1];

const useEntryFade = (delayMs: number, durationMs: number = 550) => {
  const anim = useRef(new Animated.Value(0)).current;
  useFocusEffect(
    useCallback(() => {
      anim.setValue(0);
      const t = Animated.timing(anim, {
        toValue: 1,
        duration: durationMs,
        delay: delayMs,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      });
      t.start();
      return () => t.stop();
    }, [anim, delayMs, durationMs])
  );
  return anim;
};

const AnimatedShell: React.FC<{
  delay: number;
  children: React.ReactNode;
  style?: object;
}> = ({ delay, children, style }) => {
  const a = useEntryFade(delay);
  const translateY = a.interpolate({ inputRange: [0, 1], outputRange: [18, 0] });
  return (
    <Animated.View style={[style, { opacity: a, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
};

const startOfWeek = (d: Date): Date => {
  const day = d.getDay();
  const start = new Date(d);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - day);
  return start;
};

const isWithinThisWeek = (iso?: string): boolean => {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return false;
  const start = startOfWeek(new Date()).getTime();
  const end = start + 7 * 24 * 60 * 60 * 1000;
  return t >= start && t < end;
};

const formatWeekRangeFromKey = (weekKey: string): string => {
  const [y, m, d] = weekKey.split("-").map(Number);
  const start = new Date(y, m - 1, d);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const dd = (x: Date) => String(x.getDate()).padStart(2, "0");
  const mm = (x: Date) => String(x.getMonth() + 1).padStart(2, "0");
  return `${dd(start)}/${mm(start)} — ${dd(end)}/${mm(end)}`;
};

const formatIsraeliDate = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = d.getFullYear();
  return `${dd}.${mm}.${yy}`;
};

const formatHours = (h: number): string => {
  const total = Math.max(0, h);
  const hh = Math.floor(total);
  const mm = Math.round((total - hh) * 60);
  return `${hh}:${String(mm).padStart(2, "0")}`;
};

interface WorkoutEntry {
  planId: string;
  index: number;
  doneSmart: boolean;
  doneManual: boolean;
}

const CardHeader: React.FC<{ title: string; icon: React.ReactNode }> = ({ title, icon }) => (
  <View style={styles.cardHeader}>
    <Text fontVariant="semibold" fontSize={15} style={styles.cardTitle}>
      {title}
    </Text>
    {icon}
  </View>
);

const WorkoutPill: React.FC<{ entry: WorkoutEntry; onToggle: () => void }> = ({
  entry,
  onToggle,
}) => {
  const active = entry.doneSmart || entry.doneManual;
  return (
    <Pressable
      onPress={onToggle}
      style={[styles.pill, active ? styles.pillActive : styles.pillMuted]}
    >
      <View
        style={[styles.pillBadge, active ? styles.pillBadgeActive : styles.pillBadgeMuted]}
      >
        {active ? (
          <Text fontVariant="bold" fontSize={11} style={styles.pillBadgeText}>
            ✓
          </Text>
        ) : null}
      </View>
      <Text fontSize={11} style={styles.pillLabel}>
        אימון
      </Text>
      <Text fontVariant="bold" fontSize={17} style={styles.pillNumber}>
        {entry.index}
      </Text>
    </Pressable>
  );
};

const WorkoutsCard: React.FC<{
  workouts: WorkoutEntry[];
  onToggle: (planId: string) => void;
}> = ({ workouts, onToggle }) => (
  <View style={styles.card}>
    <CardHeader
      title="אימונים"
      icon={<Icon name="dumbbell" color={PRIMARY} width={16} height={16} />}
    />
    {workouts.length === 0 ? (
      <Text fontSize={13} style={styles.emptyState}>
        לא הוגדרה תוכנית אימונים
      </Text>
    ) : (
      <>
        <View style={styles.pillsRow}>
          {workouts.map((w) => (
            <WorkoutPill key={w.planId} entry={w} onToggle={() => onToggle(w.planId)} />
          ))}
        </View>
        <Text fontSize={10} style={styles.hintText}>
          לחיצה = סימון ידני. סימון חכם: הזנת סט מכל קבוצת שרירים
        </Text>
      </>
    )}
  </View>
);

const DAY_LABELS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

const buildWeekDayKeys = (
  baseWeekKey?: string
): { label: string; key: string; isToday: boolean; isFuture: boolean }[] => {
  const start = baseWeekKey
    ? (() => {
        const [y, m, d] = baseWeekKey.split("-").map(Number);
        return new Date(y, m - 1, d);
      })()
    : startOfWeek(new Date());
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return DAY_LABELS.map((label, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return {
      label,
      key: `${y}-${m}-${dd}`,
      isToday: !baseWeekKey && d.getTime() === today.getTime(),
      isFuture: !baseWeekKey && d.getTime() > today.getTime(),
    };
  });
};

const AdherenceBar: React.FC<{ percent: number }> = ({ percent }) => {
  const [barW, setBarW] = useState(0);
  const [progress, setProgress] = useState(0);
  const anim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      anim.setValue(0);
      const listener = anim.addListener(({ value }) => setProgress(value));
      const timing = Animated.timing(anim, {
        toValue: 1,
        duration: 900,
        delay: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      });
      timing.start();
      return () => {
        anim.removeListener(listener);
        timing.stop();
      };
    }, [anim])
  );

  const target = Math.max(0, Math.min(100, percent));
  const fillW = Math.round((barW * target * progress) / 100);
  return (
    <View style={styles.adherenceTrack} onLayout={(e) => setBarW(e.nativeEvent.layout.width)}>
      {barW > 0 && fillW > 0 && (
        <Svg width={barW} height={8}>
          <Defs>
            <SvgLinearGradient
              id="adh-fill"
              x1={barW}
              y1={0}
              x2={barW - fillW}
              y2={0}
              gradientUnits="userSpaceOnUse"
            >
              <Stop offset="0" stopColor={ACCENT_LIGHT} />
              <Stop offset="1" stopColor={ACCENT} />
            </SvgLinearGradient>
          </Defs>
          <Path
            d={`M${barW} 4 H${barW - fillW}`}
            stroke="url(#adh-fill)"
            strokeWidth={8}
            strokeLinecap="round"
          />
        </Svg>
      )}
    </View>
  );
};

const NutritionCard: React.FC<{
  mealsDone: number;
  mealsPlanned: number;
  marks: Record<string, boolean>;
  notes: Record<string, string>;
  onToggleDay: (dayKey: string) => void;
  onOpenNote: (dayKey: string, dayLabel: string) => void;
  allowAllDays?: boolean;
  baseWeekKey?: string;
}> = ({
  mealsDone,
  mealsPlanned,
  marks,
  notes,
  onToggleDay,
  onOpenNote,
  allowAllDays,
  baseWeekKey,
}) => {
  const [logOpen, setLogOpen] = useState(false);
  const smartDoneToday = mealsPlanned > 0 && mealsDone >= mealsPlanned;
  const weekDays = useMemo(() => buildWeekDayKeys(baseWeekKey), [baseWeekKey]);

  const isDayDone = (day: { key: string; isToday: boolean }) => {
    if (marks[day.key]) return true;
    if (day.isToday && smartDoneToday) return true;
    return false;
  };

  const adherence = useMemo(() => {
    let doneCount = 0;
    weekDays.forEach((day) => {
      if (isDayDone(day)) doneCount++;
    });
    const total = weekDays.length;
    return { done: doneCount, total, percent: Math.round((doneCount / total) * 100) };
  }, [weekDays, marks, smartDoneToday]);

  return (
    <View style={styles.card}>
      <CardHeader
        title="תזונה"
        icon={<Icon name="chefHat" color={PRIMARY} width={16} height={16} />}
      />
      <View style={styles.adherenceRow}>
        <Text fontVariant="bold" fontSize={22} style={styles.bigNum}>
          {`${adherence.percent}%`}
        </Text>
        <View style={styles.adherenceMeta}>
          <Text fontVariant="semibold" fontSize={13} style={styles.cardTitle}>
            התמדה שבועית
          </Text>
          <Text fontSize={11} style={styles.mutedSmall}>
            {`${adherence.done}/${adherence.total} ימים בוצעו לפי התפריט`}
          </Text>
        </View>
      </View>
      <AdherenceBar percent={adherence.percent} />
      <Pressable onPress={() => setLogOpen((v) => !v)} style={styles.logToggleRow}>
        <Text fontVariant="semibold" fontSize={13} style={styles.logToggleText}>
          תיעוד תזונה יומי
        </Text>
        <Icon
          name="chevronDown"
          color={PRIMARY}
          width={12}
          height={12}
          rotation={logOpen ? 180 : 0}
        />
      </Pressable>
      {logOpen && (
        <View style={styles.dayList}>
          {weekDays.map((day) => {
            const done = isDayDone(day);
            return (
              <View
                key={day.key}
                style={[styles.dayRow, !allowAllDays && day.isFuture && styles.dayRowDisabled]}
              >
                <View style={styles.dayLabelGroup}>
                  {day.isToday && (
                    <Text fontSize={10} style={styles.dayTodayTag}>
                      היום
                    </Text>
                  )}
                  <Text fontVariant="semibold" fontSize={13} style={styles.dayLabel}>
                    {day.label}
                  </Text>
                </View>
                <View style={styles.dayEndGroup}>
                  <Pressable
                    onPress={() => onOpenNote(day.key, day.label)}
                    hitSlop={8}
                    style={[
                      styles.noteChip,
                      notes[day.key] ? styles.noteChipFilled : undefined,
                    ]}
                  >
                    <Text
                      fontVariant="semibold"
                      fontSize={11}
                      style={notes[day.key] ? styles.noteChipTextFilled : styles.noteChipText}
                    >
                      {notes[day.key] ? "הערה ✎" : "הערה"}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => (allowAllDays || !day.isFuture) && onToggleDay(day.key)}
                    hitSlop={8}
                    style={[
                      styles.dayBadge,
                      done ? styles.dayBadgeActive : styles.dayBadgeMuted,
                    ]}
                  >
                    <Text
                      fontVariant="bold"
                      fontSize={13}
                      style={done ? styles.dayBadgeTextActive : styles.dayBadgeTextMuted}
                    >
                      ✓
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

interface WeightPoint {
  weight: number;
  date: string;
}

const WeightChart: React.FC<{
  points: WeightPoint[];
  width: number;
  height: number;
  selectedIndex: number | null;
  onSelect: (i: number | null) => void;
}> = ({ points, width, height, selectedIndex, onSelect }) => {
  const data = useMemo(() => {
    if (points.length === 0 || width <= 0) return null;
    const padX = 7;
    if (points.length === 1) {
      const y = height / 2;
      return { line: "", area: "", pts: [{ x: width / 2, y }] };
    }
    const values = points.map((p) => p.weight);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const usable = Math.max(0, width - 2 * padX);
    const stepX = usable / (points.length - 1);
    const pts = points.map((p, i) => {
      const x = padX + i * stepX;
      const y = height - ((p.weight - min) / range) * (height - 10) - 5;
      return { x, y };
    });
    let line = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const cpX = (prev.x + curr.x) / 2;
      line += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    const area = `${line} L ${pts[pts.length - 1].x} ${height} L ${pts[0].x} ${height} Z`;
    return { line, area, pts };
  }, [points, width, height]);

  if (!data) return null;

  const activeIndex = selectedIndex;

  return (
    <View style={styles.chartInner}>
      <Svg width={width} height={height}>
        <Defs>
          <SvgLinearGradient id="wt-fill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={ACCENT} stopOpacity={0.35} />
            <Stop offset="1" stopColor={ACCENT} stopOpacity={0.02} />
          </SvgLinearGradient>
        </Defs>
        {data.area && <Path d={data.area} fill="url(#wt-fill)" />}
        {data.line && (
          <Path
            d={data.line}
            stroke={ACCENT}
            strokeWidth={2.5}
            fill="none"
            strokeLinecap="round"
          />
        )}
        {data.pts.map((p, i) => (
          <Circle
            key={`d-${i}`}
            cx={p.x}
            cy={p.y}
            r={activeIndex === i ? 5 : 3.5}
            fill="#FFFFFF"
            stroke={ACCENT}
            strokeWidth={activeIndex === i ? 2.5 : 2}
          />
        ))}
        {data.pts.map((p, i) => (
          <Circle
            key={`h-${i}`}
            cx={p.x}
            cy={p.y}
            r={14}
            fill="transparent"
            onPress={() => onSelect(selectedIndex === i ? null : i)}
          />
        ))}
      </Svg>
    </View>
  );
};

const MetricsCard: React.FC<{
  weekPoints: WeightPoint[];
  latestWeight?: number;
  latestDate?: string;
  weekDelta?: number;
}> = ({ weekPoints, latestWeight, latestDate, weekDelta }) => {
  const [chartW, setChartW] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const hasData = weekPoints.length > 0;
  const deltaText =
    weekDelta == null ? null : `${weekDelta > 0 ? "+" : ""}${weekDelta.toFixed(1)}`;
  return (
    <View style={styles.card}>
      <CardHeader
        title="מעקב שקילות השבוע"
        icon={<Icon name="graph" color={PRIMARY} width={16} height={16} />}
      />
      {selectedIdx != null && weekPoints[selectedIdx] && (
        <Text fontSize={13} style={styles.chartSubtitle}>
          {`${weekPoints[selectedIdx].weight.toFixed(1)} kg · ${formatIsraeliDate(weekPoints[selectedIdx].date)}`}
        </Text>
      )}
      {hasData ? (
        <View style={styles.chartWrap} onLayout={(e) => setChartW(e.nativeEvent.layout.width)}>
          <WeightChart
            points={weekPoints}
            width={chartW}
            height={72}
            selectedIndex={selectedIdx}
            onSelect={setSelectedIdx}
          />
        </View>
      ) : (
        <Text fontSize={13} style={styles.emptyState}>
          לא נרשמו שקילות השבוע
        </Text>
      )}
      <View style={styles.metricsFoot}>
        <View>
          {deltaText != null && (
            <Text fontVariant="semibold" fontSize={13} style={styles.trendUp}>
              {"מגמה שבועית: "}
              <Text fontVariant="bold" fontSize={13} style={styles.trendUp}>
                {`‭${deltaText}‬`}
              </Text>
              {" קג׳"}
            </Text>
          )}
          {latestDate && (
            <Text fontSize={11} style={styles.mutedSmall}>
              {`מדידה אחרונה: ${formatIsraeliDate(latestDate)}`}
            </Text>
          )}
        </View>
        {latestWeight != null && (
          <Text fontVariant="bold" fontSize={26} style={styles.bigNum}>
            {`‭${latestWeight.toFixed(1)}‬`}
            <Text fontVariant="regular" fontSize={12} style={styles.mutedInline}>
              {" kg"}
            </Text>
          </Text>
        )}
      </View>
    </View>
  );
};

const Ring: React.FC<{ percent: number; size?: number }> = ({ percent, size = 58 }) => {
  const stroke = 7;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = Math.max(0, Math.min(1, percent / 100)) * c;
  return (
    <Svg width={size} height={size}>
      <Circle cx={size / 2} cy={size / 2} r={r} stroke={TRACK} strokeWidth={stroke} fill="none" />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={ACCENT}
        strokeWidth={stroke}
        strokeDasharray={`${dash} ${c - dash}`}
        strokeDashoffset={c / 4}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
};

const StatCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  percent: number;
  primary: string;
  caption: string;
  onPress?: () => void;
  editable?: boolean;
  editLabel?: string;
}> = ({ title, icon, percent, primary, caption, onPress, editable, editLabel }) => {
  const Container = onPress ? Pressable : View;
  return (
    <Container onPress={onPress} style={[styles.card, styles.statCard]}>
      {editable && (
        <View style={styles.editBadge}>
          <Text fontSize={10} style={styles.editBadgeText}>
            {editLabel || "עדכן"}
          </Text>
          <Icon name="pencil" color="#0F7A52" width={10} height={10} />
        </View>
      )}
      <View style={styles.statHead}>
        <Text fontVariant="semibold" fontSize={13} style={styles.cardTitle}>
          {title}
        </Text>
        {icon}
      </View>
      <View style={styles.statBody}>
        <View style={styles.statMeta}>
          <Text fontVariant="bold" fontSize={15} style={styles.statPrimary}>
            {primary}
          </Text>
          <Text fontSize={10} style={styles.mutedSmall}>
            {caption}
          </Text>
        </View>
        <View style={styles.ringWrap}>
          <Ring percent={percent} size={58} />
          <View style={styles.ringLabel} pointerEvents="none">
            <Text fontVariant="bold" fontSize={11} style={styles.ringPercent}>
              {`${Math.round(percent)}%`}
            </Text>
          </View>
        </View>
      </View>
    </Container>
  );
};

const FeedbackCard: React.FC<{
  text: string;
  onChange: (t: string) => void;
  readOnly?: boolean;
}> = ({ text, onChange, readOnly }) => {
  const hasText = text.trim().length > 0;

  return (
    <View style={styles.card}>
      <View style={styles.feedbackHeaderRow}>
        <Text fontVariant="semibold" fontSize={15} style={styles.cardTitle}>
          פידבק שבועי
        </Text>
        <View style={styles.feedbackHeaderEnd}>
          {hasText && (
            <View style={styles.autosaveWrap}>
              <Text fontSize={11} style={styles.autosaveText}>
                נשמר אוטומטית ✓
              </Text>
            </View>
          )}
          <Icon name="chat" color={PRIMARY} width={16} height={16} />
        </View>
      </View>
      <View style={styles.feedbackInputWrap}>
        <TextInput
          value={text}
          onChangeText={onChange}
          multiline
          numberOfLines={5}
          style={styles.feedbackInput}
          textAlignVertical="top"
          editable={!readOnly}
        />
        {!hasText && (
          <View pointerEvents="none" style={styles.feedbackPlaceholderWrap}>
            <RNText allowFontScaling={false} style={styles.feedbackPlaceholderText}>
              איך עבר לך השבוע? היו קשיים או משהו שאני צריך לדעת?
            </RNText>
          </View>
        )}
      </View>
    </View>
  );
};

const NoteInputModal: React.FC<{
  visible: boolean;
  dayLabel: string;
  initial: string;
  onClose: () => void;
  onSave: (note: string) => void;
}> = ({ visible, dayLabel, initial, onClose, onSave }) => {
  const [text, setText] = useState(initial);

  useEffect(() => {
    if (visible) setText(initial);
  }, [visible, initial]);

  const handleSave = () => {
    onSave(text);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <Text fontVariant="bold" fontSize={16} style={styles.sheetTitle}>
            {`הערה ל${dayLabel}`}
          </Text>
          <Text fontSize={12} style={styles.sheetHint}>
            מה קרה ביום זה? קשיים, הצלחות, סטיות מהתפריט
          </Text>
          <TextInput
            value={text}
            onChangeText={setText}
            multiline
            numberOfLines={5}
            placeholder="כתוב כאן..."
            placeholderTextColor={MUTED}
            style={styles.noteInput}
            textAlignVertical="top"
            autoFocus
          />
          <Pressable onPress={handleSave} style={styles.confirmBtn}>
            <Text fontVariant="bold" fontSize={15} style={styles.confirmText}>
              שמור
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const SLEEP_MIN = 3;
const SLEEP_MAX = 12;
const SLEEP_STEP = 0.5;

const clampSleep = (v: number) => Math.min(SLEEP_MAX, Math.max(SLEEP_MIN, v));
const formatSleep = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1));

const SLEEP_WHEEL_OPTIONS = Array.from(
  { length: Math.round((SLEEP_MAX - SLEEP_MIN) / SLEEP_STEP) + 1 },
  (_, i) => {
    const v = Math.round((SLEEP_MIN + i * SLEEP_STEP) * 10) / 10;
    return { value: v, label: formatSleep(v) };
  }
);

const CARDIO_MIN = 0;
const CARDIO_MAX = 600;
const CARDIO_STEP = 5;
const clampCardio = (v: number) => Math.min(CARDIO_MAX, Math.max(CARDIO_MIN, v));

const CARDIO_WHEEL_OPTIONS = Array.from(
  { length: Math.round((CARDIO_MAX - CARDIO_MIN) / CARDIO_STEP) + 1 },
  (_, i) => {
    const v = CARDIO_MIN + i * CARDIO_STEP;
    return { value: v, label: String(v) };
  }
);

const CardioMinutesModal: React.FC<{
  visible: boolean;
  initial: number | null;
  goal: number;
  onClose: () => void;
  onSave: (minutes: number) => void;
}> = ({ visible, initial, goal, onClose, onSave }) => {
  const initialValue = initial != null ? clampCardio(initial) : clampCardio(goal || 30);
  const [pending, setPending] = useState<number>(initialValue);

  useEffect(() => {
    if (visible) {
      setPending(initial != null ? clampCardio(initial) : clampCardio(goal || 30));
    }
  }, [visible, initial, goal]);

  const handleSave = () => {
    onSave(pending);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <Text fontVariant="bold" fontSize={16} style={styles.sheetTitle}>
            דקות אירובי השבוע
          </Text>
          <Text fontSize={12} style={styles.sheetHint}>
            {goal > 0 ? `יעד שבועי: ${goal} דקות` : "בחר דקות שבוצעו השבוע"}
          </Text>
          <View style={styles.sleepWheelStage}>
            <View pointerEvents="none" style={styles.sleepWheelBand} />
            <WheelPicker
              data={CARDIO_WHEEL_OPTIONS}
              selectedValue={pending}
              onValueChange={(v: number) => setPending(clampCardio(v))}
              height={144}
              itemHeight={48}
              activeItemColor={PRIMARY}
              inactiveItemColor="#B7BEBB"
            />
          </View>
          <Pressable onPress={handleSave} style={styles.confirmBtn}>
            <Text fontVariant="bold" fontSize={15} style={styles.confirmText}>
              אישור
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const SleepInputModal: React.FC<{
  visible: boolean;
  initial: number | null;
  onClose: () => void;
  onSave: (hours: number) => void;
}> = ({ visible, initial, onClose, onSave }) => {
  const [pending, setPending] = useState<number>(clampSleep(initial ?? 7));

  useEffect(() => {
    if (visible) setPending(clampSleep(initial && initial >= SLEEP_MIN ? initial : 7));
  }, [visible, initial]);

  const handleSave = () => {
    onSave(pending);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <Text fontVariant="bold" fontSize={16} style={styles.sheetTitle}>
            ממוצע שינה שבועי
          </Text>
          <Text fontSize={12} style={styles.sheetHint}>
            בחר ממוצע שעות שינה השבוע
          </Text>
          <View style={styles.sleepWheelStage}>
            <View pointerEvents="none" style={styles.sleepWheelBand} />
            <WheelPicker
              data={SLEEP_WHEEL_OPTIONS}
              selectedValue={pending}
              onValueChange={(v: number) => setPending(clampSleep(v))}
              height={144}
              itemHeight={48}
              activeItemColor={PRIMARY}
              inactiveItemColor="#B7BEBB"
            />
          </View>
          <Pressable onPress={handleSave} style={styles.confirmBtn}>
            <Text fontVariant="bold" fontSize={15} style={styles.confirmText}>
              אישור
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

interface HistoricWeekData {
  workoutsDone: Record<string, boolean>;
  nutritionMarks: Record<string, boolean>;
  dayNotes: Record<string, string>;
  sleepHours: number | null;
  cardioMinutes: number | null;
  feedbackText: string;
}

interface WeeklyProgressScreenProps {
  popupMode?: boolean;
  onFinalize?: () => void;
  historicData?: HistoricWeekData | null;
  historicWeekKey?: string;
}

const WeeklyProgressScreen: React.FC<WeeklyProgressScreenProps> = ({
  popupMode,
  onFinalize,
  historicData,
  historicWeekKey,
}) => {
  const readOnlyFromProps = !!historicData;
  const { colors, layout, spacing } = useStyles();

  const { data: workoutPlan } = useWorkoutPlanQuery();
  const { data: recordedSets } = useRecordedSetsQuery();
  const { data: weighIns } = useWeighInsQuery();
  const { data: dietPlan } = useDietPlanQuery();
  const { session } = useRecordMeal();
  const { steps } = useStepsTracking();

  const sleepHours = useSleepAverageStore((s) => s.hours);
  const setSleepHours = useSleepAverageStore((s) => s.setHours);
  const resetSleepIfNewWeek = useSleepAverageStore((s) => s.resetIfNewWeek);

  const feedbackText = useWeeklyFeedbackStore((s) => s.text);
  const setFeedbackText = useWeeklyFeedbackStore((s) => s.setText);
  const resetFeedbackIfNewWeek = useWeeklyFeedbackStore((s) => s.resetIfNewWeek);

  const dayNotes = useNutritionDayNotesStore((s) => s.notes);
  const setDayNote = useNutritionDayNotesStore((s) => s.setNote);
  const [noteModal, setNoteModal] = useState<{ dayKey: string; dayLabel: string } | null>(null);




  const manualWorkoutIds = useProgressManualStore((s) => s.workoutMarks);
  const toggleWorkoutMark = useProgressManualStore((s) => s.toggleWorkoutMark);
  const manualNutritionMarks = useProgressManualStore((s) => s.nutritionMarks);
  const weekKey = useProgressManualStore((s) => s.weekKey);
  const toggleNutritionMarkForDay = useProgressManualStore((s) => s.toggleNutritionMarkForDay);
  const resetIfNewPeriod = useProgressManualStore((s) => s.resetIfNewPeriod);

  const [sleepModalOpen, setSleepModalOpen] = useState(false);
  const [cardioModalOpen, setCardioModalOpen] = useState(false);
  const currentUserIdForHistory = useUserStore((s) => s.currentUser?._id);
  const previousWeekKeyForHistory = getPreviousWeekKey();

  const previousWeekFinalizedAt = useWeeklySignatureStore(
    (s) => s.finalizedWeeks[previousWeekKeyForHistory]
  );
  const hasPreviousWeekData = !!previousWeekFinalizedAt;
  const [activeHistoricWeek, setActiveHistoricWeek] = useState<string | null>(null);
  const [activeHistoricData, setActiveHistoricData] = useState<HistoricWeekData | null>(null);
  const [historicLoading, setHistoricLoading] = useState(false);
  const { getWeeklyFeedbackByWeek: fetchHistoricWeek } = useWeeklyFeedbackApi();

  useEffect(() => {
    if (!activeHistoricWeek || !currentUserIdForHistory) {
      setActiveHistoricData(null);
      return;
    }
    let cancelled = false;
    setHistoricLoading(true);
    const [y, m, d] = activeHistoricWeek.split("-").map(Number);
    const weekStartIso = new Date(y, m - 1, d).toISOString();
    fetchHistoricWeek(currentUserIdForHistory, weekStartIso)
      .then((res) => {
        if (cancelled) return;
        if (!res) {
          setActiveHistoricData({
            workoutsDone: {},
            nutritionMarks: {},
            dayNotes: {},
            sleepHours: null,
            cardioMinutes: null,
            feedbackText: "",
          });
          return;
        }
        const workoutMarksMap: Record<string, boolean> = {};
        (res.workouts || []).forEach((w, i) => {
          if (w.doneManual || w.doneSmart) {
            workoutMarksMap[`${activeHistoricWeek}::${w.planId || `plan-${i}`}`] = true;
          }
        });
        const nutritionMarksMap: Record<string, boolean> = {};
        (res.nutrition?.daysCompleted || []).forEach((day) => {
          nutritionMarksMap[day] = true;
        });
        setActiveHistoricData({
          workoutsDone: workoutMarksMap,
          nutritionMarks: nutritionMarksMap,
          dayNotes: { ...(res.nutrition?.dayNotes || {}) },
          sleepHours: res.sleepHours ?? null,
          cardioMinutes: res.cardioMinutes ?? null,
          feedbackText: res.feedbackText || "",
        });
      })
      .finally(() => {
        if (!cancelled) setHistoricLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeHistoricWeek, currentUserIdForHistory]);

  useEffect(() => {
    resetSleepIfNewWeek();
    resetIfNewPeriod();
    resetFeedbackIfNewWeek();
    resetCardioMinutesIfNewWeek();
  }, [
    resetSleepIfNewWeek,
    resetIfNewPeriod,
    resetFeedbackIfNewWeek,
    resetCardioMinutesIfNewWeek,
  ]);

  const mergedHistoricData = activeHistoricData ?? historicData ?? null;
  const mergedHistoricWeekKey = activeHistoricWeek ?? historicWeekKey ?? null;
  const inHistoric = !!mergedHistoricData;
  const readOnly = readOnlyFromProps || inHistoric;
  const effectiveWorkoutMarks = mergedHistoricData?.workoutsDone ?? manualWorkoutIds;
  const effectiveWorkoutKey = mergedHistoricWeekKey ?? weekKey;
  const effectiveNutritionMarks = mergedHistoricData?.nutritionMarks ?? manualNutritionMarks;
  const effectiveDayNotes = mergedHistoricData?.dayNotes ?? dayNotes;
  const effectiveSleepHours = mergedHistoricData ? mergedHistoricData.sleepHours : sleepHours;
  const effectiveFeedbackText = mergedHistoricData ? mergedHistoricData.feedbackText : feedbackText;

  const workouts = useMemo<WorkoutEntry[]>(() => {
    const plans = workoutPlan?.workoutPlans ?? [];
    if (plans.length === 0) return [];
    const setsByMuscleGroup: Record<string, Set<string>> = {};
    (recordedSets ?? []).forEach((mg) => {
      const mgName = mg.muscleGroup;
      if (!mgName) return;
      if (!setsByMuscleGroup[mgName]) setsByMuscleGroup[mgName] = new Set();
      Object.values(mg.recordedSets ?? {}).forEach((sets) => {
        sets.forEach((s) => {
          if (s.plan && isWithinThisWeek(s.date)) setsByMuscleGroup[mgName].add(s.plan);
        });
      });
    });
    return plans.map((p, i) => {
      const planId = p._id ?? `plan-${i}`;
      const required = p.muscleGroups ?? [];
      const doneSmart =
        !!p._id &&
        required.length > 0 &&
        required.every((mg) => setsByMuscleGroup[mg.muscleGroup]?.has(p._id!));
      const doneManual = !!effectiveWorkoutMarks[`${effectiveWorkoutKey}::${planId}`];
      return { planId, index: i + 1, doneSmart, doneManual };
    });
  }, [workoutPlan, recordedSets, effectiveWorkoutMarks, effectiveWorkoutKey]);

  const weekPoints = useMemo<WeightPoint[]>(() => {
    const entries = (weighIns ?? [])
      .filter((w) => isWithinThisWeek(w.date))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    if (entries.length > 0) {
      return entries.map((w) => ({ weight: w.weight, date: w.date }));
    }
    const start = startOfWeek(new Date());
    return DEMO_WEEK_WEIGHTS.map((w, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return { weight: w, date: d.toISOString() };
    });
  }, [weighIns]);

  const latestWeighIn = useMemo(() => {
    const all = (weighIns ?? [])
      .slice()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return all[0];
  }, [weighIns]);

  const weekDelta = useMemo(() => {
    if (weekPoints.length < 2) return undefined;
    return weekPoints[weekPoints.length - 1].weight - weekPoints[0].weight;
  }, [weekPoints]);

  const cardioType = workoutPlan?.cardio?.type;

  const stepsPlan = useMemo<IStepsCardioType | undefined>(() => {
    if (cardioType !== "steps") return undefined;
    return workoutPlan?.cardio?.plan as IStepsCardioType;
  }, [cardioType, workoutPlan?.cardio]);

  const simplePlan = useMemo<ISimpleCardioType | undefined>(() => {
    if (cardioType !== "simple") return undefined;
    return workoutPlan?.cardio?.plan as ISimpleCardioType;
  }, [cardioType, workoutPlan?.cardio]);

  const rawCardioMinutes = useCardioMinutesStore((s) => s.minutes);
  const cardioMinutesDone = mergedHistoricData ? mergedHistoricData.cardioMinutes : rawCardioMinutes;
  const setCardioMinutes = useCardioMinutesStore((s) => s.setMinutes);
  const resetCardioMinutesIfNewWeek = useCardioMinutesStore((s) => s.resetIfNewWeek);

  const stepsWeeklyGoal = useMemo(
    () => buildGoalsByDay(stepsPlan).reduce((sum, g) => sum + (g || 0), 0),
    [stepsPlan]
  );

  const stepsWeekTotal = useMemo(() => {
    const currentStart = getLocalDateKey(startOfWeek(new Date()));
    const currentWeek = steps.weeks?.find((w) => w.startDate === currentStart);
    if (!currentWeek) return steps.todaySteps ?? 0;
    return currentWeek.days.reduce((sum, d) => sum + (d.steps || 0), 0);
  }, [steps.weeks, steps.todaySteps]);

  const stepsPercent = stepsWeeklyGoal > 0 ? (stepsWeekTotal / stepsWeeklyGoal) * 100 : 0;

  const cardioMinutesGoal = simplePlan?.minsPerWeek ?? 0;
  const cardioMinutesPercent =
    cardioMinutesGoal > 0 && cardioMinutesDone != null
      ? Math.min(100, (cardioMinutesDone / cardioMinutesGoal) * 100)
      : 0;

  const mealsPlanned = dietPlan?.meals?.length ?? 0;
  const mealsDone = session?.meals?.length ?? 0;

  const sleepPercent =
    effectiveSleepHours != null ? Math.min(100, (effectiveSleepHours / SLEEP_TARGET_HOURS) * 100) : 0;
  const sleepPrimary = effectiveSleepHours != null ? formatHours(effectiveSleepHours) : "—";
  const sleepCaption =
    effectiveSleepHours != null ? "יעד: 7-8 שע׳" : "לחץ להזין ממוצע שבועי";

  const handleWorkoutToggle = (planId: string) => {
    if (readOnly) return;
    selectionHaptic();
    toggleWorkoutMark(planId);
  };

  const handleNutritionDayToggle = (dayKey: string) => {
    if (readOnly) return;
    selectionHaptic();
    toggleNutritionMarkForDay(dayKey);
  };

  const handleOpenSleep = () => {
    if (readOnly) return;
    selectionHaptic();
    setSleepModalOpen(true);
  };

  const handleOpenCardio = () => {
    if (readOnly) return;
    selectionHaptic();
    setCardioModalOpen(true);
  };

  return (
    <>
      <ScrollView
        style={[colors.background, layout.flex1]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          popupMode
            ? styles.bodyPopup
            : [spacing.pdLg, spacing.pdStatusBar, spacing.pdBottomBar, styles.body]
        }
      >
        {!popupMode && (
          <View style={styles.titleRow}>
            <Pressable
              onPress={() => {
                if (!hasPreviousWeekData || inHistoric) return;
                selectionHaptic();
                setActiveHistoricWeek(previousWeekKeyForHistory);
              }}
              disabled={!hasPreviousWeekData || inHistoric}
              hitSlop={10}
              style={styles.arrowBtn}
              accessibilityLabel="שבוע קודם"
            >
              <Icon
                name="chevronRightSoft"
                color={hasPreviousWeekData && !inHistoric ? PRIMARY : "rgba(7,39,35,0.18)"}
                width={22}
                height={22}
              />
            </Pressable>
            <View style={styles.titleCenterWrap}>
              <Text fontSize={22} fontVariant="light" style={styles.titleCenter}>
                {inHistoric ? "השבוע הקודם 🔒" : "פידבק שבועי"}
              </Text>
              {inHistoric && mergedHistoricWeekKey && (
                <Text fontSize={12} style={styles.titleSubtitle}>
                  {formatWeekRangeFromKey(mergedHistoricWeekKey)}
                </Text>
              )}
            </View>
            {inHistoric ? (
              <Pressable
                onPress={() => {
                  selectionHaptic();
                  setActiveHistoricWeek(null);
                }}
                hitSlop={10}
                style={styles.arrowBtn}
                accessibilityLabel="שבוע הבא"
              >
                <Icon name="chevronLeftSoft" color={PRIMARY} width={22} height={22} />
              </Pressable>
            ) : (
              <View style={styles.arrowBtn} />
            )}
          </View>
        )}
        <AnimatedShell delay={0}>
          <WorkoutsCard workouts={workouts} onToggle={handleWorkoutToggle} />
        </AnimatedShell>
        <AnimatedShell delay={90}>
          <NutritionCard
            mealsDone={mealsDone}
            mealsPlanned={mealsPlanned}
            marks={effectiveNutritionMarks}
            notes={effectiveDayNotes}
            onToggleDay={handleNutritionDayToggle}
            onOpenNote={
              readOnly ? () => {} : (dayKey, dayLabel) => setNoteModal({ dayKey, dayLabel })
            }
            allowAllDays={popupMode && !readOnly}
            baseWeekKey={mergedHistoricWeekKey ?? undefined}
          />
        </AnimatedShell>
        <AnimatedShell delay={180}>
          <MetricsCard
            weekPoints={weekPoints}
            latestWeight={latestWeighIn?.weight ?? weekPoints[weekPoints.length - 1]?.weight}
            latestDate={latestWeighIn?.date ?? weekPoints[weekPoints.length - 1]?.date}
            weekDelta={weekDelta}
          />
        </AnimatedShell>
        <View style={styles.statsRow}>
          <AnimatedShell delay={270} style={styles.statCardWrap}>
            <StatCard
              title="שינה"
              icon={<Text fontSize={13}>🌙</Text>}
              percent={sleepPercent}
              primary={sleepPrimary}
              caption={sleepCaption}
              onPress={readOnly ? undefined : handleOpenSleep}
              editable={!readOnly}
              editLabel={effectiveSleepHours != null ? `${formatSleep(effectiveSleepHours)} שעות` : "הזן ממוצע"}
            />
          </AnimatedShell>
          <AnimatedShell delay={330} style={styles.statCardWrap}>
            {cardioType === "simple" ? (
              <StatCard
                title="אירובי"
                icon={<Text fontSize={13}>🏃</Text>}
                percent={cardioMinutesPercent}
                primary={`${cardioMinutesDone ?? 0} דק׳`}
                caption={
                  cardioMinutesGoal > 0
                    ? `יעד: ${cardioMinutesGoal} דק׳`
                    : "לחץ להזין דקות"
                }
                onPress={readOnly ? undefined : handleOpenCardio}
                editable={!readOnly}
                editLabel={
                  cardioMinutesDone != null ? `${cardioMinutesDone} דק׳` : "הזן דקות"
                }
              />
            ) : (
              <StatCard
                title="צעדים"
                icon={<Text fontSize={13}>👟</Text>}
                percent={stepsPercent}
                primary={formatSteps(stepsWeekTotal)}
                caption={
                  stepsWeeklyGoal > 0
                    ? `יעד שבועי: ${formatSteps(stepsWeeklyGoal)}`
                    : "לא הוגדר יעד"
                }
              />
            )}
          </AnimatedShell>
        </View>
        <AnimatedShell delay={400}>
          <FeedbackCard
            text={effectiveFeedbackText}
            onChange={readOnly ? () => {} : setFeedbackText}
            readOnly={readOnly}
          />
        </AnimatedShell>
      </ScrollView>
      <SleepInputModal
        visible={sleepModalOpen}
        initial={sleepHours}
        onClose={() => setSleepModalOpen(false)}
        onSave={setSleepHours}
      />
      <CardioMinutesModal
        visible={cardioModalOpen}
        initial={cardioMinutesDone}
        goal={cardioMinutesGoal}
        onClose={() => setCardioModalOpen(false)}
        onSave={setCardioMinutes}
      />
      <NoteInputModal
        visible={!!noteModal}
        dayLabel={noteModal?.dayLabel ?? ""}
        initial={noteModal ? dayNotes[noteModal.dayKey] ?? "" : ""}
        onClose={() => setNoteModal(null)}
        onSave={(note) => {
          if (noteModal) setDayNote(noteModal.dayKey, note);
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  body: {
    gap: 14,
  },
  bodyPopup: {
    padding: 12,
    gap: 8,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  titleCenterWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  titleCenter: {
    color: PRIMARY,
    textAlign: "center",
  },
  titleSubtitle: {
    color: MUTED,
    textAlign: "center",
    marginTop: 2,
  },
  arrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  screenTitle: {
    color: PRIMARY,
    marginBottom: 2,
    alignSelf: "flex-start",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: {
    color: PRIMARY,
  },
  emptyState: {
    color: MUTED,
    textAlign: "center",
    paddingVertical: 6,
  },
  hintText: {
    color: MUTED,
    textAlign: "center",
    lineHeight: 14,
  },
  pillsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 6,
  },
  pill: {
    flex: 1,
    height: 66,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    gap: 1,
  },
  pillActive: {
    backgroundColor: ACCENT_SOFT,
    borderColor: ACCENT,
  },
  pillMuted: {
    backgroundColor: "#F5F6F7",
    borderColor: "rgba(0,0,0,0.08)",
  },
  pillBadge: {
    width: 16,
    height: 16,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  pillBadgeActive: {
    backgroundColor: ACCENT,
  },
  pillBadgeMuted: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.18)",
    borderStyle: "dashed",
  },
  pillBadgeText: {
    color: "#FFFFFF",
    lineHeight: 12,
  },
  pillLabel: {
    color: MUTED,
  },
  pillNumber: {
    color: PRIMARY,
  },
  adherenceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  adherenceMeta: {
    flex: 1,
    alignItems: "flex-start",
    gap: 2,
  },
  adherenceTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: TRACK,
    overflow: "hidden",
  },
  bigNum: {
    color: PRIMARY,
  },
  mutedInline: {
    color: MUTED,
  },
  feedbackInputWrap: {
    position: "relative",
  },
  feedbackPlaceholderWrap: {
    position: "absolute",
    top: 14,
    right: 14,
    left: 14,
    zIndex: 5,
    elevation: 5,
  },
  feedbackPlaceholderText: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "left",
    writingDirection: "rtl",
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: CARD_BORDER,
    borderRadius: 12,
    padding: 12,
    minHeight: 96,
    fontSize: 14,
    color: PRIMARY,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 20,
  },
  signModalRoot: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  signBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(6, 20, 16, 0.55)",
  },
  signCard: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 16,
  },
  signLockCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: ACCENT_SOFT,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  signTitle: {
    color: PRIMARY,
    textAlign: "center",
  },
  signSubtitle: {
    color: MUTED,
    marginTop: 4,
    marginBottom: 16,
  },
  signSummaryBox: {
    width: "100%",
    backgroundColor: "#F5F7F6",
    borderRadius: 14,
    padding: 12,
    gap: 8,
    marginBottom: 12,
  },
  signSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  signSummaryLabel: {
    color: PRIMARY,
  },
  signSummaryValue: {
    color: PRIMARY,
  },
  signFeedbackPreview: {
    width: "100%",
    backgroundColor: "#FAFBFA",
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  signFeedbackLabel: {
    color: MUTED,
    marginBottom: 4,
  },
  signFeedbackText: {
    color: PRIMARY,
    lineHeight: 18,
    textAlign: "right",
  },
  signNoFeedback: {
    color: MUTED,
    marginBottom: 14,
    fontStyle: "italic",
  },
  signPrimaryBtn: {
    width: "100%",
    backgroundColor: ACCENT,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  signPrimaryText: {
    color: "#FFFFFF",
  },
  signSecondaryBtn: {
    marginTop: 10,
    paddingVertical: 6,
  },
  signSecondaryText: {
    color: MUTED,
    textDecorationLine: "underline",
  },
  editBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: ACCENT_SOFT,
    borderWidth: 1,
    borderColor: "rgba(23, 178, 106, 0.35)",
    zIndex: 5,
  },
  editBadgeText: {
    color: "#0F7A52",
  },
  popupSendBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    overflow: "hidden",
  },
  popupSendBtnText: { color: "#FFFFFF" },
  feedbackHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  feedbackHeaderEnd: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  autosaveWrap: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: ACCENT_SOFT,
  },
  autosaveText: {
    color: "#0F7A52",
  },
  chartWrap: {
    height: 72,
    width: "100%",
  },
  chartInner: {
    position: "relative",
    width: "100%",
    height: "100%",
  },
  chartSubtitle: {
    color: ACCENT,
    alignSelf: "flex-start",
    marginTop: -6,
  },
  sleepWheelStage: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  sleepWheelBand: {
    position: "absolute",
    top: 48,
    height: 48,
    left: 16,
    right: 16,
    backgroundColor: "#F1F3F2",
    borderRadius: 12,
  },
  logToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: CARD_BORDER,
  },
  logToggleText: {
    color: PRIMARY,
  },
  dayList: {
    gap: 6,
    paddingTop: 4,
  },
  dayRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#F5F6F7",
    borderRadius: 10,
  },
  dayLabelGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dayEndGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  noteChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(7, 39, 35, 0.18)",
    backgroundColor: "#FFFFFF",
    minWidth: 52,
    alignItems: "center",
  },
  dayBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    minWidth: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  dayBadgeActive: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  dayBadgeMuted: {
    borderColor: "rgba(7, 39, 35, 0.18)",
    backgroundColor: "#FFFFFF",
  },
  dayBadgeTextActive: {
    color: "#FFFFFF",
    lineHeight: 15,
  },
  dayBadgeTextMuted: {
    color: "rgba(7, 39, 35, 0.25)",
    lineHeight: 15,
  },
  noteChipFilled: {
    borderColor: ACCENT,
    backgroundColor: ACCENT_SOFT,
  },
  noteChipText: {
    color: MUTED,
  },
  noteChipTextFilled: {
    color: "#0F5E3B",
  },
  noteInput: {
    borderWidth: 1,
    borderColor: CARD_BORDER,
    borderRadius: 12,
    padding: 12,
    minHeight: 100,
    fontSize: 14,
    color: PRIMARY,
    textAlign: "right",
    lineHeight: 20,
  },
  dayRowDisabled: {
    opacity: 0.5,
  },
  dayLabel: {
    color: PRIMARY,
  },
  dayTodayTag: {
    color: ACCENT,
  },
  metricsFoot: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  trendUp: {
    color: ACCENT,
  },
  mutedSmall: {
    color: MUTED,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statCardWrap: {
    flex: 1,
  },
  statCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  statHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statBody: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  ringWrap: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
  },
  ringLabel: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  ringPercent: {
    color: PRIMARY,
  },
  statMeta: {
    flex: 1,
    gap: 2,
    alignItems: "flex-start",
  },
  statPrimary: {
    color: PRIMARY,
    textAlign: "right",
    writingDirection: "rtl",
  },
  modalRoot: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(11, 42, 34, 0.45)",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    gap: 12,
  },
  sheetTitle: {
    color: PRIMARY,
    textAlign: "center",
  },
  sheetHint: {
    color: MUTED,
    textAlign: "center",
  },
  confirmBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  confirmText: {
    color: "#FFFFFF",
  },
});

export default WeeklyProgressScreen;
