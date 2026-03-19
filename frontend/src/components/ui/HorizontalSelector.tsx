import { ScrollView, StyleProp, View, ViewStyle } from "react-native";
import { Text } from "./Text";
import PrimaryButton from "./buttons/PrimaryButton";
import useStyles from "@/styles/useGlobalStyles";
import { selectionHaptic } from "@/utils/haptics";

interface HorizontalSelectorProps {
  selected: string;
  onSelect: (item: string) => void;
  items: string[];
  style?: StyleProp<ViewStyle>;
}

const HorizontalSelector: React.FC<HorizontalSelectorProps> = ({
  onSelect,
  selected,
  items = [],
  style,
}) => {
  const { colors, spacing, layout, text } = useStyles();

  const handleSelect = (item: string) => {
    selectionHaptic();
    onSelect(item);
  };

  return (
    <View>
      <ScrollView
        horizontal
        contentContainerStyle={[spacing.gapDefault, layout.alignSelfStart, style]}
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
      >
        {items.map((item, i) => {
          const isActive = item == selected;

          return (
            <PrimaryButton
              key={i}
              mode={isActive ? "dark" : "light"}
              onPress={() => handleSelect(item)}
              style={[
                spacing.pdVerticalSm,
                { borderWidth: 1, borderColor: "#072723", borderRadius: 8 },
              ]}
            >
              <View style={[{ minWidth: 68 }]}>
                <Text
                  style={[isActive ? colors.textOnPrimary : colors.textPrimary, text.textCenter]}
                >
                  {item}
                </Text>
              </View>
            </PrimaryButton>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default HorizontalSelector;
