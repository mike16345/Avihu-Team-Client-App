import { Linking, Pressable, StyleSheet, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import useStyles from "@/styles/useGlobalStyles";
import { Text } from "@/components/ui/Text";
import type { DietPlanV2Totals } from "./dietPlanV2Utils";
import {
  DIET_V2_CARD_BORDER,
  DIET_V2_DARK,
  DIET_V2_GREEN,
  DIET_V2_MINT,
  DIET_V2_MUTED,
  DropIcon,
  SproutIcon,
} from "./dietV2Icons";

interface DietPlanV2HeaderProps {
  totals: DietPlanV2Totals;
}

interface MacroTargetProps {
  label: string;
  target: number;
}

const DONUT_SIZE = 126;
const DONUT_STROKE = 11;
const DONUT_RADIUS = (DONUT_SIZE - DONUT_STROKE) / 2;

const WhatsAppIcon = ({ size = 16 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2 22l5.3-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.9-4.44 9.9-9.9S17.5 2 12.04 2zm5.8 14.16c-.24.68-1.2 1.25-1.97 1.42-.53.11-1.22.2-3.55-.76-2.98-1.23-4.9-4.27-5.05-4.47-.15-.2-1.2-1.6-1.2-3.05s.76-2.16 1.03-2.46c.27-.3.58-.37.78-.37.2 0 .39 0 .56.01.18.01.42-.07.66.5.24.58.82 2 .89 2.15.07.15.12.32.02.52-.1.2-.15.32-.3.5-.15.18-.31.4-.44.53-.15.15-.3.31-.13.6.17.3.76 1.25 1.63 2.03 1.12 1 2.06 1.31 2.35 1.46.29.15.46.12.63-.07.17-.2.73-.85.92-1.14.2-.29.39-.24.66-.15.27.1 1.7.8 2 .95.29.15.48.22.55.34.07.12.07.7-.17 1.38z"
      fill="#25D366"
    />
  </Svg>
);

const CalorieSummary = ({ target }: { target: number }) => (
  <View style={styles.donutWrap}>
    <Svg width={DONUT_SIZE} height={DONUT_SIZE}>
      <Circle
        cx={DONUT_SIZE / 2}
        cy={DONUT_SIZE / 2}
        r={DONUT_RADIUS}
        stroke="#D6DAD8"
        strokeWidth={DONUT_STROKE}
        fill="none"
      />
    </Svg>
    <View style={styles.donutCenter} pointerEvents="none">
      <Text fontVariant="bold" fontSize={28} style={styles.ltrNumber}>
        0
      </Text>
      <Text fontSize={11} style={styles.donutTarget}>
        {`יעד ${Math.round(target)} קלוריות`}
      </Text>
    </View>
  </View>
);

const MacroTarget = ({ label, target }: MacroTargetProps) => (
  <View style={styles.macroColumn}>
    <Text fontSize={12} style={styles.mutedText}>
      {label}
    </Text>
    <Text fontSize={18} fontVariant="bold" style={styles.ltrNumber}>
      {`0 / ${target}`}
    </Text>
    <View style={styles.macroBar} />
  </View>
);

const DietPlanV2Header = ({ totals }: DietPlanV2HeaderProps) => {
  const { spacing } = useStyles();

  // Product question: Decide whether WhatsApp targets the head trainer or assigned subtrainer,
  // then source that phone number from an authenticated Server response.
  const handleWhatsAppPress = () =>
    Linking.openURL(`https://wa.me/${process.env.EXPO_PUBLIC_TRAINER_PHONE_NUMBER || ""}`);

  return (
    <View style={spacing.pdHorizontalMd}>
      <View style={styles.card}>
        <View style={styles.topRow}>
          <View style={styles.tipsPanel}>
            <View style={styles.tipRow}>
              <View style={styles.tipIconWrap}>
                <DropIcon size={14} color="#3B82F6" />
              </View>
              <Text fontSize={13} style={styles.tipText}>
                לשתות 3 ליטר מים
              </Text>
            </View>
            <View style={styles.tipRow}>
              <View style={styles.tipIconWrap}>
                <SproutIcon size={14} color="#22C55E" />
              </View>
              <Text fontSize={13} style={styles.tipText}>
                לאכול 5-3 ירקות ביום
              </Text>
            </View>
            <Pressable style={styles.tipRow} onPress={() => void handleWhatsAppPress()}>
              <View style={styles.tipIconWrap}>
                <WhatsAppIcon size={14} />
              </View>
              <Text fontSize={13} style={styles.tipText}>
                אשמח לעדכון בווטסאפ
              </Text>
            </Pressable>
          </View>

          <View style={styles.topDivider} />
          <CalorieSummary target={totals.calories} />
        </View>

        <View style={styles.macroRow}>
          <MacroTarget label="חלבון" target={totals.protein} />
          <View style={styles.verticalDivider} />
          <MacroTarget label="פחמימות" target={totals.carbs} />
          <View style={styles.verticalDivider} />
          <MacroTarget label="שומן" target={totals.fat} />
        </View>

        {totals.freeCalories > 0 && (
          <View style={styles.freeAllowance}>
            <Text fontSize={13} fontVariant="semibold" style={styles.freeAllowanceText}>
              {`מכסת קלוריות חופשיות · ${totals.freeCalories} קק״ל`}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    alignSelf: "stretch",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: DIET_V2_CARD_BORDER,
    paddingVertical: 18,
    paddingHorizontal: 16,
    gap: 16,
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
    gap: 6,
  },
  tipIconWrap: {
    height: 18,
    justifyContent: "center",
  },
  tipText: {
    flexShrink: 1,
    color: "#374151",
    lineHeight: 18,
    textAlign: "right",
  },
  topDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: "stretch",
    backgroundColor: "rgba(0, 0, 0, 0.08)",
    marginVertical: 8,
  },
  donutWrap: {
    width: DONUT_SIZE,
    height: DONUT_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  donutCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  donutTarget: {
    color: DIET_V2_MUTED,
    textAlign: "center",
  },
  ltrNumber: {
    color: DIET_V2_DARK,
    writingDirection: "ltr",
    fontVariant: ["tabular-nums"],
  },
  mutedText: {
    color: DIET_V2_MUTED,
  },
  macroRow: {
    flexDirection: "row",
    alignItems: "stretch",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0, 0, 0, 0.06)",
    paddingTop: 16,
  },
  macroColumn: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  macroBar: {
    alignSelf: "stretch",
    height: 6,
    marginHorizontal: 8,
    borderRadius: 999,
    backgroundColor: "rgba(11, 94, 55, 0.10)",
  },
  verticalDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: "stretch",
    backgroundColor: "rgba(0, 0, 0, 0.08)",
  },
  freeAllowance: {
    alignSelf: "center",
    borderRadius: 999,
    backgroundColor: DIET_V2_MINT,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  freeAllowanceText: {
    color: DIET_V2_GREEN,
    textAlign: "center",
  },
});

export default DietPlanV2Header;
