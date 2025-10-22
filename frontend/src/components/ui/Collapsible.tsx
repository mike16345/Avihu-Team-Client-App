import { View, TouchableOpacity, LayoutChangeEvent, StyleProp, ViewStyle } from "react-native";
import { Card, CardVariants } from "./Card";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { ConditionalRender } from "./ConditionalRender";
import useStyles from "@/styles/useGlobalStyles";
import { Text, TextProps } from "./Text";
import Icon from "../Icon/Icon";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  runOnJS,
} from "react-native-reanimated";
import React from "react";

interface CollapsibleProps {
  isCollapsed: boolean;
  onCollapseChange?: () => void;
  children: ReactNode;
  trigger?: ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: CardVariants;
  customHeight?: number;
  keepMounted?: boolean;
  freezeOnCollapse?: boolean;
  onExpandEnd?: () => void;
  onCollapseEnd?: () => void;
  triggerProps?: TextProps;
}

const ANIMATION_DURATION = 250;

const Collapsible: React.FC<CollapsibleProps> = ({
  children,
  trigger,
  isCollapsed,
  onCollapseChange,
  style,
  variant = "gray",
  customHeight = 0,
  keepMounted = false,
  freezeOnCollapse = true,
  onExpandEnd,
  onCollapseEnd,
  triggerProps,
}) => {
  const { layout } = useStyles();

  const [contentHeight, setContentHeight] = useState(0);
  const [measured, setMeasured] = useState(false);
  const [renderChildren, setRenderChildren] = useState(false);

  const height = useSharedValue(0);

  const getContentHeight = useCallback(
    (e: LayoutChangeEvent) => {
      const h = customHeight || e.nativeEvent.layout.height;
      if (h > 0 && h !== contentHeight) {
        setContentHeight(h);
        setMeasured(true);
      }
    },
    [contentHeight, customHeight]
  );

  // Animate on collapse/expand
  useEffect(() => {
    const runAnimation = (toValue: number, callback?: () => void) => {
      height.value = withTiming(toValue, { duration: ANIMATION_DURATION }, (finished) => {
        if (finished && callback) runOnJS(callback)();
      });
    };

    if (!isCollapsed) {
      if (!keepMounted) setRenderChildren(true);
      runAnimation(contentHeight, onExpandEnd);
    } else {
      runAnimation(0, () => {
        if (!keepMounted) setRenderChildren(false);
        onCollapseEnd?.();
      });
    }
  }, [isCollapsed, contentHeight, keepMounted, onExpandEnd, onCollapseEnd]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
    overflow: "hidden",
  }));

  const memoizedChild = React.useMemo(() => children, [isCollapsed ? null : children]);

  return (
    <Card variant={variant} style={style}>
      <ConditionalRender condition={trigger}>
        <Card.Header>
          <TouchableOpacity onPress={onCollapseChange}>
            <ConditionalRender condition={typeof trigger === "string"}>
              <View style={[layout.flexRow, layout.itemsCenter, layout.justifyBetween]}>
                <Text {...triggerProps}>{trigger}</Text>
                <Icon name="chevronDown" rotation={isCollapsed ? 0 : 180} />
              </View>
            </ConditionalRender>
            <ConditionalRender condition={typeof trigger !== "string"}>{trigger}</ConditionalRender>
          </TouchableOpacity>
        </Card.Header>
      </ConditionalRender>

      <Card.Content>
        <ConditionalRender condition={!isCollapsed}>
          <View
            collapsable={false}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            onLayout={getContentHeight}
            style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}
          >
            {children}
          </View>
        </ConditionalRender>

        <Animated.View
          style={[layout.flex1, animatedStyle]}
          collapsable
          pointerEvents={isCollapsed ? "none" : "auto"}
        >
          {keepMounted ? (
            freezeOnCollapse ? (
              <View style={[layout.flex1]}>{memoizedChild}</View>
            ) : (
              children
            )
          ) : (
            <ConditionalRender condition={measured && renderChildren}>{children}</ConditionalRender>
          )}
        </Animated.View>
      </Card.Content>
    </Card>
  );
};

export default Collapsible;
