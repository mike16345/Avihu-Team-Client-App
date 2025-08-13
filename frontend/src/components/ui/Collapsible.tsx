import {
  View,
  TouchableOpacity,
  LayoutChangeEvent,
  Animated,
  StyleProp,
  ViewStyle,
} from "react-native";
import { Card } from "./Card";
import { ReactNode, useEffect, useRef, useState } from "react";
import { ConditionalRender } from "./ConditionalRender";
import useStyles from "@/styles/useGlobalStyles";
import { Text } from "./Text";
import Icon from "../Icon/Icon";

interface CollapsibleProps {
  isCollapsed: boolean;
  onCollapseChange: (value: boolean) => void;
  children: ReactNode;
  trigger: ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: "gray" | "white";
}

const ANIMATION_DURATION = 250;

const Collapsible: React.FC<CollapsibleProps> = ({
  children,
  trigger,
  isCollapsed,
  onCollapseChange,
  style,
  variant = "gray",
}) => {
  const { layout, text } = useStyles();

  const [contentHeight, setContentHeight] = useState(0);
  const [measured, setMeasured] = useState(false);
  const [renderChildren, setRenderChildren] = useState(false);

  const height = useRef(new Animated.Value(0)).current;

  const getContentHeight = (e: LayoutChangeEvent) => {
    const height = e.nativeEvent.layout.height;

    if (contentHeight !== height) {
      setContentHeight(height);
      setMeasured(true);
    }
  };

  useEffect(() => {
    if (!isCollapsed) {
      Animated.timing(height, {
        toValue: contentHeight,
        useNativeDriver: false,
        duration: ANIMATION_DURATION,
      }).start();
      setRenderChildren(true);
    } else {
      Animated.timing(height, {
        toValue: 0,
        useNativeDriver: false,
        duration: ANIMATION_DURATION,
      }).start();

      setTimeout(() => {
        setRenderChildren(false);
      }, ANIMATION_DURATION);
    }
  }, [isCollapsed]);

  return (
    <Card variant={variant} style={style}>
      <Card.Header>
        <TouchableOpacity onPress={() => onCollapseChange(!isCollapsed)}>
          <ConditionalRender condition={typeof trigger === "string"}>
            <View style={[layout.flexRow, layout.itemsCenter, layout.justifyBetween]}>
              <Text style={text.textBold}>{trigger}</Text>
              <Icon name="chevronDown" rotation={!isCollapsed ? 180 : 0} />
            </View>
          </ConditionalRender>

          <ConditionalRender condition={typeof trigger !== "string"}>{trigger}</ConditionalRender>
        </TouchableOpacity>
      </Card.Header>

      <Card.Content>
        <ConditionalRender condition={!measured}>
          <Animated.View onLayout={getContentHeight}>{children}</Animated.View>
        </ConditionalRender>

        <ConditionalRender condition={measured && renderChildren}>
          <Animated.View style={{ height, overflow: "hidden" }}>{children}</Animated.View>
        </ConditionalRender>
      </Card.Content>
    </Card>
  );
};

export default Collapsible;
