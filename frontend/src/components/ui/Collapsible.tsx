import {
  View,
  TouchableOpacity,
  LayoutChangeEvent,
  Animated,
  StyleProp,
  ViewStyle,
} from "react-native";
import { Card, CardVariants } from "./Card";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { ConditionalRender } from "./ConditionalRender";
import useStyles from "@/styles/useGlobalStyles";
import { Text, TextProps } from "./Text";
import Icon from "../Icon/Icon";
import React from "react";

interface CollapsibleProps {
  isCollapsed: boolean;
  onCollapseChange?: () => void;
  children: ReactNode;
  trigger?: ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: CardVariants;
  customHeight?: number;
  keepMounted?: boolean; // keep child mounted when collapsed (avoids remount cost)
  freezeOnCollapse?: boolean; // stop child re-renders while collapsed
  onExpandEnd?: () => void; // optional hooks if you need them
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

  const height = useRef(new Animated.Value(0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);
  const isAnimatingRef = useRef(false);

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

  useEffect(() => {
    animRef.current?.stop();

    const run = (to: number, cb?: () => void) => {
      isAnimatingRef.current = true;
      animRef.current = Animated.timing(height, {
        toValue: to,
        useNativeDriver: false, // height cannot be on native driver
        duration: ANIMATION_DURATION,
      });
      animRef.current.start(() => {
        isAnimatingRef.current = false;
        animRef.current = null;
        cb?.();
      });
    };

    if (!isCollapsed) {
      // ensure mounted before expanding (only when not keeping mounted)
      if (!keepMounted) setRenderChildren(true);
      run(contentHeight, onExpandEnd);
    } else {
      run(0, () => {
        if (!keepMounted) setRenderChildren(false);
        onCollapseEnd?.();
      });
    }

    return () => {
      animRef.current?.stop();
      animRef.current = null;
      isAnimatingRef.current = false;
    };
  }, [isCollapsed, contentHeight, keepMounted, onExpandEnd, onCollapseEnd]);

  const memoizedChild = React.useMemo(() => children, [isCollapsed ? null : children]);

  return (
    <Card variant={variant} style={style}>
      <ConditionalRender condition={trigger}>
        <Card.Header>
          <TouchableOpacity
            onPress={() => {
              onCollapseChange?.();
            }}
          >
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
          shouldRasterizeIOS={isAnimatingRef.current}
          renderToHardwareTextureAndroid={isAnimatingRef.current}
          style={[layout.flex1, { height, overflow: "hidden" }]}
          collapsable
          pointerEvents={isCollapsed ? "none" : "auto"}
        >
          {keepMounted ? (
            freezeOnCollapse ? (
              <View style={[layout.flex1]} shouldRasterizeIOS renderToHardwareTextureAndroid>
                {memoizedChild}
              </View>
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
