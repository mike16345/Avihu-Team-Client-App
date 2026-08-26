import { StyleSheet, View } from "react-native";
import { Text } from "@/components/ui/Text";
import useStyles from "@/styles/useGlobalStyles";

const PlaceholderWindow = () => {
  const { layout } = useStyles();

  return (
    <View style={[layout.flex1, styles.center]}>
      <View style={styles.dot} />
      <Text fontVariant="semibold" fontSize={16} style={styles.title}>
        בקרוב
      </Text>
      <Text fontSize={13} style={styles.subtitle}>
        פיצ׳ר חדש בדרך
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    backgroundColor: "rgba(7, 39, 35, 0.15)",
    marginBottom: 12,
  },
  title: {
    color: "#072723",
    textAlign: "center",
  },
  subtitle: {
    color: "#6B7280",
    textAlign: "center",
    marginTop: 4,
  },
});

export default PlaceholderWindow;
