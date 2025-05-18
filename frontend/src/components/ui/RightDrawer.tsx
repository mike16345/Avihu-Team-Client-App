import useStyles from "@/styles/useGlobalStyles";
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  Modal,
  BackHandler,
  ImageBackground,
  NativeEventSubscription,
} from "react-native";
import { useNavigationState } from "@react-navigation/native";
import workoutPage from "@assets/avihu/workoutPage.jpeg";
import dietScreen from "@assets/avihu/dietScreen.jpeg";
import progressPage from "@assets/avihu/progressPage.jpeg";
import recordExercisePage from "@assets/avihu/recordExercisePage.jpeg";
import blogsPage from "@assets/avihu/blogsPage.jpeg";
import * as Haptic from "expo-haptics";

const { width } = Dimensions.get("window");

interface RightDrawerProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const RightDrawer: React.FC<RightDrawerProps> = ({ open, onClose, children }) => {
  const { colors } = useStyles();
  const slideAnim = useRef(new Animated.Value(width)).current; // Start off-screen to the right

  const [isVisible, setIsVisible] = useState(open);

  const activePageIndex = useNavigationState((state) => {
    const index = state?.routes[0].state?.index;
    const isRecordSet = state?.routes[0].state?.routes[0].state?.index == 1;
    if (index !== 0 || !isRecordSet) return index;
    return 4;
  });

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
        toValue: width, // Slide out to the right
        duration: 300,
        useNativeDriver: true,
      }).start(() => setIsVisible(false)); // Hide modal after animation completes
    }
  }, [open]);

  if (!isVisible) return null; // Avoid rendering the modal if not visible

  return (
    <Modal onRequestClose={onClose} transparent visible={isVisible} animationType="fade">
      <TouchableOpacity style={[styles.overlay]} onPress={onClose} activeOpacity={1}>
        <ImageBackground
          source={
            activePageIndex == 0
              ? workoutPage
              : activePageIndex == 1
              ? dietScreen
              : activePageIndex == 2
              ? progressPage
              : activePageIndex == 3
              ? blogsPage
              : recordExercisePage
          }
          style={styles.overlay}
          blurRadius={50}
        />
      </TouchableOpacity>
      <Animated.View
        style={[
          styles.drawerContainer,
          colors.background,
          { transform: [{ translateX: slideAnim }] },
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  drawerContainer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0, // Align to the right side of the screen
    width: width * 0.8, // Set the drawer width
    shadowColor: "#000",
    shadowOffset: { width: -2, height: 0 }, // Adjust shadow direction
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    backgroundColor: "#fff", // Ensure background color is set
  },
  drawerContent: {
    justifyContent: "center",
  },
});

export default RightDrawer;
