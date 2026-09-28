import React from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInDown, FadeOut } from "react-native-reanimated";
import { Text } from "@/components/ui/Text";
import Icon from "@/components/Icon/Icon";
import WorkoutProgressionWindow from "@/screens/Windows/WorkoutProgressionWindow";

const PRIMARY = "#072723";
const ACCENT_SOFT = "#EDFFEB";
const MUTED = "#6B7280";
const CARD_BORDER = "rgba(7, 39, 35, 0.08)";

interface Props {
  visible: boolean;
  onClose: () => void;
}

const WorkoutProgressionPopup: React.FC<Props> = ({ visible, onClose }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Animated.View
        entering={FadeIn.duration(240)}
        exiting={FadeOut.duration(160)}
        style={styles.backdrop}
      />
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <Animated.View
          entering={FadeInDown.springify().damping(18).mass(0.9)}
          style={styles.card}
        >
          <View style={styles.header}>
            <View style={styles.headerTexts}>
              <Text fontVariant="bold" fontSize={16} style={styles.headerTitle}>
                התקדמות באימונים
              </Text>
              <Text fontSize={12} style={styles.headerSubtitle}>
                מגמות משקל, חזרות ונפח סבב לפי תרגיל
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              hitSlop={12}
              style={styles.closeBtn}
              accessibilityLabel="סגירה"
            >
              <Icon name="closeSoft" color={PRIMARY} width={20} height={20} />
            </Pressable>
          </View>
          <View style={styles.contentWrap}>
            <WorkoutProgressionWindow />
          </View>
        </Animated.View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(6, 20, 16, 0.55)",
  },
  safeArea: { flex: 1, paddingHorizontal: 20, paddingVertical: 44 },
  card: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: CARD_BORDER,
  },
  headerTexts: { flex: 1, alignItems: "flex-start" },
  headerTitle: { color: PRIMARY, textAlign: "right" },
  headerSubtitle: { color: MUTED, textAlign: "right", marginTop: 2 },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  contentWrap: { flex: 1 },
});

export default WorkoutProgressionPopup;
