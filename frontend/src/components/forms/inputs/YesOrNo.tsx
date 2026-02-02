import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";

import useStyles from "@/styles/useGlobalStyles";
import { Text } from "@/components/ui/Text";
import Input from "@/components/ui/inputs/Input";

interface YesOrNoProps {
  value?: string;
  onChange: (value: string) => void;
}

const INPUT_HEIGHT = 140; // close to your textarea minHeight

const YesOrNo: React.FC<YesOrNoProps> = ({ value, onChange }) => {
  const { layout, spacing, colors, common } = useStyles();

  const initialValue = !value ? "לא" : value !== "לא" ? "כן" : value;
  const isValueYesOrNo = useMemo(() => value === "כן" || value === "לא", [value]);
  const [selectedOption, setSelectedOption] = useState(initialValue);
  const [other, setOther] = useState<string>(isValueYesOrNo ? "" : value);
  const hasSelectedYes = useMemo(() => selectedOption === "כן", [selectedOption]);

  /** 🔹 animated values */
  const animatedHeight = useSharedValue(0);
  const animatedOpacity = useSharedValue(0);

  /** 🔹 animated styles */
  const inputContainerStyle = useAnimatedStyle(() => {
    return {
      height: animatedHeight.value,
      opacity: animatedOpacity.value,
    };
  });

  const handleChangeText = (text: string) => {
    setOther(text);
    onChange(text);
  };

  const handlePress = (option: "כן" | "לא") => {
    setSelectedOption(option);

    if (option == "כן") {
      handleChangeText("");
    } else {
      onChange(option);
    }
  };

  /** 🔹 animate when selection changes */
  useEffect(() => {
    animatedHeight.value = withTiming(hasSelectedYes ? INPUT_HEIGHT : 0, {
      duration: 300,
    });

    animatedOpacity.value = withTiming(hasSelectedYes ? 1 : 0, {
      duration: 200,
    });
  }, [hasSelectedYes]);

  return (
    <View style={[spacing.gapMd]}>
      <View style={[spacing.gapSm]}>
        {["לא", "כן"].map((option) => {
          const isSelected = option === selectedOption;

          return (
            <TouchableOpacity
              key={option}
              onPress={() => handlePress(option as any)}
              style={[layout.flexRow, layout.itemsCenter, spacing.gapDefault]}
            >
              <View
                style={[
                  styles.radioOuter,
                  common.roundedFull,
                  colors.outline,
                  isSelected ? colors.backgroundPrimary : colors.background,
                ]}
              >
                <View
                  style={[
                    styles.radioInner,
                    common.roundedFull,
                    isSelected ? colors.backgroundSurface : colors.background,
                  ]}
                />
              </View>
              <Text style={colors.textPrimary}>{option}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 🔹 Animated input container */}
      <Animated.View style={[inputContainerStyle, { overflow: "hidden" }]}>
        {hasSelectedYes && (
          <Input
            placeholder="אם כן, פרט"
            value={other}
            onChangeText={handleChangeText}
            style={[colors.backgroundSurface, styles.textarea]}
            multiline
            numberOfLines={4}
          />
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  radioOuter: {
    height: 20,
    width: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    height: 8,
    width: 8,
  },
  textarea: {
    minHeight: 120,
    textAlignVertical: "top",
  },
});

export default YesOrNo;
