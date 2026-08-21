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
import { IStepsCardioType } from "@/interfaces/Workout";
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

const buildWeekDayKeys = (): { label: string; key: string; isToday: boolean; isFuture: boolean }[] => {
  const start = startOfWeek(new Date());
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
      isToday: d.getTime() === today.getTime(),
      isFuture: d.getTime() > today.getTime(),
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
}> = ({ mealsDone, mealsPlanned, marks, notes, onToggleDay, onOpenNote }) => {
  const [logOpen, setLogOpen] = useState(false);
  const smartDoneToday = mealsPlanned > 0 && mealsDone >= mealsPlanned;
  const weekDays = useMemo(buildWeekDayKeys, []);

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
                style={[styles.dayRow, day.isFuture && styles.dayRowDisabled]}
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
                    onPress={() => !day.isFuture && onToggleDay(day.key)}
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
}> = ({ title, icon, percent, primary, caption, onPress }) => {
  const Container = onPress ? Pressable : View;
  return (
    <Container onPress={onPress} style={[styles.card, styles.statCard]}>
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
  onSave: () => void;
}> = ({ text, onChange, onSave }) => {
  const [justSaved, setJustSaved] = useState(false);

  const handleSave = () => {
    if (text.trim().length === 0) return;
    onSave();
    setJustSaved(true);
    const t = setTimeout(() => setJustSaved(false), 1600);
    return () => clearTimeout(t);
  };

  return (
    <View style={styles.card}>
      <CardHeader
        title="פידבק שבועי"
        icon={<Icon name="chat" color={PRIMARY} width={16} height={16} />}
      />
      <View style={styles.feedbackInputWrap}>
        <TextInput
          value={text}
          onChangeText={onChange}
          multiline
          numberOfLines={5}
          style={styles.feedbackInput}
          textAlignVertical="top"
        />
        {text.trim().length === 0 && (
          <View pointerEvents="none" style={styles.feedbackPlaceholderWrap}>
            <RNText allowFontScaling={false} style={styles.feedbackPlaceholderText}>
              איך עבר לך השבוע? היו קשיים או משהו שאני צריך לדעת?
            </RNText>
          </View>
        )}
      </View>
      <Pressable
        onPress={handleSave}
        disabled={text.trim().length === 0}
        style={[
          styles.sendBtn,
          text.trim().length === 0 && styles.sendBtnDisabled,
          justSaved && styles.sendBtnSaved,
        ]}
      >
        <Text fontVariant="bold" fontSize={14} style={styles.sendBtnText}>
          {justSaved ? "נשמר ✓" : "שמור פידבק למאמן"}
        </Text>
      </Pressable>
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

const WeeklyProgressScreen = () => {
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

  useEffect(() => {
    resetSleepIfNewWeek();
    resetIfNewPeriod();
    resetFeedbackIfNewWeek();
  }, [resetSleepIfNewWeek, resetIfNewPeriod, resetFeedbackIfNewWeek]);

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
      const doneManual = !!manualWorkoutIds[`${weekKey}::${planId}`];
      return { planId, index: i + 1, doneSmart, doneManual };
    });
  }, [workoutPlan, recordedSets, manualWorkoutIds, weekKey]);

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

  const stepsPlan = useMemo<IStepsCardioType | undefined>(() => {
    if (workoutPlan?.cardio?.type !== "steps") return undefined;
    return workoutPlan.cardio.plan as IStepsCardioType;
  }, [workoutPlan?.cardio]);

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

  const mealsPlanned = dietPlan?.meals?.length ?? 0;
  const mealsDone = session?.meals?.length ?? 0;

  const sleepPercent =
    sleepHours != null ? Math.min(100, (sleepHours / SLEEP_TARGET_HOURS) * 100) : 0;
  const sleepPrimary = sleepHours != null ? formatHours(sleepHours) : "—";
  const sleepCaption =
    sleepHours != null ? "יעד: 7-8 שע׳" : "לחץ להזנה";

  const handleWorkoutToggle = (planId: string) => {
    selectionHaptic();
    toggleWorkoutMark(planId);
  };

  const handleNutritionDayToggle = (dayKey: string) => {
    selectionHaptic();
    toggleNutritionMarkForDay(dayKey);
  };

  const handleOpenSleep = () => {
    selectionHaptic();
    setSleepModalOpen(true);
  };

  const handleSaveFeedback = () => {
    if (feedbackText.trim().length === 0) return;
    selectionHaptic();
    setFeedbackText(feedbackText.trim());
  };

  return (
    <>
      <ScrollView
        style={[colors.background, layout.flex1]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          spacing.pdLg,
          spacing.pdStatusBar,
          spacing.pdBottomBar,
          styles.body,
        ]}
      >
        <View style={styles.titleRow}>
          <Pressable
            onPress={() => selectionHaptic()}
            hitSlop={10}
            style={styles.arrowBtn}
            accessibilityLabel="שבוע קודם"
          >
            <Icon name="chevronRightSoft" color={PRIMARY} width={22} height={22} />
          </Pressable>
          <Text fontSize={22} fontVariant="light" style={styles.titleCenter}>
            פידבק שבועי
          </Text>
          <Pressable
            onPress={() => selectionHaptic()}
            hitSlop={10}
            style={styles.arrowBtn}
            accessibilityLabel="שבוע הבא"
          >
            <Icon name="chevronLeftSoft" color={PRIMARY} width={22} height={22} />
          </Pressable>
        </View>
        <AnimatedShell delay={0}>
          <WorkoutsCard workouts={workouts} onToggle={handleWorkoutToggle} />
        </AnimatedShell>
        <AnimatedShell delay={90}>
          <NutritionCard
            mealsDone={mealsDone}
            mealsPlanned={mealsPlanned}
            marks={manualNutritionMarks}
            notes={dayNotes}
            onToggleDay={handleNutritionDayToggle}
            onOpenNote={(dayKey, dayLabel) => setNoteModal({ dayKey, dayLabel })}
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
              onPress={handleOpenSleep}
            />
          </AnimatedShell>
          <AnimatedShell delay={330} style={styles.statCardWrap}>
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
          </AnimatedShell>
        </View>
        <AnimatedShell delay={400}>
          <FeedbackCard
            text={feedbackText}
            onChange={setFeedbackText}
            onSave={handleSaveFeedback}
          />
        </AnimatedShell>
      </ScrollView>
      <SleepInputModal
        visible={sleepModalOpen}
        initial={sleepHours}
        onClose={() => setSleepModalOpen(false)}
        onSave={setSleepHours}
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
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  titleCenter: {
    color: PRIMARY,
    textAlign: "center",
    flex: 1,
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
  sendBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
  sendBtnSaved: {
    backgroundColor: ACCENT,
  },
  sendBtnText: {
    color: "#FFFFFF",
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
  },
  statPrimary: {
    color: PRIMARY,
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
