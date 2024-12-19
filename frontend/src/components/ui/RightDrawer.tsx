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
} from "react-native";
import { useNavigationState } from "@react-navigation/native";
import workoutPage from "@assets/avihu/workoutPage.jpeg";
import dietScreen from "@assets/avihu/dietScreen.jpeg";
import progressPage from "@assets/avihu/progressPage.jpeg";

const { width, height } = Dimensions.get("window");

interface RightDrawerProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const RightDrawer: React.FC<RightDrawerProps> = ({ open, onClose, children }) => {
  const { colors } = useStyles();
  const slideAnim = useRef(new Animated.Value(width)).current; // Start off-screen to the right
  const [isVisible, setIsVisible] = useState(open); // Manage modal visibility
  const activePageIndex = useNavigationState((state) => {
    return state?.routes[0].state?.index;
  });

  useEffect(() => {
    if (open) {
      setIsVisible(true); // Show the modal when open is true
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: width, // Slide out to the right
        duration: 300,
        useNativeDriver: true,
      }).start(() => setIsVisible(false)); // Hide modal after animation completes
    }
  }, [open]);

  useEffect(() => {
    const onBackPress = () => {
      if (open) {
        onClose();
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener("hardwareBackPress", onBackPress);

    return () => backHandler.remove();
  }, [open]);

  if (!isVisible) return null; // Avoid rendering the modal if not visible

  return (
    <Modal transparent visible={isVisible} animationType="fade">
      <TouchableOpacity style={[styles.overlay]} onPress={onClose} activeOpacity={1}>
        <ImageBackground
          source={
            activePageIndex == 0
              ? workoutPage
              : activePageIndex == 1
              ? dietScreen
              : activePageIndex == 2
              ? progressPage
              : workoutPage
          }
          style={styles.overlay}
          blurRadius={20}
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
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: -2, height: 0 }, // Adjust shadow direction
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    backgroundColor: "#fff", // Ensure background color is set
  },
  drawerContent: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
});

export default RightDrawer;
