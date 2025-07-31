import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
  StyleProp,
  ViewStyle,
  Platform,
} from "react-native";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import { LineChart } from "react-native-chart-kit";
import useStyles from "@/styles/useGlobalStyles";
import { ConditionalRender } from "../ConditionalRender";
import { Text } from "../Text";
import Icon from "../../Icon/Icon";
import { getIconName, getIconRotation } from "@/utils/graph";
import SelectedDot from "./SelectedDot";
import useGraphTheme from "@/themes/useGraphTheme";
import SelectedCard from "./SelectedCard";

interface GraphProps {
  header?: ReactNode;
  style?: StyleProp<ViewStyle>;
  data: number[];
  labels: string[];
  mounted?: boolean;
}

const Graph: React.FC<GraphProps> = ({ header, style, data, labels, mounted = true }) => {
  const { colors, common, layout, fonts, spacing } = useStyles();
  const graphTheme = useGraphTheme();

  const [selected, setSelected] = useState<number | undefined>(undefined);
  const [selectedLabel, setSelectedLabel] = useState(0);
  const [atScrollEnd, setAtScrollEnd] = useState(false);
  const [atScrollStart, setAtScrollStart] = useState(true);
  const [readyToScroll, setReadyToScroll] = useState(false);

  const scrollRef = useRef<ScrollView>(null);

  const labelCount = labels.length;
  const labelWidth = 80;
  const spacingBetween = spacing.gapDefault.gap;
  const paddingLeft = 60;

  const chartWidth = labelCount * labelWidth + labelCount * spacingBetween + paddingLeft;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;

    const buffer = 20;
    const isAtBottom = layoutMeasurement.width + contentOffset.x >= contentSize.width - buffer;
    const isAtTop = contentOffset.x <= 0;

    if (isAtBottom && !atScrollEnd) {
      setAtScrollEnd(true);
      setAtScrollStart(false);
    } else if (isAtTop && !atScrollStart) {
      setAtScrollStart(true);
      setAtScrollEnd(false);
    } else if (!isAtTop && !isAtBottom && (atScrollStart || atScrollEnd)) {
      setAtScrollStart(false);
      setAtScrollEnd(false);
    }
  };

  const scrollToEnd = () => {
    scrollRef.current?.scrollToEnd();
  };
  const scrollToStart = (animated = true) => {
    scrollRef.current?.scrollTo({ x: 0, animated });
  };

  const handleLayout = () => {
    if (readyToScroll) {
      const SHOULD_ANIMATE = false;

      scrollToStart(SHOULD_ANIMATE);
      setReadyToScroll(false); // prevent infinite loop
    }
  };

  useEffect(() => {
    if (Platform.OS === "android" && mounted) {
      setReadyToScroll(true);
    }
  }, [mounted]);

  return (
    <View style={[{ padding: 0 }, style]}>
      <View style={styles.header}>{header}</View>
      <ScrollView
        ref={scrollRef}
        style={{ direction: "ltr" }}
        horizontal
        onScroll={handleScroll}
        onLayout={handleLayout}
        showsHorizontalScrollIndicator={false}
      >
        <View style={[layout.alignSelfStart, { position: "relative" }]}>
          <LineChart
            withVerticalLabels={false}
            data={{
              labels: [],
              datasets: [
                {
                  data: data.length == 0 ? [0] : data,
                },
              ],
            }}
            renderDotContent={(params) => (
              <SelectedDot key={params.index} selectedLabel={selectedLabel} {...params} />
            )}
            width={chartWidth}
            height={220}
            withShadow
            withInnerLines={false}
            withOuterLines={false}
            onDataPointClick={({ value }) => setSelected(value)}
            chartConfig={graphTheme}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
          <View
            style={[
              layout.flexDirectionByPlatform, //adnroid is flipped
              spacing.gapDefault,
              layout.alignSelfEnd,
              layout.justifyBetween,
              layout.itemsCenter,
              styles.labels,
              { width: (labelCount - 0.5) * labelWidth },
              Platform.OS == "ios" ? { left: 60 } : { right: 60 }, //adnroid is flipped
            ]}
          >
            {labels.map((label, i) => (
              <View key={i} style={[]}>
                <TouchableOpacity
                  onPress={() => setSelectedLabel(i)}
                  style={[
                    selectedLabel == i && [
                      colors.backgroundPrimary,
                      common.roundedLg,
                      spacing.pdXs,
                      { paddingHorizontal: 5 },
                    ],
                    layout.center,
                    layout.alignSelfEnd,
                  ]}
                >
                  <Text style={selectedLabel == i && [colors.textOnPrimary]}>{label}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      <View style={[layout.flexRow, styles.indicators, spacing.gapDefault]}>
        <TouchableOpacity onPress={scrollToEnd}>
          <Icon
            name={getIconName(atScrollEnd)}
            rotation={getIconRotation(atScrollEnd, "end")}
            height={18}
            width={18}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => scrollToStart()}>
          <Icon
            name={getIconName(atScrollStart)}
            rotation={getIconRotation(atScrollStart, "start")}
            height={18}
            width={18}
          />
        </TouchableOpacity>
      </View>

      <ConditionalRender condition={typeof selected == "number"}>
        <SelectedCard selected={selected} onClose={() => setSelected(undefined)} />
      </ConditionalRender>
    </View>
  );
};

const styles = StyleSheet.create({
  labels: {
    minWidth: 100,
    position: "absolute",
    bottom: 15,
  },
  header: {
    paddingHorizontal: 12,
    paddingTop: 15,
    paddingBottom: 0,
  },
  indicators: {
    paddingHorizontal: 12,
    paddingBottom: 10,
    marginTop: -15,
  },
});

export default Graph;
