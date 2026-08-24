import Constants from "expo-constants";
import { useMemo, type Dispatch, type SetStateAction } from "react";
import { Alert, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import BottomDrawer from "@/components/ui/BottomDrawer";
import Switch from "@/components/ui/Switch";
import { Text } from "@/components/ui/Text";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import { getRuntimeTenant } from "@/config/runtimeTenant";
import { useDeveloperTools } from "@/devtools/context";
import { createDeveloperDiagnostics } from "@/devtools/policy";
import { useDeveloperToolActions } from "@/devtools/useDeveloperToolActions";
import { useToast } from "@/hooks/useToast";
import useStyles from "@/styles/useGlobalStyles";

import type { DeveloperActionName, DeveloperActionResult } from "@/devtools/actions";

const permissionLabels = {
  granted: "Granted",
  denied: "Denied",
  undetermined: "Not requested",
} as const;

interface DiagnosticRowProps {
  label: string;
  value: string;
}

const DiagnosticRow = ({ label, value }: DiagnosticRowProps) => {
  const { colors } = useStyles();

  return (
    <View style={styles.diagnosticRow}>
      <Text fontVariant="semibold" style={colors.textPrimary}>
        {label}
      </Text>
      <Text style={[colors.textOnSurfaceVariant, styles.technicalValue]}>{value}</Text>
    </View>
  );
};

const isActionRunning = (
  runningAction: DeveloperActionName | null,
  action: DeveloperActionName
): boolean => runningAction === action;

const DeveloperToolsPanel = () => {
  const insets = useSafeAreaInsets();
  const { colors, common, spacing } = useStyles();
  const { triggerErrorToast, triggerSuccessToast } = useToast();
  const { panelOpen, closePanel, badgeVisible, setBadgeVisible } = useDeveloperTools();
  const {
    permission,
    runningAction,
    requestNotificationPermission,
    sendTestNotification,
    openNotificationSettings,
    clearServerCache,
    reloadApp,
  } = useDeveloperToolActions(panelOpen);

  const diagnostics = useMemo(() => {
    const tenant = getRuntimeTenant(Constants);
    const expoConfig = Constants.expoConfig;
    const apiUrl = expoConfig?.extra?.API_URL;

    return createDeveloperDiagnostics({
      tenantId: tenant.id,
      displayName: tenant.displayName,
      environment: tenant.environment,
      platform: Platform.OS === "ios" ? "ios" : "android",
      appVersion: expoConfig?.version,
      iosBundleIdentifier: expoConfig?.ios?.bundleIdentifier,
      androidPackage: expoConfig?.android?.package,
      apiUrl: typeof apiUrl === "string" ? apiUrl : undefined,
    });
  }, []);

  const reportResult = (result: DeveloperActionResult) => {
    const toast = {
      message: result.message,
      isModalToast: true,
    };

    if (result.ok) {
      triggerSuccessToast(toast);
      return;
    }
    triggerErrorToast(toast);
  };

  const runAction = async (action: () => Promise<DeveloperActionResult>) => {
    reportResult(await action());
  };

  const confirmCacheClear = () => {
    Alert.alert(
      "Clear server cache?",
      "This clears downloaded server data only. Your login and locally recorded data are preserved.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear cache",
          style: "destructive",
          onPress: () => void runAction(clearServerCache),
        },
      ]
    );
  };

  const setBadgeSwitchState: Dispatch<SetStateAction<boolean>> = (nextValue) => {
    const visible = typeof nextValue === "function" ? nextValue(badgeVisible) : nextValue;
    setBadgeVisible(visible);
  };

  const actionsDisabled = runningAction !== null;

  return (
    <BottomDrawer onClose={closePanel} open={panelOpen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          spacing.gapDefault,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text fontSize={22} fontVariant="bold" style={colors.textPrimary}>
              Developer Tools
            </Text>
            <Text style={colors.textOnSurfaceVariant}>Development build only</Text>
          </View>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={closePanel}
            style={styles.closeButton}
          >
            <Text fontVariant="semibold" style={colors.textPrimary}>
              Close
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, colors.backgroundSurfaceVariant, common.rounded]}>
          <DiagnosticRow label="Tenant" value={diagnostics.tenant} />
          <DiagnosticRow label="Environment" value={diagnostics.environment} />
          <DiagnosticRow label="Application ID" value={diagnostics.applicationId} />
          <DiagnosticRow label="Version" value={diagnostics.appVersion} />
          <DiagnosticRow label="API host" value={diagnostics.apiHost} />
          <DiagnosticRow label="Notification permission" value={permissionLabels[permission]} />
        </View>

        <PrimaryButton
          block
          disabled={actionsDisabled}
          loading={isActionRunning(runningAction, "notification")}
          onPress={() => void runAction(sendTestNotification)}
        >
          Send test notification
        </PrimaryButton>

        {permission !== "granted" && (
          <PrimaryButton
            block
            disabled={actionsDisabled}
            loading={isActionRunning(runningAction, "permission")}
            mode="light"
            onPress={() => void runAction(requestNotificationPermission)}
          >
            Request notification permission
          </PrimaryButton>
        )}

        <PrimaryButton
          block
          disabled={actionsDisabled}
          loading={isActionRunning(runningAction, "settings")}
          mode="light"
          onPress={() => void runAction(openNotificationSettings)}
        >
          Open app settings
        </PrimaryButton>

        <PrimaryButton
          block
          disabled={actionsDisabled}
          loading={isActionRunning(runningAction, "cache")}
          mode="light"
          onPress={confirmCacheClear}
        >
          Clear server cache
        </PrimaryButton>

        <PrimaryButton
          block
          disabled={actionsDisabled}
          loading={isActionRunning(runningAction, "reload")}
          mode="light"
          onPress={() => void runAction(reloadApp)}
        >
          Reload app
        </PrimaryButton>

        <View style={[styles.preferenceRow, colors.backgroundSurfaceVariant, common.rounded]}>
          <View style={styles.preferenceCopy}>
            <Text fontVariant="semibold" style={colors.textPrimary}>
              Show floating badge
            </Text>
            <Text style={colors.textOnSurfaceVariant}>
              Profile access remains available when hidden.
            </Text>
          </View>
          <Switch isOn={badgeVisible} setIsOn={setBadgeSwitchState} />
        </View>
      </ScrollView>
    </BottomDrawer>
  );
};

export default DeveloperToolsPanel;

const styles = StyleSheet.create({
  content: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  closeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  card: {
    padding: 14,
    gap: 10,
  },
  diagnosticRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  technicalValue: {
    flexShrink: 1,
    writingDirection: "ltr",
  },
  preferenceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    gap: 16,
  },
  preferenceCopy: {
    flex: 1,
    gap: 2,
  },
});
