import React, { useEffect, useRef, useState } from "react";
import { View, TouchableOpacity, Animated, LayoutChangeEvent, Dimensions } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import { Text } from "./Text";
import { ConditionalRender } from "./ConditionalRender";
import ButtonShadow from "./buttons/ButtonShadow";

interface TabsRootProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

interface TabsListProps {
  children: React.ReactNode;
}

interface TabsTriggerProps {
  label: string;
  value: string;
}

interface TabsContentProps {
  forceMount?: boolean;
  value: string;
  children: React.ReactNode;
}

const TabsContext = React.createContext<{
  value: string;
  setValue: (val: string) => void;
  tabWidth: number;
  registerTab: (value: string, label: string) => void;
  translateX: Animated.Value;
}>({
  value: "",
  setValue: () => {},
  tabWidth: 0,
  registerTab: () => {},
  translateX: new Animated.Value(0),
});

export const Tabs = ({ value, onValueChange, children }: TabsRootProps) => {
  const [tabs, setTabs] = useState<{ value: string; label: string }[]>([]);
  const [containerWidth, setContainerWidth] = useState(Dimensions.get("window").width);

  const translateX = useRef(new Animated.Value(0)).current;

  const tabWidth = containerWidth / (tabs.length || 1) - 0.5;

  const onLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;

    if (width !== containerWidth) setContainerWidth(width);
  };

  const registerTab = (tabValue: string, label: string) => {
    setTabs((prev) => {
      if (!prev.some((t) => t.value === tabValue)) {
        return [...prev, { value: tabValue, label }];
      }
      return prev;
    });
  };

  useEffect(() => {
    const activeIndex = tabs.findIndex((t) => t.label === value);
    Animated.spring(translateX, {
      toValue: -activeIndex * tabWidth,
      useNativeDriver: true,
    }).start();
  }, [value, tabWidth, tabs]);

  return (
    <TabsContext.Provider
      value={{ value, setValue: onValueChange, tabWidth, registerTab, translateX }}
    >
      <View onLayout={onLayout}>{children}</View>
    </TabsContext.Provider>
  );
};

export const TabsList = ({ children }: TabsListProps) => {
  const { colors, common, layout, spacing } = useStyles();
  const { tabWidth, value, translateX } = React.useContext(TabsContext);

  return (
    <View
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
            <Text fontVariant="semibold">{value}</Text>
          </View>
        </ButtonShadow>
      </Animated.View>
      {children}
    </View>
  );
};

export const TabsTrigger = ({ label, value }: TabsTriggerProps) => {
  const { setValue, value: activeValue, registerTab } = React.useContext(TabsContext);
  const { layout, text, colors } = useStyles();

  useEffect(() => {
    registerTab(value, label);
  }, []);

  return (
    <TouchableOpacity style={[layout.flex1, layout.widthFull]} onPress={() => setValue(value)}>
      <ConditionalRender condition={value !== activeValue}>
        <View style={[layout.center, layout.heightFull]}>
          <Text fontVariant="semibold" style={[text.textCenter, colors.textPrimary]}>
            {label}
          </Text>
        </View>
      </ConditionalRender>
    </TouchableOpacity>
  );
};

export const TabsContent = ({ value, children, forceMount = false }: TabsContentProps) => {
  const { value: activeValue } = React.useContext(TabsContext);

  if (!forceMount) {
    return activeValue === value ? <>{children}</> : null;
  }

  return <View style={[{ display: activeValue == value ? "flex" : "none" }]}>{children}</View>;
};
