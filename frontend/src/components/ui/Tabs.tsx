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
  value?: string;
  setValue: (value: string) => void;
}

const Tabs: React.FC<TabsProps> = ({ items, setValue, value }) => {
  const { colors, common, layout, spacing, text } = useStyles();

  const screenWidth = Dimensions.get("window").width; //initial default width

  const [containerWidth, setContainerWidth] = useState(screenWidth);

  const tabWidth = containerWidth / items.length;
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
        layout.justifyBetween,
        layout.itemsCenter,
        spacing.gapDefault,
        colors.backgroundSecondary,
        common.rounded,
        colors.outline,
        common.borderXsm,
        { height: 35, position: "relative" },
      ]}
    >
      <Animated.View
        style={{
          position: "absolute",
          left: 0,
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
            <Text style={text.textCenter}>{items.find((item) => item.value === value)?.label}</Text>
          </View>
        </ButtonShadow>
      </Animated.View>

      {items.map((t) => (
        <TouchableOpacity
          key={t.label}
          style={[layout.flex1, layout.heightFull]}
          onPress={() => setValue(t.value)}
        >
          <ConditionalRender condition={t.value !== value}>
            <View style={[layout.center, layout.heightFull]}>
              <Text style={text.textCenter}>{t.label}</Text>
            </View>
          </ConditionalRender>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default Tabs;
