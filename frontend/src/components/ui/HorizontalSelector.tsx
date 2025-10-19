import { ScrollView, View } from "react-native";
import { Text } from "./Text";
import PrimaryButton from "./buttons/PrimaryButton";
import useStyles from "@/styles/useGlobalStyles";

interface HorizontalSelectorProps {
  selected: string;
  onSelect: (item: string) => void;
  items: string[];
}

const HorizontalSelector: React.FC<HorizontalSelectorProps> = ({
  onSelect,
  selected,
  items = [],
}) => {
  const { colors, spacing, layout } = useStyles();

  return (
    <View>
      <ScrollView
        horizontal
        contentContainerStyle={[spacing.gapDefault, layout.alignSelfStart]}
        nestedScrollEnabled
      >
        {items.map((item, i) => {
          const isActive = item === selected;

          return (
            <PrimaryButton
              key={i}
              mode={isActive ? "dark" : "light"}
              onPress={() => onSelect(item)}
              style={[
                spacing.pdVerticalSm,
                { borderWidth: 1, borderColor: "#072723", borderRadius: 8 },
              ]}
            >
              <View style={[spacing.pdHorizontalDefault]}>
                <Text style={isActive ? colors.textOnPrimary : colors.textPrimary}>{item}</Text>
              </View>
            </PrimaryButton>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default HorizontalSelector;
