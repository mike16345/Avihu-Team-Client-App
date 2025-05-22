import useStyles from "@/styles/useGlobalStyles";
import React, { useRef, useState } from "react";
import { Animated, PanResponder, StyleSheet, View, Dimensions } from "react-native";
import NativeIcon from "../Icon/NativeIcon";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const DROP_RADIUS = 60;
const DROP_CENTER_X = screenWidth / 2;
const DROP_CENTER_Y = screenHeight - 100;

const Draggable: React.FC<{
  children: React.ReactNode;
  initialPosition?: { x: number; y: number };
  height?: number;
  width?: number;
  onDropInCircle?: () => void;
}> = ({
  children,
  initialPosition = { x: 100, y: 100 },
  height = 200,
  width = 200,
  onDropInCircle = () => {},
}) => {
  const pan = useRef(new Animated.ValueXY(initialPosition)).current;
  const offset = useRef({ x: initialPosition.x, y: initialPosition.y }).current;

  const { colors, fonts, layout } = useStyles();
  const [isDragging, setIsDragging] = useState(false);

  const isInsideCircle = (x: number, y: number) => {
    const draggableCenterX = x + width / 2;
    const draggableCenterY = y + height / 2;

    const dx = draggableCenterX - DROP_CENTER_X;
    const dy = draggableCenterY - DROP_CENTER_Y;

    return Math.sqrt(dx * dx + dy * dy) <= DROP_RADIUS;
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,

      onPanResponderGrant: () => {
        setIsDragging(true);
        pan.setOffset(offset);
        pan.setValue({ x: 0, y: 0 });
      },

      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),

      onPanResponderRelease: () => {
        setIsDragging(false);
        pan.flattenOffset();
        pan.extractOffset();

        pan.stopAnimation(({ x, y }) => {
          offset.x = x;
          offset.y = y;

          if (isInsideCircle(x, y)) {
            onDropInCircle(); // ✅ This should fire now!
          }
        });
      },
    })
  ).current;

  return (
    <>
      {isDragging && (
        <View
          style={[
            styles.circle,
            colors.backgroundTertiaryContainer,
            layout.center,
            { opacity: 0.4 },
          ]}
        >
          <NativeIcon
            library="AntDesign"
            name="close"
            color={colors.textOnBackground.color}
            size={fonts.xxxl.fontSize}
          />
        </View>
      )}

      <Animated.View
        {...panResponder.panHandlers}
        style={[pan.getLayout(), styles.draggable, { height, width }]}
      >
        {children}
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  draggable: {
    position: "absolute",
    zIndex: 1000,
  },
  circle: {
    position: "absolute",
    left: DROP_CENTER_X - DROP_RADIUS,
    top: DROP_CENTER_Y - DROP_RADIUS,
    width: DROP_RADIUS * 2,
    height: DROP_RADIUS * 2,
    borderRadius: DROP_RADIUS,
    zIndex: 999,
  },
});

export default Draggable;
