import useStyles from "@/styles/useGlobalStyles";
import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, StyleSheet, Dimensions, Modal } from "react-native";
import { softHaptic } from "@/utils/haptics";
import Animated, { useSharedValue, withTiming } from "react-native-reanimated";

const { height: windowHeight } = Dimensions.get("window");
const DRAWER_HEIGHT = windowHeight * 0.6;

interface BottomDrawerProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  heightVariant?: "auto" | "fixed";
}

const BottomDrawer: React.FC<BottomDrawerProps> = ({
  open,
  onClose,
  children,
  heightVariant = "fixed",
}) => {
  const { colors } = useStyles();
  const [isVisible, setIsVisible] = useState(open);
  const translateY = useSharedValue(DRAWER_HEIGHT);

  useEffect(() => {
    if (open) {
      setIsVisible(true);
      translateY.value = withTiming(0);
      softHaptic();
    } else {
      softHaptic();
      translateY.value = withTiming(DRAWER_HEIGHT);
      setIsVisible(false);
    }
  }, [open]);

  return (
    <Modal onRequestClose={onClose} transparent visible={isVisible} animationType="fade">
      <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1} />

      <Animated.View
        style={[
          styles.drawerContainer,
          colors.backgroundSurface,
          {
            height: heightVariant === "fixed" ? DRAWER_HEIGHT : "auto",
            transform: [{ translateY }],
          },
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
