import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import useStyles from "@/styles/useGlobalStyles";
import { Text } from "../Text";

interface GraphLabelsProps {
  labels: string[];
  width: number;
  selectedIndex: number;
  onSelect: (index: number) => void;
}

const GraphLabels: React.FC<GraphLabelsProps> = ({ labels, onSelect, selectedIndex, width }) => {
  const { colors, common, layout, spacing } = useStyles();

  return (
    <View
      style={[
        layout.flexDirectionByPlatform,
        spacing.gapDefault,
        layout.alignSelfEnd,
        layout.justifyBetween,
        layout.itemsCenter,
        styles.labels,
        { width },
        Platform.OS == "ios" ? { left: 60 } : { right: 60 }, //adnroid is flipped
      ]}
    >
      {labels.map((label, i) => (
        <View key={i}>
          <TouchableOpacity
            onPress={() => onSelect(i)}
            style={[
              selectedIndex == i && [
                colors.backgroundPrimary,
                common.roundedLg,
                spacing.pdXs,
                { paddingHorizontal: 5 },
              ],
              layout.center,
              layout.alignSelfEnd,
            ]}
          >
            <Text
              fontSize={12}
              style={[selectedIndex == i ? [colors.textOnPrimary] : [{ opacity: 0.5 }]]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  labels: {
    minWidth: 100,
    position: "absolute",
    bottom: 15,
  },
});

export default GraphLabels;
