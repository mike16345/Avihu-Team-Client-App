import React from "react";
import { Image, StyleSheet, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import appLogo from "@assets/app-logo.png";
import { Text } from "@/components/ui/Text";
import {
  GREEN_DARK,
  MUTED_TEXT,
  RING_GRAD_END,
  RING_GRAD_START,
  RING_TRACK,
  formatSteps,
} from "./stepsConstants";

interface LiveActivityPreviewProps {
  todaySteps: number;
  dailyGoal: number;
}

const RING_RADIUS = 30;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const STEP_LENGTH_METERS = 0.76;

const LiveActivityPreview: React.FC<LiveActivityPreviewProps> = ({ todaySteps, dailyGoal }) => {
  const rawProgress = dailyGoal > 0 ? todaySteps / dailyGoal : 0;
  const ringProgress = Math.min(rawProgress, 1);
  const offset = RING_CIRCUMFERENCE * (1 - ringProgress);
  const percent = Math.round(rawProgress * 100);
  const goalReached = rawProgress >= 1;
  const distanceKm = ((todaySteps * STEP_LENGTH_METERS) / 1000).toFixed(1);

  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        <View style={styles.logoBadge}>
          <Image source={appLogo} style={styles.logoBadgeImage} resizeMode="contain" />
        </View>

        <View style={styles.row}>
          <View style={styles.textColumn}>
            <View style={styles.stepsLine}>
              <Text fontVariant="semibold" fontSize={15} style={styles.stepsLabel}>
                צעדים שנעשו:
              </Text>
              <Text fontVariant="bold" fontSize={18} style={styles.value}>
                {formatSteps(todaySteps)}
              </Text>
              <Text fontSize={13} style={styles.goal}>
                {" "}
                / מתוך {formatSteps(dailyGoal)}
              </Text>
            </View>
            <Text fontSize={13} style={styles.distance}>
              מרחק קילומטר: {distanceKm}
            </Text>
          </View>

          <View style={styles.ringWrap}>
            <Svg viewBox="0 0 72 72" width="100%" height="100%">
              <Defs>
                <LinearGradient id="previewRingGrad" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0" stopColor={RING_GRAD_START} />
                  <Stop offset="0.5" stopColor={GREEN_DARK} />
                  <Stop offset="1" stopColor={RING_GRAD_END} />
                </LinearGradient>
              </Defs>
              <Circle
                cx="36"
                cy="36"
                r={RING_RADIUS}
                stroke={RING_TRACK}
                strokeWidth="9"
                fill="none"
              />
              <Circle
                cx="36"
                cy="36"
                r={RING_RADIUS}
                stroke="url(#previewRingGrad)"
                strokeWidth="9"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${RING_CIRCUMFERENCE}`}
                strokeDashoffset={offset}
                transform="rotate(-90 36 36)"
              />
            </Svg>
            <View style={styles.ringCenter}>
              <Text
                fontVariant="bold"
                fontSize={goalReached ? 20 : 15}
                style={[styles.percent, goalReached ? styles.percentDone : null]}
              >
                {goalReached ? "✓" : `${percent}%`}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 24,
  },
  card: {
    backgroundColor: "rgba(245,245,247,0.96)",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.06)",
    overflow: "visible",
  },
  logoBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 22,
    height: 22,
    borderRadius: 5,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    shadowColor: "#072723",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  logoBadgeImage: {
    width: 18,
    height: 18,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    paddingEnd: 24,
  },
  ringWrap: {
    width: 72,
    height: 72,
    position: "relative",
  },
  ringCenter: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  percent: {
    color: "#1a1d24",
  },
  percentDone: {
    color: "#2EB94D",
  },
  textColumn: {
    flex: 1,
    alignItems: "flex-end",
  },
  stepsLine: {
    flexDirection: "row",
    alignItems: "baseline",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  stepsLabel: {
    color: "rgba(7,39,35,0.55)",
    marginStart: 8,
    textAlign: "right",
  },
  distance: {
    color: "rgba(7,39,35,0.55)",
    marginTop: 4,
    textAlign: "right",
  },
  value: {
    color: "#1a1d24",
    marginTop: 1,
  },
  goal: {
    color: MUTED_TEXT,
    marginTop: 1,
    textAlign: "right",
  },
});

export default LiveActivityPreview;
