import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Linking, Modal, Pressable, StyleSheet, View } from "react-native";
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from "expo-camera";
import Animated, {
  cancelAnimation,
  Easing,
  FadeIn,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  ZoomIn,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getErrorStatus } from "@/API/api";
import { Text } from "@/components/ui/Text";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import { useFoodCatalogApi } from "@/hooks/api/useFoodCatalogApi";
import type { FoodCatalogProduct } from "@/interfaces/IFoodCatalog";
import {
  errorNotificationHaptic,
  selectionHaptic,
  successNotificationHaptic,
} from "@/utils/haptics";
import { BarcodeIcon, DIET_V2_DARK, DIET_V2_GREEN } from "./dietV2Icons";
import {
  BARCODE_HOLD_DURATION_MS,
  getRemainingScanFeedbackMs,
  isBarcodeHoldReady,
  updateBarcodeHoldCandidate,
  type BarcodeHoldCandidate,
} from "./foodCatalogScanner";

interface FoodCatalogScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onProduct: (product: FoodCatalogProduct) => void;
}

type ScannerStatus = "scanning" | "looking-up" | "found" | "error";

const BARCODE_TYPES = ["ean13", "ean8", "upc_a", "upc_e", "itf14"] as const;
const MINIMUM_FOUND_FEEDBACK_MS = 350;

const wait = (duration: number) => new Promise<void>((resolve) => setTimeout(resolve, duration));

const getLookupErrorMessage = (error: unknown): string => {
  const status = getErrorStatus(error);
  if (status === 404) return "המוצר לא נמצא במאגר המזון.";
  if (status === 503) return "מאגר המזון אינו זמין כרגע. אפשר לנסות שוב בעוד רגע.";
  return "לא הצלחנו לבדוק את הברקוד. בדוק את החיבור ונסה שוב.";
};

