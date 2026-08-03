import { FC, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/components/ui/Text";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import { selectionHaptic } from "@/utils/haptics";
import { MOCK_FOOD_CATALOG, MockFoodItem } from "../mockFoodCatalog";
import { BarcodeIcon, DIET_V2_DARK, DIET_V2_MUTED } from "../dietV2Icons";

interface BarcodeScannerModalProps {
  visible: boolean;
  onCancel: () => void;
  onDetect: (food: MockFoodItem) => void;
}

const SCAN_LINE_COLOR = "#22C55E";
const FRAME_COLOR = "#4ADE80";
const CARD_BG = "#FFFFFF";
const CARD_BORDER = "#E5E7EB";

const BarcodeScannerModal: FC<BarcodeScannerModalProps> = ({
  visible,
  onCancel,
  onDetect,
}) => {
  const insets = useSafeAreaInsets();
  const topPad = Math.max(insets.top, 12);
  const bottomPad = Math.max(insets.bottom, 12);
  const scanY = useRef(new Animated.Value(0)).current;
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanY, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scanY, {
          toValue: 0,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [visible, scanY]);

  const handleMockScan = () => {
    if (scanning) return;
    selectionHaptic();
    setScanning(true);
    setTimeout(() => {
      const food =
        MOCK_FOOD_CATALOG[Math.floor(Math.random() * MOCK_FOOD_CATALOG.length)];
      setScanning(false);
      onDetect(food);
    }, 900);
  };

  const translateY = scanY.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 160],
  });

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View style={[styles.container, { paddingTop: topPad, paddingBottom: bottomPad }]}>
        <View style={styles.topBar}>
          <View style={styles.topSpacer} />
          <View style={styles.titleWrap}>
            <Text fontVariant="bold" fontSize={16} style={styles.title}>
              סריקת ברקוד
            </Text>
          </View>
          <Pressable onPress={onCancel} hitSlop={10} style={styles.closeBtn}>
            <Text fontVariant="bold" fontSize={20} style={styles.closeLabel}>
              ×
            </Text>
          </Pressable>
        </View>

        <View style={styles.frameArea}>
          <View style={styles.frame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
            <View style={styles.frameInnerHint}>
              <BarcodeIcon size={44} color="#D1D5DB" />
            </View>
            <Animated.View
              style={[styles.scanLine, { transform: [{ translateY }] }]}
            />
          </View>
          <Text fontVariant="semibold" fontSize={14} style={styles.hint}>
            {scanning ? "מזהה מוצר..." : "כוון את המצלמה לברקוד"}
          </Text>
          <Text fontSize={12} style={styles.subHint}>
            תמיכה במצלמה תתווסף בהמשך. בינתיים לחץ למטה לבחירת מוצר לדוגמה.
          </Text>
        </View>

        <View style={styles.actions}>
          <PrimaryButton block onPress={handleMockScan} disabled={scanning}>
            {scanning ? "סורק..." : "מצא מוצר לדוגמה"}
          </PrimaryButton>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9F8",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  topSpacer: {
    width: 36,
    height: 36,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    backgroundColor: CARD_BG,
    alignItems: "center",
    justifyContent: "center",
  },
  closeLabel: {
    color: DIET_V2_DARK,
  },
  titleWrap: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    color: DIET_V2_DARK,
  },
  frameArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 16,
  },
  frame: {
    width: 260,
    height: 180,
    borderRadius: 20,
    backgroundColor: "#EEF2F0",
    borderWidth: 1,
    borderColor: CARD_BORDER,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  frameInnerHint: {
    opacity: 0.9,
  },
  corner: {
    position: "absolute",
    width: 32,
    height: 32,
    borderColor: FRAME_COLOR,
  },
  cornerTL: {
    top: 8,
    left: 8,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 10,
  },
  cornerTR: {
    top: 8,
    right: 8,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 10,
  },
  cornerBL: {
    bottom: 8,
    left: 8,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 10,
  },
  cornerBR: {
    bottom: 8,
    right: 8,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 10,
  },
  scanLine: {
    position: "absolute",
    left: 16,
    right: 16,
    height: 2,
    backgroundColor: SCAN_LINE_COLOR,
    shadowColor: SCAN_LINE_COLOR,
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  hint: {
    color: DIET_V2_DARK,
    textAlign: "center",
  },
  subHint: {
    color: DIET_V2_MUTED,
    textAlign: "center",
  },
  actions: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
});

export default BarcodeScannerModal;
