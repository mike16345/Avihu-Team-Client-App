import { View, TouchableOpacity, Animated, LayoutChangeEvent, Dimensions } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import useStyles from "@/styles/useGlobalStyles";
import { Text } from "./Text";
import { ConditionalRender } from "./ConditionalRender";

import ButtonShadow from "./ButtonShadow";

interface ITabItems {
  label: string;
  value: any;
}

interface TabsProps {
  items: ITabItems[];
  value?: any;
  setValue: (value: any) => void;
}

const Tabs: React.FC<TabsProps> = ({ items, setValue, value }) => {
  const { colors, common, layout, spacing, text } = useStyles();

  const screenWidth = Dimensions.get("window").width; //initial default width

  const [containerWidth, setContainerWidth] = useState(screenWidth);

  const tabWidth = containerWidth / items.length - 0.5;
  const translateX = useRef(new Animated.Value(0)).current;

  const onLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    if (width !== containerWidth) {
      setContainerWidth(width);
    }
  };

  useEffect(() => {
    const activeIndex = items.findIndex((item) => item.value === value);

    Animated.spring(translateX, {
      toValue: -activeIndex * tabWidth,

      useNativeDriver: true,
    }).start();
  }, [value, tabWidth]);

  return (
    <View
      onLayout={onLayout}
      style={[
        layout.flexRow,
        layout.justifyEvenly,
        layout.itemsCenter,
        spacing.gapDefault,
        colors.backgroundSecondary,
        common.rounded,
        colors.outline,
        common.borderXsm,
        { height: 35, position: "relative", zIndex: 1 },
      ]}
    >
      <Animated.View
        style={{
          position: "absolute",
          height: "100%",
          width: tabWidth,
          transform: [{ translateX }],
        }}
      >
        <ButtonShadow>
          <View
            style={[
              layout.center,
              layout.heightFull,
              colors.backgroundSurface,
              colors.outline,
              common.borderXsm,
              common.rounded,
            ]}
          >
            <Text style={[text.textCenter, colors.textPrimary]}>
              {items.find((item) => item.value === value)?.label}
            </Text>
          </View>
        </ButtonShadow>
      </Animated.View>

      {items.map((tab) => {
        return (
          <TouchableOpacity
            key={tab.label}
            style={[layout.flex1, layout.heightFull]}
            onPress={() => setValue(tab.value)}
          >
            <ConditionalRender condition={tab.value !== value}>
              <View style={[layout.center, layout.heightFull]}>
                <Text style={[text.textCenter, colors.textPrimary]}>{tab.label}</Text>
              </View>
            </ConditionalRender>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default Tabs;
