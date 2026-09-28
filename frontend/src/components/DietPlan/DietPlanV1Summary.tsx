import { semanticColors } from "@/themes/semanticColors";
import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, ScrollView, Pressable, Linking, Animated, Easing } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Path,
  Rect,
} from "react-native-svg";
import { Text } from "../ui/Text";
import { useDietServingsStore } from "@/store/dietServingsStore";
import useDietPlanV1Query from "@/hooks/queries/useDietPlanV1Query";
import { IMeal } from "@/interfaces/DietPlan";
import { DIET_CALORIES_PER_SERVING } from "@/constants/dietCalories";
import { DIET_V2_MUTED, DropIcon, SproutIcon, ChevronLeftIcon } from "../DietPlanV2/dietV2Icons";

const DARK = semanticColors.diet.primaryText;
const AI_GREEN = "#0B5E37";

const AIChatButton: React.FC<{ onPress: () => void }> = ({ onPress }) => {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] });
  const badgeOpacity = pulse.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.6, 1, 0.6],
  });

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [aiStyles.btn, pressed && aiStyles.btnPressed]}
      accessibilityLabel="פתח צ׳אט חכם"
    >
      <Animated.View style={[aiStyles.iconWrap, { transform: [{ scale }], opacity }]}>
        <Svg width={100} height={100} viewBox="0 0 32 32">
          <Path
            d="M6 12 C6 8, 8.5 5.5, 12 5.5 L20 5.5 C23.5 5.5, 26 8, 26 12 L26 17 C26 21, 23.5 23.5, 20 23.5 L14 23.5 L9 27 L10 23.4 C7.6 22.7, 6 20.3, 6 17 Z"
            fill="none"
            stroke={AI_GREEN}
            strokeWidth={0.8}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </Svg>
        <Animated.Text style={[aiStyles.badge, { opacity: badgeOpacity }]}>AI</Animated.Text>
        <Animated.Text style={[aiStyles.subLabel, { opacity: badgeOpacity }]}>צ׳אט חכם</Animated.Text>
      </Animated.View>
    </Pressable>
  );
};

const aiStyles = StyleSheet.create({
  btn: { alignSelf: "center", padding: 6, borderRadius: 999 },
  btnPressed: { opacity: 0.85 },
  iconWrap: { width: 100, height: 100, alignItems: "center", justifyContent: "center", position: "relative" },
  badge: {
    position: "absolute",
    color: AI_GREEN,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 1.5,
    top: "32%",
    marginTop: -2,
  },
  subLabel: {
    position: "absolute",
    color: AI_GREEN,
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 0.3,
    top: "52%",
  },
});

const sumMealField = (
  meals: IMeal[],
  field: "totalProtein" | "totalCarbs" | "totalFats" | "totalVeggies"
): number => meals.reduce((acc, m) => acc + (m[field]?.quantity ?? 0), 0);

const formatVal = (n: number): string => (Number.isInteger(n) ? String(n) : n.toFixed(1));

const WhatsAppIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2 22l5.3-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.9-4.44 9.9-9.9S17.5 2 12.04 2zm5.8 14.16c-.24.68-1.2 1.25-1.97 1.42-.53.11-1.22.2-3.55-.76-2.98-1.23-4.9-4.27-5.05-4.47-.15-.2-1.2-1.6-1.2-3.05s.76-2.16 1.03-2.46c.27-.3.58-.37.78-.37.2 0 .39 0 .56.01.18.01.42-.07.66.5.24.58.82 2 .89 2.15.07.15.12.32.02.52-.1.2-.15.32-.3.5-.15.18-.31.4-.44.53-.15.15-.3.31-.13.6.17.3.76 1.25 1.63 2.03 1.12 1 2.06 1.31 2.35 1.46.29.15.46.12.63-.07.17-.2.73-.85.92-1.14.2-.29.39-.24.66-.15.27.1 1.7.8 2 .95.29.15.48.22.55.34.07.12.07.7-.17 1.38z"
      fill={semanticColors.app.dietWhatsapp}
    />
  </Svg>
);

