import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, StyleSheet, Pressable, Modal, ScrollView } from "react-native";
import Svg, { Defs, LinearGradient as SvgLinearGradient, Stop, Rect } from "react-native-svg";
import { Text } from "../ui/Text";
import useDietPlanQuery from "@/hooks/queries/useDietPlanQuery";
import { selectionHaptic } from "@/utils/haptics";
import {
  ChevronDownIcon,
  DIET_V2_CARD_BORDER,
  DIET_V2_GREEN,
  DIET_V2_MUTED,
  DropIcon,
  FlameIcon,
  SproutIcon,
  DrumstickIcon,
} from "../DietPlanV2/dietV2Icons";

const KCAL_PER_SERVING = { protein: 75, carbs: 70, fat: 45 };

const formatVal = (n: number): string => (Number.isInteger(n) ? String(n) : n.toFixed(1));

const GRAD_DARK = "#047857";
const GRAD_LIGHT = "#86EFAC";
const RED_DARK = "#DC2626";
const RED_LIGHT = "#FCA5A5";

const GradientBar: React.FC<{
  fraction: number;
  height: number;
  over?: boolean;
  style?: object;
}> = ({ fraction, height, over = false, style }) => {
  const [width, setWidth] = useState(0);
  const clamped = Math.max(0, Math.min(1, fraction));
  const fillW = Math.round(width * clamped);
  const gradId = useMemo(() => `grad-${Math.random().toString(36).slice(2, 9)}`, []);

  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={[
        {
          height,
          borderRadius: 999,
          backgroundColor: "#E5E7EB",
          overflow: "hidden",
          alignSelf: "stretch",
        },
        style,
      ]}
    >
      {width > 0 && fillW > 0 && (
        <Svg width={width} height={height}>
          <Defs>
            <SvgLinearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={over ? RED_DARK : GRAD_DARK} />
              <Stop offset="1" stopColor={over ? RED_LIGHT : GRAD_LIGHT} />
            </SvgLinearGradient>
          </Defs>
          <Rect
            x={width - fillW}
            y={0}
            width={fillW}
            height={height}
            rx={height / 2}
            fill={`url(#${gradId})`}
          />
        </Svg>
      )}
    </View>
  );
};

