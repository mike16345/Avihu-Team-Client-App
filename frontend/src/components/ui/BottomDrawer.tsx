import useStyles from "@/styles/useGlobalStyles";
import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, StyleSheet, Dimensions, Modal } from "react-native";
import { softHaptic } from "@/utils/haptics";
import Animated, { SlideInDown, SlideOutDown } from "react-native-reanimated";

const { height: windowHeight } = Dimensions.get("window");

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

  useEffect(() => {
    if (open) {
      setIsVisible(true);
      softHaptic();
    } else {
      softHaptic();
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
            height: heightVariant === "fixed" ? windowHeight * 0.6 : "auto",
          },
        ]}
        entering={SlideInDown.duration(300)}
        exiting={SlideOutDown.duration(300)}
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