const FoodCatalogScannerModal = ({ visible, onClose, onProduct }: FoodCatalogScannerModalProps) => {
  const insets = useSafeAreaInsets();
  const { lookupBarcode } = useFoodCatalogApi();
  const [permission, requestPermission] = useCameraPermissions();
  const [status, setStatus] = useState<ScannerStatus>("scanning");
  const [errorMessage, setErrorMessage] = useState("");
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [isHoldingBarcode, setIsHoldingBarcode] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const scanLocked = useRef(false);
  const scanAttempt = useRef(0);
  const holdCandidate = useRef<BarcodeHoldCandidate | null>(null);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestedPermissionForOpen = useRef(false);
  const scanLineProgress = useSharedValue(0);
  const holdProgress = useSharedValue(0);

  const clearHoldCandidate = useCallback(() => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    holdTimer.current = null;
    holdCandidate.current = null;
    setIsHoldingBarcode(false);
    cancelAnimation(holdProgress);
    holdProgress.value = 0;
  }, [holdProgress]);

  const resetScanner = useCallback(() => {
    scanAttempt.current += 1;
    scanLocked.current = false;
    clearHoldCandidate();
    setStatus("scanning");
    setErrorMessage("");
    void cameraRef.current?.resumePreview().catch(() => undefined);
  }, [clearHoldCandidate]);

  useEffect(() => {
    if (!visible) {
      requestedPermissionForOpen.current = false;
      clearHoldCandidate();
      return;
    }
    resetScanner();
    setTorchEnabled(false);
  }, [clearHoldCandidate, resetScanner, visible]);

  useEffect(() => () => clearHoldCandidate(), [clearHoldCandidate]);

  useEffect(() => {
    if (!visible || requestedPermissionForOpen.current) return;
    if (permission === null || (!permission.granted && permission.canAskAgain)) {
      requestedPermissionForOpen.current = true;
      void requestPermission();
    }
  }, [permission, requestPermission, visible]);

  useEffect(() => {
    if (!visible || !permission?.granted || status !== "scanning") return;
    scanLineProgress.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.quad) })
      ),
      -1
    );
    return () => cancelAnimation(scanLineProgress);
  }, [permission?.granted, scanLineProgress, status, visible]);

  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(scanLineProgress.value, [0, 1], [-74, 74]) }],
  }));

  const holdProgressStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: holdProgress.value }],
  }));

  const holdGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(holdProgress.value, [0, 0.65, 1], [0.08, 0.18, 0.3]),
  }));

  const handleClose = () => {
    scanAttempt.current += 1;
    clearHoldCandidate();
    selectionHaptic();
    onClose();
  };

  const confirmBarcode = useCallback(
    async (barcode: string) => {
      const startedAt = Date.now();
      const attempt = scanAttempt.current + 1;
      scanAttempt.current = attempt;
      scanLocked.current = true;
      clearHoldCandidate();
      setStatus("looking-up");
      selectionHaptic();
      await cameraRef.current?.pausePreview().catch(() => undefined);

      try {
        const result = await lookupBarcode(barcode);
        if (attempt !== scanAttempt.current) return;
        setStatus("found");
        void successNotificationHaptic().catch(() => undefined);
        await wait(
          Math.max(MINIMUM_FOUND_FEEDBACK_MS, getRemainingScanFeedbackMs(startedAt, Date.now()))
        );
        if (attempt !== scanAttempt.current) return;
        onProduct(result.product);
      } catch (error) {
        if (attempt !== scanAttempt.current) return;
        setErrorMessage(getLookupErrorMessage(error));
        setStatus("error");
        void errorNotificationHaptic().catch(() => undefined);
      }
    },
    [clearHoldCandidate, lookupBarcode, onProduct]
  );

  const handleBarcode = useCallback(
    ({ data }: BarcodeScanningResult) => {
      const barcode = data.trim();
      if (scanLocked.current || barcode.length === 0) return;

      const now = Date.now();
      const candidate = updateBarcodeHoldCandidate(holdCandidate.current, barcode, now);
      const isNewHold = candidate.startedAt !== holdCandidate.current?.startedAt;
      holdCandidate.current = candidate;

      if (!isNewHold) return;

      if (holdTimer.current) clearTimeout(holdTimer.current);
      setIsHoldingBarcode(true);
      cancelAnimation(holdProgress);
      holdProgress.value = 0;
      holdProgress.value = withTiming(1, {
        duration: BARCODE_HOLD_DURATION_MS,
        easing: Easing.out(Easing.cubic),
      });

      holdTimer.current = setTimeout(() => {
        const current = holdCandidate.current;
        if (!current || !isBarcodeHoldReady(current, Date.now())) {
          clearHoldCandidate();
          return;
        }
        void confirmBarcode(current.barcode);
      }, BARCODE_HOLD_DURATION_MS);
    },
    [clearHoldCandidate, confirmBarcode, holdProgress]
  );

  const retry = () => {
    selectionHaptic();
    resetScanner();
  };

  const permissionDenied = permission !== null && !permission.granted;

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={handleClose}>
      <View style={styles.container}>
        {visible && permission?.granted ? (
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            facing="back"
            enableTorch={torchEnabled}
            barcodeScannerSettings={{ barcodeTypes: [...BARCODE_TYPES] }}
            onBarcodeScanned={status === "scanning" ? handleBarcode : undefined}
            onMountError={() => {
              scanLocked.current = true;
              setErrorMessage("לא הצלחנו לפתוח את המצלמה.");
              setStatus("error");
            }}
          />
        ) : null}

        <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 12) }]}>
          <Pressable onPress={handleClose} hitSlop={10} style={styles.roundButton}>
            <Text fontVariant="bold" fontSize={23} style={styles.roundButtonLabel}>
              ×
            </Text>
          </Pressable>
          <Text fontVariant="bold" fontSize={17} style={styles.title}>
            סריקת ברקוד
          </Text>
          <Pressable
            onPress={() => {
              selectionHaptic();
              setTorchEnabled((current) => !current);
            }}
            disabled={!permission?.granted}
            style={[styles.roundButton, torchEnabled && styles.roundButtonActive]}
          >
            <Text fontVariant="bold" fontSize={16} style={styles.roundButtonLabel}>
              ☼
            </Text>
          </Pressable>
        </View>

        {permission?.granted ? (
          <View style={styles.scannerContent} pointerEvents="box-none">
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              {status === "scanning" ? (
                <Animated.View style={[styles.scanLine, scanLineStyle]} />
              ) : null}
              {status === "scanning" && isHoldingBarcode ? (
                <>
                  <Animated.View style={[styles.holdGlow, holdGlowStyle]} />
                  <Animated.View entering={FadeIn.duration(140)} style={styles.holdFeedback}>
                    <Text fontVariant="semibold" fontSize={13} style={styles.holdLabel}>
                      החזק יציב...
                    </Text>
                    <View style={styles.holdTrack}>
                      <Animated.View style={[styles.holdFill, holdProgressStyle]} />
                    </View>
                  </Animated.View>
                </>
              ) : null}
              {status === "looking-up" ? (
                <View style={styles.lookupOverlay}>
                  <ActivityIndicator size="large" color="#FFFFFF" />
                  <Text fontVariant="semibold" fontSize={14} style={styles.overlayText}>
                    בודק את המוצר...
                  </Text>
                </View>
              ) : null}
              {status === "found" ? (
                <Animated.View entering={FadeIn.duration(160)} style={styles.foundOverlay}>
                  <Animated.View entering={ZoomIn.springify().damping(14)} style={styles.foundIcon}>
                    <Text fontVariant="bold" fontSize={28} style={styles.foundCheck}>
                      ✓
                    </Text>
                  </Animated.View>
                  <Text fontVariant="bold" fontSize={16} style={styles.overlayText}>
                    הברקוד נקלט
                  </Text>
                </Animated.View>
              ) : null}
            </View>
          </View>
        ) : null}

        <View style={[styles.bottomPanel, { paddingBottom: Math.max(insets.bottom, 18) }]}>
          {permission === null ? <ActivityIndicator size="small" color={DIET_V2_GREEN} /> : null}

          {permissionDenied ? (
            <View style={styles.permissionContent}>
              <View style={styles.iconCircle}>
                <BarcodeIcon size={28} color={DIET_V2_GREEN} />
              </View>
              <Text fontVariant="bold" fontSize={17} style={styles.panelTitle}>
                נדרשת גישה למצלמה
              </Text>
              <Text fontSize={13} style={styles.panelDescription}>
                אשר גישה למצלמה כדי לסרוק את הברקוד שעל המוצר.
              </Text>
              <PrimaryButton
                block
                onPress={() => {
                  if (permission.canAskAgain) void requestPermission();
                  else void Linking.openSettings();
                }}
              >
                {permission.canAskAgain ? "אפשר גישה למצלמה" : "פתח הגדרות"}
              </PrimaryButton>
            </View>
          ) : null}

          {permission?.granted && status === "scanning" ? (
            <View style={styles.panelTextWrap}>
              <Text fontVariant="semibold" fontSize={15} style={styles.panelTitle}>
                {isHoldingBarcode ? "מעולה, המשך להחזיק יציב" : "מקם את הברקוד בתוך המסגרת"}
              </Text>
              <Text fontSize={12} style={styles.panelDescription}>
                {isHoldingBarcode
                  ? "נקלוט אותו לאחר רגע קצר"
                  : "יש להחזיק את הברקוד במסגרת לרגע"}
              </Text>
            </View>
          ) : null}

          {permission?.granted && status === "looking-up" ? (
            <Text fontVariant="semibold" fontSize={14} style={styles.panelTitle}>
              מצאנו ברקוד, מחפשים את המוצר...
            </Text>
          ) : null}

          {permission?.granted && status === "found" ? (
            <Animated.View entering={FadeIn.duration(160)} style={styles.panelTextWrap}>
              <Text fontVariant="bold" fontSize={15} style={styles.successText}>
                המוצר נמצא בהצלחה
              </Text>
              <Text fontSize={12} style={styles.panelDescription}>
                מעבירים אותך לפרטי המוצר...
              </Text>
            </Animated.View>
          ) : null}

          {permission?.granted && status === "error" ? (
            <View style={styles.errorContent}>
              <Text fontVariant="semibold" fontSize={14} style={styles.errorText}>
                {errorMessage}
              </Text>
              <PrimaryButton block onPress={retry}>
                סרוק שוב
              </PrimaryButton>
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#07110E" },
  topBar: {
    zIndex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "rgba(7, 17, 14, 0.72)",
  },
  title: { color: "#FFFFFF", textAlign: "center" },
  roundButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.24)",
  },
  roundButtonActive: { backgroundColor: DIET_V2_GREEN },
  roundButtonLabel: { color: "#FFFFFF", lineHeight: 24 },
  scannerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  scanFrame: {
    width: "100%",
    maxWidth: 330,
    aspectRatio: 1.55,
    borderRadius: 24,
    backgroundColor: "rgba(0, 0, 0, 0.08)",
    overflow: "hidden",
  },
  corner: { position: "absolute", width: 42, height: 42, borderColor: "#5BE29B" },
  scanLine: {
    position: "absolute",
    left: 18,
    right: 18,
    top: "50%",
    height: 2,
    borderRadius: 1,
    backgroundColor: "#5BE29B",
    shadowColor: "#5BE29B",
    shadowOpacity: 0.8,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  holdGlow: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 4,
    borderRadius: 24,
    borderColor: "#5BE29B",
    backgroundColor: "#5BE29B",
  },
  holdFeedback: {
    position: "absolute",
    left: 22,
    right: 22,
    bottom: 18,
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "rgba(7, 17, 14, 0.78)",
  },
  holdLabel: { color: "#FFFFFF", textAlign: "center" },
  holdTrack: {
    height: 5,
    overflow: "hidden",
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.22)",
  },
  holdFill: {
    width: "100%",
    height: "100%",
    borderRadius: 3,
    backgroundColor: "#5BE29B",
  },
  topRight: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 22 },
  topLeft: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 22 },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 22,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 22,
  },
  lookupOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "rgba(7, 17, 14, 0.62)",
  },
  foundOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "rgba(7, 46, 34, 0.78)",
  },
  foundIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#5BE29B",
  },
  foundCheck: { color: "#073A2A", lineHeight: 34 },
  overlayText: { color: "#FFFFFF" },
  bottomPanel: {
    minHeight: 126,
    paddingTop: 18,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  panelTextWrap: { alignItems: "center", gap: 4 },
  panelTitle: { color: DIET_V2_DARK, textAlign: "center" },
  panelDescription: { color: "#6B7280", textAlign: "center" },
  successText: { color: DIET_V2_GREEN, textAlign: "center" },
  permissionContent: { width: "100%", alignItems: "center", gap: 10 },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F7EF",
  },
  errorContent: { width: "100%", alignItems: "center", gap: 12 },
  errorText: { color: "#B42318", textAlign: "center" },
});

export default FoodCatalogScannerModal;
