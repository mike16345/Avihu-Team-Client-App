import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, StyleSheet, Pressable, TextInput, Modal } from "react-native";
import Svg, { Defs, LinearGradient as SvgLinearGradient, Stop, Rect } from "react-native-svg";
import { Text } from "../ui/Text";
import WheelPicker from "../ui/WheelPicker";
import { useDietServingsStore } from "@/store/dietServingsStore";
import useDietPlanQuery from "@/hooks/queries/useDietPlanQuery";
import { IMeal } from "@/interfaces/DietPlan";
import {
  SproutIcon,
  DropIcon,
  FlameIcon,
  DrumstickIcon,
  ChevronDownIcon,
  DIET_V2_GREEN,
  DIET_V2_MUTED,
  DIET_V2_DARK,
  DIET_V2_CARD_BORDER,
} from "../DietPlanV2/dietV2Icons";

type CatKey = "protein" | "carbs" | "fat" | "free" | "veg";

interface CatDef {
  key: CatKey;
  label: string;
  step: number;
  unit: string;
  Icon: React.FC<{ size?: number; color?: string }>;
}

const CATS: CatDef[] = [
  { key: "protein", label: "חלבון", step: 0.5, unit: "מנות", Icon: DrumstickIcon },
  { key: "carbs", label: "פחמימה", step: 0.5, unit: "מנות", Icon: SproutIcon },
  { key: "fat", label: "שומן", step: 0.5, unit: "מנות", Icon: DropIcon },
  { key: "veg", label: "ירקות", step: 1, unit: "מנות", Icon: SproutIcon },
  { key: "free", label: "חופשיות", step: 10, unit: 'קק"ל', Icon: FlameIcon },
];

const formatVal = (n: number): string => (Number.isInteger(n) ? String(n) : n.toFixed(1));

const sumMealField = (
  meals: IMeal[],
  field: "totalProtein" | "totalCarbs" | "totalFats" | "totalVeggies"
): number => meals.reduce((acc, m) => acc + (m[field]?.quantity ?? 0), 0);

const GRAD_DARK = "#047857";
const GRAD_LIGHT = "#86EFAC";
const RED_DARK = "#DC2626";
const RED_LIGHT = "#FCA5A5";
const BAR_H = 5;

const useAnimatedValue = (value: number, duration = 450): number => {
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
      const cur = from + (to - from) * eased;
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

const GradientBar: React.FC<{ fraction: number; over: boolean }> = ({ fraction, over }) => {
  const [width, setWidth] = useState(0);
  const clamped = useAnimatedValue(Math.max(0, Math.min(1, fraction)));
  const fillW = Math.round(width * clamped);
  const gradId = useMemo(() => `sgrad-${Math.random().toString(36).slice(2, 9)}`, []);

  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={styles.track}>
      {width > 0 && fillW > 0 && (
        <Svg width={width} height={BAR_H}>
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
            height={BAR_H}
            rx={BAR_H / 2}
            fill={`url(#${gradId})`}
          />
        </Svg>
      )}
    </View>
  );
};

const ITEM_H = 36;

const WheelButton: React.FC<{
  value: number;
  onPress: () => void;
}> = ({ value, onPress }) => (
  <Pressable style={styles.wheel} onPress={onPress}>
    <Text fontVariant="bold" fontSize={16} style={styles.value}>
      {formatVal(value)}
    </Text>
    <View style={styles.wheelChevron}>
      <ChevronDownIcon size={11} color="#0B5E37" />
    </View>
  </Pressable>
);

interface WheelModalProps {
  visible: boolean;
  title: string;
  unit: string;
  value: number;
  max: number;
  step: number;
  onPick: (v: number) => void;
  onClose: () => void;
}

