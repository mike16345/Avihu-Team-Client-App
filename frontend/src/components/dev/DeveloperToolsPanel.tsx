import Icon from "@/components/Icon/Icon";
import { DeveloperToolActionRow, DeveloperToolDetailRow } from "@/components/dev/DeveloperToolRows";
import BottomDrawer from "@/components/ui/BottomDrawer";
import Switch from "@/components/ui/Switch";
import { Text } from "@/components/ui/Text";
import { getRuntimeTenant } from "@/config/runtimeTenant";
import { useDeveloperTools } from "@/devtools/context";
import { createDeveloperDiagnostics, type DeveloperApiEnvironment } from "@/devtools/policy";
import { useDeveloperToolActions } from "@/devtools/useDeveloperToolActions";
import { useToast } from "@/hooks/useToast";
import Constants from "expo-constants";
import { useMemo, type Dispatch, type SetStateAction } from "react";
import { Alert, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { DeveloperActionName, DeveloperActionResult } from "@/devtools/actions";

const permissionLabels = {
  granted: "Allowed",
  denied: "Blocked",
  undetermined: "Not requested",
} as const;

const apiStatus: Record<
  DeveloperApiEnvironment,
  { label: string; detail: string; foreground: string; background: string }
> = {
  test: {
    label: "TEST API",
    detail: "Development data",
    foreground: "#067647",
    background: "#ECFDF3",
  },
  preview: {
    label: "PREVIEW API",
    detail: "Staging data",
    foreground: "#B54708",
    background: "#FFFAEB",
  },
  production: {
    label: "PRODUCTION API",
    detail: "Live customer data",
    foreground: "#B42318",
    background: "#FEF3F2",
  },
  unknown: {
    label: "API UNKNOWN",
    detail: "Check build configuration",
    foreground: "#344054",
    background: "#F2F4F7",
  },
};

const isActionRunning = (
  runningAction: DeveloperActionName | null,
  action: DeveloperActionName
): boolean => runningAction === action;

const DeveloperToolsPanel = () => {
  const insets = useSafeAreaInsets();
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

    return createDeveloperDiagnostics({
      tenantId: tenant.id,
      displayName: tenant.displayName,
      environment: tenant.environment,
      platform: Platform.OS === "ios" ? "ios" : "android",
      appVersion: expoConfig?.version,
      iosBundleIdentifier: expoConfig?.ios?.bundleIdentifier,
      androidPackage: expoConfig?.android?.package,
      apiMode: typeof expoConfig?.extra?.DEV_MODE === "string" ? expoConfig.extra.DEV_MODE : null,
      hasApiUrl:
        typeof expoConfig?.extra?.API_URL === "string" && expoConfig.extra.API_URL.length > 0,
      hasPreviewApi:
        typeof expoConfig?.extra?.API_URL_PREVIEW === "string" &&
        expoConfig.extra.API_URL_PREVIEW.length > 0,
    });
  }, []);

  const reportResult = (result: DeveloperActionResult) => {
    const toast = { message: result.message, isModalToast: true };
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
      "Downloaded server data will be refreshed. Your login and locally recorded data stay intact.",
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
  const status = apiStatus[diagnostics.apiEnvironment];
  const buildLabel = `${Platform.OS === "ios" ? "iOS" : "Android"} · v${diagnostics.appVersion}`;

  return (
    <BottomDrawer onClose={closePanel} open={panelOpen}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 16) }]}
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text fontSize={21} fontVariant="bold" style={styles.primaryText}>
              Developer tools
            </Text>
            <Text fontSize={12} style={styles.secondaryText}>
              {diagnostics.tenant}
            </Text>
          </View>
          <TouchableOpacity
            accessibilityLabel="Close developer tools"
            accessibilityRole="button"
            onPress={closePanel}
            style={styles.closeButton}
          >
            <Icon color="#475467" height={18} name="close" width={18} />
          </TouchableOpacity>
        </View>

        <View style={[styles.statusCard, { backgroundColor: status.background }]}>
          <View style={styles.statusHeading}>
            <View style={[styles.statusDot, { backgroundColor: status.foreground }]} />
            <Text fontSize={12} fontVariant="bold" style={{ color: status.foreground }}>
              {status.label}
            </Text>
          </View>
          <Text fontSize={24} fontVariant="bold" style={styles.primaryText}>
            {status.detail}
          </Text>
          <Text fontSize={13} style={styles.secondaryText}>
            {diagnostics.environment} build
          </Text>
        </View>

        <View style={styles.detailsCard}>
          <DeveloperToolDetailRow label="Build" value={buildLabel} />
          <DeveloperToolDetailRow label="Application ID" value={diagnostics.applicationId} />
          <DeveloperToolDetailRow label="Notifications" value={permissionLabels[permission]} />
        </View>

        <View style={styles.section}>
          <Text fontSize={12} fontVariant="bold" style={styles.sectionLabel}>
            NOTIFICATIONS
          </Text>
          <View style={styles.actionCard}>
            <DeveloperToolActionRow
              detail="Schedule a local notification now"
              disabled={actionsDisabled}
              emphasized
              loading={isActionRunning(runningAction, "notification")}
              onPress={() => void runAction(sendTestNotification)}
              showDivider={false}
              title="Send test notification"
            />
            {permission !== "granted" && (
              <DeveloperToolActionRow
                detail="Ask iOS or Android for access"
                disabled={actionsDisabled}
                loading={isActionRunning(runningAction, "permission")}
                onPress={() => void runAction(requestNotificationPermission)}
                title="Request permission"
              />
            )}
            <DeveloperToolActionRow
              detail="Open this app's system settings"
              disabled={actionsDisabled}
              loading={isActionRunning(runningAction, "settings")}
              onPress={() => void runAction(openNotificationSettings)}
              showDivider={false}
              title="Notification settings"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text fontSize={12} fontVariant="bold" style={styles.sectionLabel}>
            APP CONTROLS
          </Text>
          <View style={styles.actionCard}>
            <DeveloperToolActionRow
              detail="Refresh downloaded server data"
              disabled={actionsDisabled}
              loading={isActionRunning(runningAction, "cache")}
              onPress={confirmCacheClear}
              title="Clear server cache"
            />
            <DeveloperToolActionRow
              detail="Restart the JavaScript application"
              disabled={actionsDisabled}
              loading={isActionRunning(runningAction, "reload")}
              onPress={() => void runAction(reloadApp)}
              showDivider={false}
              title="Reload app"
            />
          </View>
        </View>

        <View style={styles.preferenceRow}>
          <View style={styles.preferenceCopy}>
            <Text fontSize={14} fontVariant="semibold" style={styles.primaryText}>
              Quick-access badge
            </Text>
            <Text fontSize={12} style={styles.secondaryText}>
              Hide the floating shortcut when you do not need it.
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
  scrollView: {
    alignSelf: "stretch",
    flex: 1,
  },
  content: {
    direction: "ltr",
    gap: 16,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerCopy: {
    gap: 2,
  },
  closeButton: {
    alignItems: "center",
    backgroundColor: "#F2F4F7",
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  primaryText: {
    color: "#101828",
    writingDirection: "ltr",
  },
  secondaryText: {
    color: "#667085",
    writingDirection: "ltr",
  },
  statusCard: {
    borderCurve: "continuous",
    borderRadius: 18,
    gap: 4,
    padding: 18,
  },
  statusHeading: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
    paddingBottom: 4,
  },
  statusDot: {
    borderRadius: 5,
    height: 8,
    width: 8,
  },
  detailsCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#EAECF0",
    borderCurve: "continuous",
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
    padding: 14,
  },
  section: {
    gap: 7,
  },
  sectionLabel: {
    color: "#667085",
    letterSpacing: 0.7,
    paddingHorizontal: 2,
    writingDirection: "ltr",
  },
  actionCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#EAECF0",
    borderCurve: "continuous",
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  preferenceRow: {
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderCurve: "continuous",
    borderRadius: 16,
    flexDirection: "row",
    gap: 16,
    justifyContent: "space-between",
    padding: 14,
  },
  preferenceCopy: {
    flex: 1,
    gap: 2,
  },
});
