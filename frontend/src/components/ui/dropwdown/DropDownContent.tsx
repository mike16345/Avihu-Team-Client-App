import { useEffect, useRef } from "react";
import { Animated, ScrollView, TouchableOpacity, View } from "react-native";
import { Text } from "../Text";
import useStyles from "@/styles/useGlobalStyles";
import { ConditionalRender } from "../ConditionalRender";
import Icon from "@/components/Icon/Icon";
import { useDropwDownContext } from "@/context/useDropdown";
import Collapsible from "../Collapsible";

const DropDownContent = () => {
  const { colors, common, layout, spacing } = useStyles();

  const { setSelectedValue, selectedValue, items, shouldCollapse, setShouldCollapse } =
    useDropwDownContext();

  const opacity = useRef(new Animated.Value(0)).current;

  const handleSelect = (val: any) => {
    setSelectedValue(val);
    setShouldCollapse(true);
  };

  useEffect(() => {
    if (!shouldCollapse) {
      Animated.timing(opacity, {
        toValue: 1,
        useNativeDriver: false,
        duration: 500,
      }).start();
    } else {
      Animated.timing(opacity, {
        toValue: 0,
        useNativeDriver: false,
        duration: 500,
      }).start();
    }
  }, [shouldCollapse]);

  return (
    <Animated.View style={{ opacity }}>
      <Collapsible isCollapsed={shouldCollapse} style={common.roundedMd}>
        <ScrollView style={{ maxHeight: 200 }}>
          {items.map(({ label, value }, i) => {
            const isSelected = selectedValue === value || selectedValue === label;

            return (
              <TouchableOpacity
                key={i}
                onPress={() => handleSelect(value)}
                style={[{ padding: 10 }, layout.flexRow, layout.justifyBetween]}
              >
                <View style={[layout.flexRow, layout.itemsCenter, spacing.gapDefault]}>
                  <View
                    style={[{ height: 8, width: 8 }, colors.backgroundSuccess, common.roundedFull]}
                  />
                  <Text>{label}</Text>
                </View>

                <ConditionalRender condition={isSelected}>
                  <Icon name="check" />
                </ConditionalRender>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Collapsible>
    </Animated.View>
  );
};

export default DropDownContent;