const WheelModal: React.FC<WheelModalProps> = ({
  visible,
  title,
  unit,
  value,
  max,
  step,
  onPick,
  onClose,
}) => {
  const options = useMemo(() => {
    const count = Math.max(1, Math.round(max / step)) + 1;
    return Array.from({ length: count }).map((_, i) => {
      const v = Math.round(i * step * 100) / 100;
      return { value: v, label: formatVal(v) };
    });
  }, [max, step]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.sheetHeader}>
            <Text fontVariant="bold" fontSize={16} style={styles.sheetTitle}>
              {title}
            </Text>
            <Text fontSize={12} style={styles.sheetUnit}>
              {unit}
            </Text>
          </View>
          <View style={styles.wheelStage}>
            <View pointerEvents="none" style={styles.selectionBand} />
            <WheelPicker
              data={options}
              selectedValue={value}
              onValueChange={(v: number) => onPick(v)}
              height={144}
              itemHeight={36}
              activeItemColor={DIET_V2_DARK}
              inactiveItemColor="#B7BEBB"
            />
          </View>
          <ConfirmButton onPress={onClose} />
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const ConfirmButton: React.FC<{ onPress: () => void }> = ({ onPress }) => {
  const [dims, setDims] = useState({ w: 0, h: 0 });

  return (
    <Pressable
      style={styles.confirmBtn}
      onPress={onPress}
      onLayout={(e) =>
        setDims({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })
      }
    >
      {dims.w > 0 && (
        <Svg width={dims.w} height={dims.h} style={StyleSheet.absoluteFill}>
          <Defs>
            <SvgLinearGradient id="confirmGrad" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={GRAD_LIGHT} />
              <Stop offset="1" stopColor={GRAD_DARK} />
            </SvgLinearGradient>
          </Defs>
          <Rect x={0} y={0} width={dims.w} height={dims.h} rx={10} fill="url(#confirmGrad)" />
        </Svg>
      )}
      <Text fontVariant="bold" fontSize={15} style={styles.confirmTxt}>
        אישור
      </Text>
    </Pressable>
  );
};

const ServingsTracker = () => {
  const { data: plan } = useDietPlanQuery();
  const meals: IMeal[] = plan?.meals ?? [];
  const targets: Record<CatKey, number> = {
    protein: sumMealField(meals, "totalProtein"),
    carbs: sumMealField(meals, "totalCarbs"),
    fat: sumMealField(meals, "totalFats"),
    veg: plan?.veggiesPerDay ?? sumMealField(meals, "totalVeggies"),
    free: plan?.freeCalories ?? 0,
  };

  const servings = useDietServingsStore();
  const [open, setOpen] = useState(false);
  const [activeWheel, setActiveWheel] = useState<CatKey | null>(null);
  const activeCat = CATS.find((c) => c.key === activeWheel);

  return (
    <View style={[styles.wrap, !open && styles.wrapClosed]}>
      <Pressable style={styles.bar} onPress={() => setOpen((v) => !v)}>
        <Text fontVariant="semibold" fontSize={15} style={styles.title}>
          תיעוד אכילה יומי
        </Text>
        <View style={open ? styles.chevronOpen : undefined}>
          <ChevronDownIcon size={16} color={DIET_V2_GREEN} />
        </View>
      </Pressable>

      {open && (
        <View style={styles.panel}>
          {CATS.map((cat) => {
            const value = servings[cat.key];
            const target = targets[cat.key];
            const fraction = target > 0 ? Math.max(0, Math.min(1, value / target)) : 0;
            const over = target > 0 && value > target;

            return (
              <View key={cat.key} style={styles.row}>
                <View style={styles.rowTop}>
                  <View style={styles.labelGroup}>
                    <cat.Icon size={16} color={DIET_V2_GREEN} />
                    <Text fontVariant="semibold" fontSize={14} style={styles.label}>
                      {cat.label}
                    </Text>
                  </View>
                  {cat.key === "free" ? (
                    <View style={styles.freeGroup}>
                      <Text fontVariant="semibold" fontSize={17} style={styles.freeTarget}>
                        {`/ ${formatVal(target)}`}
                      </Text>
                      <TextInput
                        value={value ? String(value) : ""}
                        onChangeText={(t) => servings.setValue("free", Number(t.replace(/[^0-9]/g, "")) || 0)}
                        keyboardType="number-pad"
                        placeholder="0"
                        placeholderTextColor={DIET_V2_MUTED}
                        style={styles.freeInput}
                      />
                    </View>
                  ) : (
                    <View style={styles.wheelGroup}>
                      <Text fontVariant="semibold" fontSize={17} style={styles.freeTarget}>
                        {`/ ${formatVal(target)}`}
                      </Text>
                      <WheelButton value={value} onPress={() => setActiveWheel(cat.key)} />
                    </View>
                  )}
                </View>
                <GradientBar fraction={fraction} over={over} />
              </View>
            );
          })}
        </View>
      )}
      {activeCat && (
        <WheelModal
          visible={!!activeWheel}
          title={activeCat.label}
          unit={activeCat.unit}
          value={servings[activeCat.key]}
          max={targets[activeCat.key]}
          step={activeCat.step}
          onPick={(v) => servings.setValue(activeCat.key, v)}
          onClose={() => setActiveWheel(null)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignSelf: "stretch",
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DIET_V2_CARD_BORDER,
    backgroundColor: "transparent",
    paddingHorizontal: 18,
    paddingVertical: 10,
    gap: 8,
  },
  wrapClosed: {
    backgroundColor: "rgba(134, 239, 172, 0.22)",
    borderColor: "rgba(134, 239, 172, 0.55)",
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    color: DIET_V2_DARK,
  },
  chevronOpen: {
    transform: [{ rotate: "180deg" }],
  },
  panel: {
    gap: 14,
    paddingTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: DIET_V2_CARD_BORDER,
  },
  row: {
    gap: 6,
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  labelGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  label: {
    color: DIET_V2_DARK,
  },
  value: {
    color: DIET_V2_DARK,
    minWidth: 40,
    textAlign: "center",
    writingDirection: "ltr",
  },
  wheelGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  wheel: {
    height: ITEM_H,
    width: 78,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#0B5E37",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  wheelChevron: {
    opacity: 0.55,
  },
  freeGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  freeTarget: {
    color: DIET_V2_MUTED,
    writingDirection: "ltr",
  },
  freeInput: {
    width: 78,
    height: ITEM_H,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#0B5E37",
    backgroundColor: "#FFFFFF",
    textAlign: "center",
    color: DIET_V2_DARK,
    fontSize: 16,
    writingDirection: "ltr",
  },
  track: {
    height: BAR_H,
    borderRadius: 999,
    backgroundColor: "rgba(4, 120, 87, 0.12)",
    overflow: "hidden",
    alignSelf: "stretch",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(11, 42, 34, 0.45)",
    justifyContent: "center",
    paddingHorizontal: 60,
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingTop: 12,
    paddingBottom: 10,
  },
  sheetHeader: {
    alignItems: "center",
    paddingBottom: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: DIET_V2_CARD_BORDER,
    marginBottom: 4,
    gap: 1,
  },
  sheetTitle: {
    color: DIET_V2_DARK,
  },
  sheetUnit: {
    color: DIET_V2_MUTED,
  },
  wheelStage: {
    position: "relative",
    height: 144,
    justifyContent: "center",
  },
  selectionBand: {
    position: "absolute",
    left: 12,
    right: 12,
    top: 54,
    height: 36,
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  confirmBtn: {
    marginTop: 6,
    marginHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmTxt: {
    color: "#FFFFFF",
  },
});

export default ServingsTracker;
