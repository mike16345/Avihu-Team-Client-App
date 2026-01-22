import React, { useEffect, useMemo, useState } from "react";
import { TouchableOpacity, View } from "react-native";
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

  const [selectedOption, setSelectedOption] = useState(value !== "לא" ? "כן" : value);
  const hasSelectedYes = useMemo(() => selectedOption === "כן", [selectedOption]);
  const [inputValue, setInputValue] = useState(hasSelectedYes ? value : "");

  /** 🔹 animated values */
  const animatedHeight = useSharedValue(0);
  const animatedOpacity = useSharedValue(0);

  const handleUpdate = () => {
    if (hasSelectedYes) onChange(inputValue!);
    else {
      setInputValue("");
      onChange(selectedOption!);
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

    handleUpdate();
  }, [hasSelectedYes]);

  /** 🔹 animated styles */
  const inputContainerStyle = useAnimatedStyle(() => {
    return {
      height: animatedHeight.value,
      opacity: animatedOpacity.value,
    };
  });

  return (
    <View style={[spacing.gapMd]}>
      <View style={[spacing.gapSm]}>
        {["כן", "לא"].map((option) => {
          const isSelected = option === selectedOption;

          return (
            <TouchableOpacity
              key={option}
              onPress={() => setSelectedOption(option)}
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
            value={inputValue}
            onChangeText={setInputValue}
            style={[colors.backgroundSurface, styles.textarea]}
            multiline
            numberOfLines={4}
            onBlur={handleUpdate}
          />
        )}
      </Animated.View>
    </View>
  );
};

const styles = {
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
};

export default YesOrNo;
