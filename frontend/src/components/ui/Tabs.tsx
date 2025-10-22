import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, LayoutChangeEvent, Dimensions } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import { Text } from "./Text";
import { ConditionalRender } from "./ConditionalRender";
import ButtonShadow from "./buttons/ButtonShadow";
import Animated, { useSharedValue, withSpring, SharedValue } from "react-native-reanimated";

interface TabsRootProps<T extends string> {
  value: T;
  onValueChange: (value: T) => void;
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

type TabsContextValue<T extends string> = {
  value: T;
  setValue: (v: T) => void;
  tabWidth: number;
  registerTab: (value: T, label: string) => void;
  translateX: SharedValue<number>;
};

const TabsContext = React.createContext<TabsContextValue<any>>({
  value: "",
  setValue: () => {},
  tabWidth: 0,
  registerTab: () => {},
  translateX: 0,
});

export const Tabs = <T extends string>({ value, onValueChange, children }: TabsRootProps<T>) => {
  const [tabs, setTabs] = useState<{ value: T; label: string }[]>([]);
  const [containerWidth, setContainerWidth] = useState(Dimensions.get("window").width);

  const translateX = useSharedValue(0);

  const tabWidth = containerWidth / (tabs.length || 1) - 0.5;

  const onLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;

    if (width !== containerWidth) setContainerWidth(width);
  };

  const registerTab = (tabValue: T, label: string) => {
    setTabs((prev) => {
      if (!prev.some((t) => t.value === tabValue)) {
        return [...prev, { value: tabValue, label }];
      }
      return prev;
    });
  };

  useEffect(() => {
    let activeIndex = tabs.findIndex((t) => t.label === value);
    activeIndex = activeIndex == -1 ? 0 : activeIndex;

    translateX.value = withSpring(-activeIndex * tabWidth, { damping: 14 });
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
