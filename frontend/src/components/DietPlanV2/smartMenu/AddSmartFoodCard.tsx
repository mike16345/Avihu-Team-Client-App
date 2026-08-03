import { FC } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/ui/Text";
import { selectionHaptic } from "@/utils/haptics";
import {
  BarcodeIcon,
  ClockIcon,
  DIET_V2_CARD_BORDER,
  DIET_V2_DARK,
  DIET_V2_GREEN,
  DIET_V2_MUTED,
  PencilIcon,
  SearchIcon,
  SparkleIcon,
} from "../dietV2Icons";
import { smartMenuStyles } from "./smartMenuShared";

interface AddSmartFoodCardProps {
  onOpenPicker: () => void;
  onOpenManual: () => void;
  onOpenBarcode: () => void;
  onOpenHistory: () => void;
}

interface PillProps {
  label: string;
  Icon: FC<{ size?: number; color?: string }>;
  onPress?: () => void;
}

const Pill: FC<PillProps> = ({ label, Icon, onPress }) => (
  <Pressable style={styles.pill} onPress={onPress}>
    <Icon size={14} color={DIET_V2_GREEN} />
    <Text fontVariant="medium" fontSize={12} style={styles.pillLabel}>
      {label}
    </Text>
  </Pressable>
);

const AddSmartFoodCard: FC<AddSmartFoodCardProps> = ({
  onOpenPicker,
  onOpenManual,
  onOpenBarcode,
  onOpenHistory,
}) => {
  const openPicker = () => {
    selectionHaptic();
    onOpenPicker();
  };

  const openManual = () => {
    selectionHaptic();
    onOpenManual();
  };

  const openBarcode = () => {
    selectionHaptic();
    onOpenBarcode();
  };

  const openHistory = () => {
    selectionHaptic();
    onOpenHistory();
  };

  return (
    <View style={smartMenuStyles.card}>
      <View style={styles.headerRow}>
        <SparkleIcon size={20} color={DIET_V2_GREEN} />
        <Text fontVariant="bold" fontSize={17} style={styles.cardTitle}>
          הוספת מאכל חכם
        </Text>
      </View>
      <Pressable style={styles.searchWrap} onPress={openPicker}>
        <View style={styles.searchTextWrap}>
          <Text fontSize={13} style={styles.searchPlaceholder}>
            חפש מאכל או מותג...
          </Text>
        </View>
        <View style={styles.searchIconEnd}>
          <SearchIcon size={16} color={DIET_V2_MUTED} />
        </View>
      </Pressable>

      <View style={styles.pillsRow}>
        <Pill label="הוסף ידנית" Icon={PencilIcon} onPress={openManual} />
        <Pill label="סרוק ברקוד" Icon={BarcodeIcon} onPress={openBarcode} />
        <Pill label="היסטוריה" Icon={ClockIcon} onPress={openHistory} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "stretch",
    justifyContent: "flex-start",
  },
  cardTitle: {
    color: DIET_V2_DARK,
    textAlign: "right",
  },
  searchWrap: {
    marginTop: 12,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DIET_V2_CARD_BORDER,
    backgroundColor: "#F8FAF9",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    gap: 8,
  },
  searchIconEnd: {
    width: 20,
    alignItems: "center",
  },
  searchTextWrap: {
    flex: 1,
    alignItems: "flex-start",
  },
  searchPlaceholder: {
    color: DIET_V2_MUTED,
    textAlign: "right",
  },
  pillsRow: {
    marginTop: 12,
    flexDirection: "row",
    gap: 8,
  },
  pill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: DIET_V2_CARD_BORDER,
    backgroundColor: "#FFFFFF",
  },
  pillLabel: {
    color: DIET_V2_DARK,
    textAlign: "center",
  },
});

export default AddSmartFoodCard;