const useCountUp = (value: number, duration = 500): number => {
  const [display, setDisplay] = useState(value);
  const displayRef = useRef(value);

  useEffect(() => {
    const from = displayRef.current;
    const to = value;
    if (from === to) return;

    const start = Date.now();
    let raf = 0;
    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const cur = Math.round(from + (to - from) * eased);
      displayRef.current = cur;
      setDisplay(cur);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        displayRef.current = to;
        setDisplay(to);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return display;
};

const CalorieHeadline: React.FC<{ consumed: number; target: number }> = ({ consumed, target }) => {
  const shown = useCountUp(Math.round(consumed));
  const clamped = target > 0 ? Math.max(0, Math.min(1, consumed / target)) : 0;
  const over = target > 0 && consumed > target;

  return (
    <View style={styles.headline}>
      <Text fontVariant="semibold" fontSize={60} style={styles.headlineBig}>
        <Text fontVariant="light" fontSize={40} style={styles.headlineTarget}>
          {`${Math.round(target)} `}
        </Text>
        <Text fontVariant="light" fontSize={40} style={styles.headlineTarget}>
          {`/ `}
        </Text>
        {shown}
        <Text fontVariant="light" fontSize={18} style={styles.headlineTarget}>
          {` קק"ל`}
        </Text>
      </Text>
      <GradientBar fraction={clamped} height={8} over={over} style={styles.headlineBar} />
    </View>
  );
};

interface OptionsModalProps {
  open: boolean;
  title: string;
  value: number;
  options: number[];
  unit: string;
  onPick: (n: number) => void;
  onClose: () => void;
}

const OptionsModal: React.FC<OptionsModalProps> = ({
  open,
  title,
  value,
  options,
  unit,
  onPick,
  onClose,
}) => (
  <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
    <Pressable style={styles.backdrop} onPress={onClose}>
      <Pressable style={styles.sheet} onPress={() => {}}>
        <View style={styles.sheetHeader}>
          <Text fontVariant="bold" fontSize={14} style={styles.sheetTitle}>
            {title}
          </Text>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          {options.map((opt) => {
            const selected = opt === value;
            return (
              <Pressable
                key={opt}
                onPress={() => onPick(opt)}
                style={[styles.option, selected && styles.optionSelected]}
              >
                <Text
                  fontVariant={selected ? "bold" : "medium"}
                  fontSize={15}
                  style={selected ? styles.optionTextSelected : styles.optionText}
                >
                  {`${formatVal(opt)} ${unit}`}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </Pressable>
    </Pressable>
  </Modal>
);

interface MacroDatum {
  label: string;
  consumed: number;
  target: number;
  options: number[];
  unit: string;
  onChange: (next: number) => void;
  Icon: React.FC<{ size?: number; color?: string }>;
}

const MacroBox: React.FC<MacroDatum> = ({
  label,
  consumed,
  target,
  options,
  unit,
  onChange,
  Icon,
}) => {
  const [open, setOpen] = useState(false);
  const clamped = target > 0 ? Math.max(0, Math.min(1, consumed / target)) : 0;
  const over = target > 0 && consumed > target;

  const pick = (n: number) => {
    selectionHaptic();
    onChange(n);
    setOpen(false);
  };

  return (
    <>
      <Pressable style={styles.box} onPress={() => setOpen(true)}>
        <View style={styles.boxLabelRow}>
          <Text fontSize={12} fontVariant="semibold" style={styles.boxLabel}>
            {label}
          </Text>
          <Icon size={13} color={DIET_V2_GREEN} />
        </View>
        <View style={styles.boxValueRow}>
          <Text fontVariant="bold" fontSize={17} style={styles.boxValue}>
            {`${formatVal(consumed)}/${formatVal(target)}`}
          </Text>
          <View style={styles.boxChevron}>
            <ChevronDownIcon size={13} color={DIET_V2_GREEN} />
          </View>
        </View>
        <GradientBar fraction={clamped} height={6} over={over} />
      </Pressable>
      <OptionsModal
        open={open}
        title={label}
        value={consumed}
        options={options}
        unit={unit}
        onPick={pick}
        onClose={() => setOpen(false)}
      />
    </>
  );
};

const sumServings = (
  meals: {
    totalProtein?: { quantity?: number };
    totalCarbs?: { quantity?: number };
    totalFats?: { quantity?: number };
  }[],
  pick: "totalProtein" | "totalCarbs" | "totalFats"
): number => meals.reduce((acc, m) => acc + (m[pick]?.quantity ?? 0), 0);

const range = (from: number, to: number, step: number): number[] => {
  const out: number[] = [];
  for (let v = from; v <= to; v += step) out.push(Math.round(v * 100) / 100);
  return out;
};

const DailyCalorieIntakeStyle1 = () => {
  const { data } = useDietPlanQuery();
  const { totalCalories = 0, freeCalories = 0, meals = [] } = data || {};

  const targets = useMemo(
    () => ({
      protein: sumServings(meals, "totalProtein"),
      carbs: sumServings(meals, "totalCarbs"),
      fat: sumServings(meals, "totalFats"),
    }),
    [meals]
  );

  const proteinOptions = useMemo(() => range(0, 10, 0.5), []);
  const carbsOptions = useMemo(() => range(0, 30, 0.5), []);
  const fatOptions = useMemo(() => range(0, 15, 0.5), []);
  const freeOptions = useMemo(() => range(0, 900, 10), []);

  const [consumed, setConsumed] = useState({
    protein: 0,
    carbs: 0,
    fat: 0,
    free: 0,
  });

  const consumedCalories = Math.round(
    consumed.protein * KCAL_PER_SERVING.protein +
      consumed.carbs * KCAL_PER_SERVING.carbs +
      consumed.fat * KCAL_PER_SERVING.fat +
      consumed.free
  );

  const macros: MacroDatum[] = [
    {
      label: "חלבון",
      consumed: consumed.protein,
      target: targets.protein,
      options: proteinOptions,
      unit: "מנות",
      onChange: (n) => setConsumed((c) => ({ ...c, protein: n })),
      Icon: DrumstickIcon,
    },
    {
      label: "פחמימה",
      consumed: consumed.carbs,
      target: targets.carbs,
      options: carbsOptions,
      unit: "מנות",
      onChange: (n) => setConsumed((c) => ({ ...c, carbs: n })),
      Icon: SproutIcon,
    },
    {
      label: "שומן",
      consumed: consumed.fat,
      target: targets.fat,
      options: fatOptions,
      unit: "מנות",
      onChange: (n) => setConsumed((c) => ({ ...c, fat: n })),
      Icon: DropIcon,
    },
    {
      label: "חופשיות",
      consumed: consumed.free,
      target: freeCalories,
      options: freeOptions,
      unit: 'קק"ל',
      onChange: (n) => setConsumed((c) => ({ ...c, free: n })),
      Icon: FlameIcon,
    },
  ];

  return (
    <View style={styles.wrap}>
      <CalorieHeadline consumed={consumedCalories} target={totalCalories} />
      <View style={styles.boxesRow}>
        {macros.map((m) => (
          <MacroBox key={`box-${m.label}`} {...m} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    alignItems: "center",
    gap: 16,
  },
  headline: {
    alignSelf: "stretch",
    alignItems: "center",
    paddingVertical: 14,
  },
  headlineBig: {
    color: "#0B2A22",
    lineHeight: 66,
    letterSpacing: -1.5,
    writingDirection: "ltr",
    textAlign: "center",
    fontStyle: "italic",
  },
  headlineTarget: {
    color: DIET_V2_MUTED,
    letterSpacing: -1,
    writingDirection: "ltr",
    fontStyle: "italic",
  },
  headlineBar: {
    width: "88%",
    alignSelf: "center",
    marginTop: 10,
  },
  boxesRow: {
    flexDirection: "row",
    alignSelf: "stretch",
    gap: 8,
  },
  box: {
    flex: 1,
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DIET_V2_CARD_BORDER,
    backgroundColor: "#F8FAF9",
    alignItems: "center",
  },
  boxLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  boxLabel: {
    color: "#0B2A22",
  },
  boxValueRow: {
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
  },
  boxValue: {
    color: "#0B2A22",
    writingDirection: "ltr",
    textAlign: "center",
  },
  boxChevron: {
    position: "absolute",
    left: 4,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(11, 42, 34, 0.4)",
    justifyContent: "center",
    paddingHorizontal: 60,
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    maxHeight: 340,
    paddingBottom: 6,
  },
  sheetHeader: {
    paddingVertical: 10,
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: DIET_V2_CARD_BORDER,
  },
  sheetTitle: {
    color: "#0B2A22",
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  optionSelected: {
    backgroundColor: "#F0FDF4",
  },
  optionText: {
    color: "#4B5563",
  },
  optionTextSelected: {
    color: DIET_V2_GREEN,
  },
});

export default DailyCalorieIntakeStyle1;
