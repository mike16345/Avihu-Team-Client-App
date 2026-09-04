import { semanticColors } from "@/themes/semanticColors";
import { Text } from "@/components/ui/Text";
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from "react-native";

interface DetailRowProps {
  label: string;
  value: string;
}

export const DeveloperToolDetailRow = ({ label, value }: DetailRowProps) => (
  <View style={styles.detailRow}>
    <Text fontSize={13} style={styles.secondaryText}>
      {label}
    </Text>
    <Text fontSize={13} fontVariant="semibold" numberOfLines={1} style={styles.detailValue}>
      {value}
    </Text>
  </View>
);

interface ActionRowProps {
  title: string;
  detail: string;
  loading: boolean;
  disabled: boolean;
  emphasized?: boolean;
  showDivider?: boolean;
  onPress(): void;
}

export const DeveloperToolActionRow = ({
  title,
  detail,
  loading,
  disabled,
  emphasized = false,
  showDivider = true,
  onPress,
}: ActionRowProps) => (
  <TouchableOpacity
    accessibilityRole="button"
    activeOpacity={0.72}
    disabled={disabled}
    onPress={onPress}
    style={[
      styles.actionRow,
      showDivider && styles.actionDivider,
      emphasized && styles.emphasizedAction,
      disabled && styles.disabled,
    ]}
  >
    <View style={styles.actionCopy}>
      <Text
        fontSize={15}
        fontVariant="semibold"
        style={emphasized ? styles.emphasizedTitle : styles.primaryText}
      >
        {title}
      </Text>
      <Text fontSize={12} style={emphasized ? styles.emphasizedDetail : styles.secondaryText}>
        {detail}
      </Text>
    </View>
    {loading ? (
      <ActivityIndicator
        color={emphasized ? semanticColors.app.surfaceRaised : semanticColors.app.textStrong}
        size="small"
      />
    ) : (
      <Text
        accessibilityElementsHidden
        fontSize={20}
        style={emphasized ? styles.emphasizedDetail : styles.chevron}
      >
        ›
      </Text>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  primaryText: {
    color: semanticColors.app.textStrong,
    writingDirection: "ltr",
  },
  secondaryText: {
    color: semanticColors.app.textMuted,
    writingDirection: "ltr",
  },
  detailRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
    justifyContent: "space-between",
  },
  detailValue: {
    color: semanticColors.app.textDefault,
    flex: 1,
    textAlign: "right",
    writingDirection: "ltr",
  },
  actionRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    minHeight: 58,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  actionDivider: {
    borderBottomColor: semanticColors.app.borderSoft,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  actionCopy: {
    flex: 1,
    gap: 1,
  },
  emphasizedAction: {
    backgroundColor: semanticColors.app.textStrong,
  },
  emphasizedTitle: {
    color: semanticColors.app.surfaceRaised,
    writingDirection: "ltr",
  },
  emphasizedDetail: {
    color: semanticColors.outline,
    writingDirection: "ltr",
  },
  chevron: {
    color: semanticColors.app.textSubtle,
    writingDirection: "ltr",
  },
  disabled: {
    opacity: 0.5,
  },
});
