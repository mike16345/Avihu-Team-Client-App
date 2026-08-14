import { StyleSheet, View } from "react-native";
import { Text } from "@/components/ui/Text";
import useStyles from "@/styles/useGlobalStyles";
import { DIET_V2_CARD_BORDER, DIET_V2_DARK } from "./dietV2Icons";

const DietPlanV2SmartMenu = () => {
  const { spacing } = useStyles();

  return (
    <View style={[spacing.pdHorizontalMd]}>
      <View style={styles.card}>
        <Text fontVariant="semibold" fontSize={17} style={styles.title}>
          תפריט חכם
        </Text>
        <Text fontVariant="regular" fontSize={14} style={styles.description}>
          סריקת ברקוד והוספת מזון מהירה יופיעו כאן.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 28,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: DIET_V2_CARD_BORDER,
    borderRadius: 20,
  },
  title: {
    color: DIET_V2_DARK,
    textAlign: "center",
  },
  description: {
    color: "#6B7280",
    textAlign: "center",
  },
});

export default DietPlanV2SmartMenu;
