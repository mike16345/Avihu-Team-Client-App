import Icon from "@/components/Icon/Icon";
import useStyles from "@/styles/useGlobalStyles";
import { ReactNode, useState } from "react";
import {
  I18nManager,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  View,
} from "react-native";

interface WindowProps {
  windowItems: ReactNode[];
}

const Windows: React.FC<WindowProps> = ({ windowItems }) => {
  const { layout, spacing } = useStyles();

  const [windowWidth, setWindowWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const onLayout = (e: LayoutChangeEvent) => {
    const containerWidth = e.nativeEvent.layout.width;

    if (containerWidth !== windowWidth) {
      setWindowWidth(containerWidth);
    }
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const interval = windowWidth + spacing.gapMd.gap;

    const rawIndex = Math.round(offsetX / interval);
    const correctedIndex = I18nManager.isRTL ? (windowItems?.length ?? 0) - 1 - rawIndex : rawIndex;

    setActiveIndex(correctedIndex);
  };

  return (
    <>
      <ScrollView
        onLayout={onLayout}
        decelerationRate={0.9}
        snapToInterval={windowWidth + spacing.gapMd.gap}
        snapToAlignment="center"
        horizontal
        contentContainerStyle={[spacing.gapLg]}
        onScroll={handleScroll}
        showsHorizontalScrollIndicator={false}
      >
        {windowItems?.map((window, i) => (
          <View key={i} style={[{ width: windowWidth }, layout.flex1]}>
            {window}
          </View>
        ))}
      </ScrollView>
      <View style={[spacing.gapDefault, layout.flexRow, layout.center]}>
        {windowItems?.map((_, i) => (
          <Icon name={i == activeIndex ? "elipse" : "elipseSoft"} height={10} width={10} />
        ))}
      </View>
    </>
  );
};

export default Windows;
