import { useEffect, useRef, useState } from "react";
import { Modal, StyleSheet, View } from "react-native";
import * as Updates from "expo-updates";
import { useQueryClient } from "@tanstack/react-query";
import { Text } from "@/components/ui/Text";
import SpinningIcon from "@/components/ui/loaders/SpinningIcon";
import useStyles from "@/styles/useGlobalStyles";

const FETCH_TIMEOUT_MS = 10000;
const TIMED_OUT = "timed-out" as const;

const waitFor = <T,>(promise: Promise<T>, timeoutMs: number): Promise<T | typeof TIMED_OUT> => {
  return Promise.race([
    promise,
    new Promise<typeof TIMED_OUT>((resolve) => {
      setTimeout(() => resolve(TIMED_OUT), timeoutMs);
    }),
  ]);
};

const Update = () => {
  const queryClient = useQueryClient();
  const { colors, common, fonts, layout, spacing } = useStyles();
  const hasStartedRef = useRef(false);
  const [isInstallingUpdate, setIsInstallingUpdate] = useState(false);

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    let cancelled = false;

    const syncUpdateInBackground = async () => {
      try {
        if (!Updates.isEmbeddedLaunch) {
          console.log("Running in Expo Go, skipping update check.");
          return;
        }

        const update = await Updates.checkForUpdateAsync();
        if (!update.isAvailable || cancelled) return;

        setIsInstallingUpdate(true);

        const fetched = await waitFor(Updates.fetchUpdateAsync(), FETCH_TIMEOUT_MS);
        if (fetched === TIMED_OUT || cancelled) {
          console.log("Timed out while fetching update.");
          setIsInstallingUpdate(false);
          return;
        }

        queryClient.clear();
        await Updates.reloadAsync();
      } catch (error) {
        console.error("Error syncing update in background:", error);
        if (!cancelled) {
          setIsInstallingUpdate(false);
        }
      }
    };

    syncUpdateInBackground();

    return () => {
      cancelled = true;
    };
  }, [queryClient]);

  if (!isInstallingUpdate) return null;

  return (
    <Modal animationType="fade" onRequestClose={() => undefined} transparent visible>
      <View style={[layout.flex1, styles.backdrop]}>
        <View
          style={[
            styles.card,
            colors.backgroundSurface,
            common.roundedLg,
            spacing.pdLg,
            spacing.gapDefault,
          ]}
        >
          <SpinningIcon mode="light" />
          <Text style={[fonts.lg, colors.textPrimary]} fontVariant="bold">
            מעדכנים את האפליקציה
          </Text>
          <Text style={[styles.message, colors.textOnSurfaceVariant]}>
            אנא המתינו כמה רגעים בזמן שאנחנו מתקינים את הגרסה החדשה.
          </Text>
        </View>
      </View>
    </Modal>
  );
};

export default Update;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(7, 39, 35, 0.22)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
  },
  message: {
    textAlign: "center",
    lineHeight: 22,
  },
});