const useCountUp = (value: number, duration = 500): number => {
  const [display, setDisplay] = useState(0);
  const displayRef = useRef(0);

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

const useAnimatedFloat = (value: number, duration = 650): number => {
  const [display, setDisplay] = useState(0);
  const ref = useRef(0);

  useEffect(() => {
    const from = ref.current;
    const to = value;
    if (from === to) return;

    const start = Date.now();
    let raf = 0;
    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const cur = from + (to - from) * eased;
      ref.current = cur;
      setDisplay(cur);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        ref.current = to;
        setDisplay(to);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return display;
};

const GRAD_LIGHT = semanticColors.diet.borderStrong;
const GRAD_DARK = semanticColors.app.brandAction;

const DONUT_SIZE = 170;
const DONUT_STROKE = 11;
const DONUT_R = (DONUT_SIZE - DONUT_STROKE) / 2;
const DONUT_C = 2 * Math.PI * DONUT_R;

const CalorieDonut: React.FC<{ consumed: number; target: number }> = ({ consumed, target }) => {
  const shown = useCountUp(Math.round(consumed));
  const fraction = target > 0 ? Math.max(0, Math.min(1, consumed / target)) : 0;
  const clamped = useAnimatedFloat(fraction);
  const dash = DONUT_C * clamped;
  const c = DONUT_SIZE / 2;

  return (
    <View style={styles.donutWrap}>
      <Svg width={DONUT_SIZE} height={DONUT_SIZE}>
        <Defs>
          <SvgLinearGradient id="donutGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={GRAD_LIGHT} />
            <Stop offset="1" stopColor={GRAD_DARK} />
          </SvgLinearGradient>
        </Defs>
        <Circle
          cx={c}
          cy={c}
          r={DONUT_R}
          stroke={semanticColors.app.dietNeutralBorder}
          strokeWidth={DONUT_STROKE}
          fill="none"
        />
        {clamped > 0 && (
          <Circle
            cx={c}
            cy={c}
            r={DONUT_R}
            stroke="url(#donutGrad)"
            strokeWidth={DONUT_STROKE}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${DONUT_C}`}
            fill="none"
            transform={`rotate(-90 ${c} ${c})`}
          />
        )}
      </Svg>
      <View style={styles.donutCenter} pointerEvents="none">
        <Text fontVariant="bold" fontSize={28} style={styles.donutNum}>
          {shown}
        </Text>
        <Text fontSize={11} style={styles.donutSub}>
          {`יעד ${Math.round(target)} קלוריות`}
        </Text>
      </View>
    </View>
  );
};

interface MacroCol {
  id: string;
  label: string;
  consumed: number;
  target: number;
}

const MACRO_BAR_H = 6;

const MacroGradientBar: React.FC<{ fraction: number; gradId: string }> = ({ fraction, gradId }) => {
  const [width, setWidth] = useState(0);
  const clamped = useAnimatedFloat(Math.max(0, Math.min(1, fraction)));
  const fillW = Math.round(width * clamped);

  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={styles.macroBar}>
      {width > 0 && fillW > 0 && (
        <Svg width={width} height={MACRO_BAR_H}>
          <Defs>
            <SvgLinearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={GRAD_LIGHT} />
              <Stop offset="1" stopColor={GRAD_DARK} />
            </SvgLinearGradient>
          </Defs>
          <Rect
            x={width - fillW}
            y={0}
            width={fillW}
            height={MACRO_BAR_H}
            rx={MACRO_BAR_H / 2}
            fill={`url(#${gradId})`}
          />
        </Svg>
      )}
    </View>
  );
};

const MacroColumn: React.FC<MacroCol & { width: number }> = ({
  id,
  label,
  consumed,
  target,
  width,
}) => {
  const fraction = target > 0 ? consumed / target : 0;

  return (
    <View style={[styles.macroCol, { width }]}>
      <Text fontSize={12} style={styles.macroLabel}>
        {label}
      </Text>
      <Text fontVariant="bold" fontSize={20} style={styles.macroBig}>
        {"‭"}
        {formatVal(consumed)}
        <Text fontVariant="regular" fontSize={11} style={styles.macroTarget}>
          {` / ${formatVal(target)}`}
        </Text>
        {"‬"}
      </Text>
      <MacroGradientBar fraction={fraction} gradId={`macro-grad-${id}`} />
    </View>
  );
};

const DietPlanV1Summary = () => {
  const consumed = useDietServingsStore();
  const { data: plan } = useDietPlanV1Query();
  const [rowW, setRowW] = useState(0);
  const navigation = useNavigation<any>();

  const meals: IMeal[] = plan?.meals ?? [];
  const targets = {
    calories: plan?.totalCalories ?? 0,
    protein: sumMealField(meals, "totalProtein"),
    carbs: sumMealField(meals, "totalCarbs"),
    fat: sumMealField(meals, "totalFats"),
    veg: plan?.veggiesPerDay ?? sumMealField(meals, "totalVeggies"),
    free: plan?.freeCalories ?? 0,
  };

  const consumedCalories = Math.round(
    consumed.protein * DIET_CALORIES_PER_SERVING.protein +
      consumed.carbs * DIET_CALORIES_PER_SERVING.carbs +
      consumed.fat * DIET_CALORIES_PER_SERVING.fats +
      consumed.veg * DIET_CALORIES_PER_SERVING.veggies +
      consumed.free
  );

  const macros: MacroCol[] = [
    {
      id: "protein",
      label: "חלבון",
      consumed: consumed.protein,
      target: targets.protein,
    },
    {
      id: "carbs",
      label: "פחמימות",
      consumed: consumed.carbs,
      target: targets.carbs,
    },
    { id: "fat", label: "שומן", consumed: consumed.fat, target: targets.fat },
    {
      id: "free",
      label: "חופשיות",
      consumed: consumed.free,
      target: targets.free,
    },
    { id: "veg", label: "ירקות", consumed: consumed.veg, target: targets.veg },
  ].filter((m) => m.target > 0);

  const colW = rowW > 0 && macros.length > 0 ? rowW / Math.min(macros.length, 4) : 82;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.tipsPanel}>
          <AIChatButton onPress={() => navigation.navigate("Chat")} />
        </View>

        <View style={styles.topDivider} />

        <CalorieDonut consumed={consumedCalories} target={targets.calories} />
      </View>

      <View style={styles.macroWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.macroScroll}
          contentContainerStyle={styles.macroRow}
          onLayout={(e) => setRowW(e.nativeEvent.layout.width)}
        >
          {macros.map((m, i) => (
            <React.Fragment key={m.id}>
              {i > 0 && <View style={styles.vDivider} />}
              <MacroColumn {...m} width={colW} />
            </React.Fragment>
          ))}
        </ScrollView>
        {macros.length > 4 && (
          <View pointerEvents="none" style={styles.scrollHintLeft}>
            <ChevronLeftIcon size={16} color={DIET_V2_MUTED} />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    alignSelf: "stretch",
    backgroundColor: semanticColors.app.surfaceRaised,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: semanticColors.diet.border,
    paddingVertical: 18,
    paddingHorizontal: 16,
    gap: 14,
  },
  donutWrap: {
    width: DONUT_SIZE,
    height: DONUT_SIZE,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  donutCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  donutNum: {
    color: DARK,
    writingDirection: "ltr",
  },
  donutSub: {
    color: DIET_V2_MUTED,
    textAlign: "center",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  tipsPanel: {
    flex: 1,
    gap: 14,
    justifyContent: "center",
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    gap: 6,
  },
  tipIconWrap: {
    height: 18,
    justifyContent: "center",
  },
  tipText: {
    flexShrink: 1,
    color: semanticColors.elevation.level2,
    lineHeight: 18,
    textAlign: "right",
  },
  topDivider: {
    width: 1,
    height: "80%",
    alignSelf: "center",
    marginEnd: 20,
    backgroundColor: "rgba(11, 42, 34, 0.10)",
    borderRadius: 999,
  },
  macroWrap: {
    alignSelf: "stretch",
    position: "relative",
  },
  macroScroll: {
    alignSelf: "stretch",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: semanticColors.app.dietCardShadow,
  },
  scrollHintLeft: {
    position: "absolute",
    right: 2,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    opacity: 0.55,
  },
  macroRow: {
    flexDirection: "row",
    alignItems: "stretch",
    paddingTop: 18,
  },
  vDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: "stretch",
    backgroundColor: semanticColors.app.shadowSoft,
  },
  macroCol: {
    alignItems: "center",
    gap: 6,
  },
  macroLabel: {
    color: DIET_V2_MUTED,
  },
  macroBig: {
    color: DARK,
    writingDirection: "ltr",
  },
  macroTarget: {
    color: DIET_V2_MUTED,
  },
  macroBar: {
    alignSelf: "stretch",
    marginHorizontal: 6,
    height: MACRO_BAR_H,
    borderRadius: 999,
    backgroundColor: semanticColors.app.dietDividerDark,
    overflow: "hidden",
    marginTop: 2,
  },
});

export default DietPlanV1Summary;
