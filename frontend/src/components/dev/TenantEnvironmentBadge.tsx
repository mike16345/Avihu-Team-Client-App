import Constants from "expo-constants";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components/ui/Text";
import { getRuntimeTenant, isTenantEnvironmentBadgeVisible } from "@/config/runtimeTenant";
import { useDeveloperTools } from "@/devtools/context";

const BADGE_INSET = 8;
const BADGE_TOP_GAP = 4;

export const TenantEnvironmentBadge = () => {
  const insets = useSafeAreaInsets();
  const tenant = getRuntimeTenant(Constants);
  const { available, badgeVisible, openPanel } = useDeveloperTools();

  if (!isTenantEnvironmentBadgeVisible(tenant)) return null;
  if (available && !badgeVisible) return null;

  const badgeContent = (
    <Text
      allowFontScaling={false}
      fontSize={10}
      fontVariant="semibold"
      style={{ color: tenant.brand.backgroundColor }}
    >
      {tenant.displayName} · {tenant.environment}
    </Text>
  );

  const badgeStyle = [
    styles.badge,
    {
      backgroundColor: tenant.brand.primaryColor,
      borderColor: tenant.brand.backgroundColor,
      top: insets.top + BADGE_TOP_GAP,
    },
  ];

  if (available) {
    return (
      <Pressable
        accessibilityLabel="Open Developer Tools"
        accessibilityRole="button"
        onPress={openPanel}
        style={badgeStyle}
      >
        {badgeContent}
      </Pressable>
    );
  }

  return (
    <View accessibilityElementsHidden pointerEvents="none" style={badgeStyle}>
      {badgeContent}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    start: BADGE_INSET,
    zIndex: 100000,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    opacity: 0.82,
  },
});
