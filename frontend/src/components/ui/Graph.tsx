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
import { ConditionalRender } from "./ConditionalRender";
import { Text } from "./Text";
import Icon from "../Icon/Icon";
import { returnIconName, returnIconRotation } from "@/utils/graph";

interface GraphProps {
  header?: ReactNode;
  style?: StyleProp<ViewStyle>;
  data: number[];
  labels: string[];
  mounted?: boolean;
}

const Graph: React.FC<GraphProps> = ({ header, style, data, labels, mounted = true }) => {
  const { colors, common, layout, fonts, spacing } = useStyles();

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

  const handleLayout = () => {
    if (readyToScroll) {
      scrollRef.current?.scrollTo({ x: 0, animated: false });
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
            renderDotContent={({ x, y, index }) => {
              if (index === selectedLabel) {
                return (
                  <View
                    key={index}
                    style={[
                      styles.selectedDot,
                      Platform.OS == "ios"
                        ? { top: y - 9, left: x - 9 }
                        : { top: y - 9, right: x - 9 }, //android is flipped
                    ]}
                  />
                );
              }
              return null;
            }}
            width={chartWidth}
            height={220}
            withShadow
            withInnerLines={false}
            withOuterLines={false}
            onDataPointClick={({ value }) => setSelected(value)}
            chartConfig={{
              backgroundGradientFrom: colors.backgroundSecondary.backgroundColor,
              backgroundGradientTo: colors.backgroundSecondary.backgroundColor,
              fillShadowGradientTo: "#9FFFA2",
              fillShadowGradientFrom: "#79F681",
              color: () => `rgba(119, 243, 146, 1)`,
              labelColor: (opacity = 1) => `rgba(69, 68, 89, ${opacity})`,
              propsForDots: {
                r: "6",
                strokeWidth: "2",
                stroke: "#FFF",
                fill: "#33B333",
              },
            }}
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
        <Icon
          name={returnIconName(atScrollEnd)}
          rotation={returnIconRotation(atScrollEnd, "end")}
          height={18}
          width={18}
        />
        <Icon
          name={returnIconName(atScrollStart)}
          rotation={returnIconRotation(atScrollStart, "start")}
          height={18}
          width={18}
        />
      </View>

      <ConditionalRender condition={typeof selected == "number"}>
        <View
          style={[
            spacing.pdDefault,
            styles.selectedCard,
            colors.backgroundSecondary,
            common.rounded,
          ]}
        >
          <TouchableOpacity onPress={() => setSelected(undefined)}>
            <Icon name="close" />
          </TouchableOpacity>

          <View style={[layout.flex1, layout.center]}>
            <Text style={[fonts.xxxl, colors.textPrimary]}>{selected}</Text>
          </View>
        </View>
      </ConditionalRender>
    </View>
  );
};

const styles = StyleSheet.create({
  selectedCard: {
    position: "absolute",
    top: 0,
    right: 0,
    height: "100%",
    width: "100%",
  },
  selectedDot: {
    position: "absolute",
    width: 18,
    height: 18,
    borderRadius: 12,
    backgroundColor: "#33B333",
    borderWidth: 2,
    borderColor: "#FFF",
  },
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
