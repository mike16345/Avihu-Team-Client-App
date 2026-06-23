import React from "react";
import { Image, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import appLogo from "@assets/app-logo.png";
import { Text } from "@/components/ui/Text";
import useStyles from "@/styles/useGlobalStyles";
import { HealthStatus, MUTED_TEXT_SOFT, SURFACE_WHITE } from "./stepsConstants";

const isIOS = Platform.OS === "ios";
const PLATFORM_HEALTH_NAME = isIOS ? "אפליקציית הבריאות של אפל" : "Health Connect של גוגל";
const PLATFORM_SETTINGS_HINT = isIOS
  ? "הגדרות → פרטיות ואבטחה → בריאות"
  : "הגדרות → אפליקציות → הרשאות → Health Connect";

interface HealthOnboardingCardProps {
  status: Exclude<HealthStatus, "granted">;
  titleFont: number;
  onPressConnect: () => void;
}

const HealthOnboardingCard: React.FC<HealthOnboardingCardProps> = ({
  status,
  titleFont,
  onPressConnect,
}) => {
  const { colors, layout, spacing } = useStyles();

  const isNeedsPermission = status === "needsPermission";
  const title = isNeedsPermission
    ? "חבר את הצעדים שלך"
    : `החיבור ל${PLATFORM_HEALTH_NAME} לא הופעל`;
  const description = isNeedsPermission
    ? `כדי לעקוב אחרי הצעדים שלך,\nנתחבר ל${PLATFORM_HEALTH_NAME}. הסנכרון יהיה אוטומטי.`
    : `ללא חיבור, הצעדים לא יסונכרנו אוטומטית.\nניתן לאשר ידנית: ${PLATFORM_SETTINGS_HINT}`;
  const ctaLabel = isNeedsPermission
    ? `חבר ל${PLATFORM_HEALTH_NAME}`
    : "פתח הגדרות";

  return (
    <View style={[layout.itemsCenter, spacing.pdSm]}>
      <View style={styles.logoFrame}>
        <Image source={appLogo} style={styles.logo} resizeMode="contain" />
      </View>

      <Text
        fontVariant="bold"
        fontSize={titleFont}
        style={[colors.textPrimary, styles.title]}
      >
        {title}
      </Text>

      <Text fontSize={13} style={styles.description}>
        {description}
      </Text>

      <TouchableOpacity
        onPress={onPressConnect}
        activeOpacity={0.85}
        style={[colors.backgroundPrimary, styles.cta]}
      >
        <Text fontVariant="bold" fontSize={15} style={colors.textOnPrimary}>
          {ctaLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  logoFrame: {
    width: 56,
    height: 56,
    borderRadius: 14,
    marginBottom: 14,
    shadowColor: "#999999",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
    backgroundColor: SURFACE_WHITE,
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 14,
  },
  title: {
    textAlign: "center",
    marginBottom: 6,
  },
  description: {
    color: MUTED_TEXT_SOFT,
    textAlign: "center",
    marginBottom: 18,
    lineHeight: 19,
    paddingHorizontal: 8,
  },
  cta: {
    borderRadius: 12,
    paddingHorizontal: 22,
    paddingVertical: 12,
    alignSelf: "stretch",
    alignItems: "center",
  },
});

export default HealthOnboardingCard;
