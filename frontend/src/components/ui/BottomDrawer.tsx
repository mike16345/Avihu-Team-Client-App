import useStyles from "@/styles/useGlobalStyles";
import React, { useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  Modal,
  BackHandler,
} from "react-native";

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

  useEffect(() => {
    const onBackPress = () => {
      onClose();
      return true;
    };
    const backHandler = BackHandler.addEventListener("hardwareBackPress", onBackPress);

    return () => backHandler.remove();
  }, []);

  return (
    <Modal transparent visible={open} animationType="slide">
      <TouchableOpacity style={[styles.overlay]} onPress={onClose} activeOpacity={1} />
      <Animated.View
        style={[
          styles.drawerContainer,
          colors.background,
          {
            borderWidth: 1,
            borderBottomWidth: 0,
            height: heightVariant === `fixed` ? height * 0.6 : `auto`,
          },
          colors.borderSecondaryContainer,
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
