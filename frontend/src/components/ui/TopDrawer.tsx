import useStyles from "@/styles/useGlobalStyles";
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  Modal,
  ImageBackground,
} from "react-native";
import { useNavigationState } from "@react-navigation/native";
import workoutPage from "@assets/avihu/workoutPage.jpeg";
import dietScreen from "@assets/avihu/dietScreen.jpeg";
import progressPage from "@assets/avihu/progressPage.jpeg";
import recordExercisePage from "@assets/avihu/recordExercisePage.jpeg";
import * as Haptic from "expo-haptics";

const { height } = Dimensions.get("window");

interface BottomDrawerProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  heightVariant?: `auto` | `fixed`;
}

const BottomDrawer: React.FC<BottomDrawerProps> = ({
  open,
  onClose,
  children,
  heightVariant = `fixed`,
}) => {
  const { colors } = useStyles();

  const activePageIndex = useNavigationState((state) => {
    const index = state.index;
    const isRecordSet = state?.routes[1]?.name == `RecordSet`;

    if (index !== 1 || !isRecordSet) return index;

    return 3;
  });

  const slideAnim = useRef(new Animated.Value(-height)).current;

  const [isVisible, setIsVisible] = useState(open);

  useEffect(() => {
    if (open) {
      Haptic.impactAsync(Haptic.ImpactFeedbackStyle.Medium);
      setIsVisible(true); // Show the modal when open is true
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Haptic.impactAsync(Haptic.ImpactFeedbackStyle.Light);
      Animated.timing(slideAnim, {
        toValue: -height, // Slide out to the right
        duration: 300,
        useNativeDriver: true,
      }).start(() => setIsVisible(false)); // Hide modal after animation completes
    }
  }, [open]);

  return (
    <Modal
      onRequestClose={onClose}
      transparent
      pointerEvents="auto"
      visible={isVisible}
      animationType="fade"
    >
      <Animated.View
        style={[
          styles.drawerContainer,
          colors.background,
          {
            borderWidth: 2,
            height: heightVariant === `fixed` ? height * 0.6 : `auto`,
          },
          colors.borderSecondaryContainer,
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={styles.drawerContent}>{children}</View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  drawerContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  drawerContent: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
});

export default BottomDrawer;
