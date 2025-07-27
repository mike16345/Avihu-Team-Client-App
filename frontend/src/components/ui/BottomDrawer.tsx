import useStyles from "@/styles/useGlobalStyles";
import React, { useEffect, useRef, useState } from "react";
import { View, TouchableOpacity, Animated, StyleSheet, Dimensions, Modal } from "react-native";

import { softHaptic } from "@/utils/haptics";

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

  const slideAnim = useRef(new Animated.Value(height)).current;

  const [isVisible, setIsVisible] = useState(open);
  console.log("is visible", isVisible);
  console.log("open", open);

  useEffect(() => {
    if (open) {
      console.log("setting isVisible to true");
      setIsVisible(true); // Show the modal when open is true
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      softHaptic();
    } else {
      softHaptic();
      Animated.timing(slideAnim, {
        toValue: height, // Slide out to the right
        duration: 300,
        useNativeDriver: true,
      }).start(() => setIsVisible(false)); // Hide modal after animation completes
    }
  }, [open]);

  return (
    <Modal onRequestClose={onClose} transparent visible={isVisible} animationType="fade">
      <TouchableOpacity
        style={[styles.overlay]}
        onPress={onClose}
        activeOpacity={1}
      ></TouchableOpacity>
      <Animated.View
        style={[
          styles.drawerContainer,
          colors.backgroundSurface,
          
          {
            height: heightVariant === `fixed` ? height * 0.6 : `auto`,
          },
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
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  drawerContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
