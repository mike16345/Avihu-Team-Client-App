import { StyleSheet, TouchableOpacity, View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import Icon from "@/components/Icon/Icon";
import { Text } from "../Text";

interface SelectedCardProps {
  selected?: number;
  onClose: () => void;
}

const SelectedCard: React.FC<SelectedCardProps> = ({ onClose, selected }) => {
  const { colors, common, layout, spacing } = useStyles();

  return (
    <View
      style={[spacing.pdDefault, styles.selectedCard, colors.backgroundSecondary, common.rounded]}
    >
      <View style={[layout.flexRow, layout.justifyBetween]}>
        <TouchableOpacity onPress={onClose}>
          <Icon name="close" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose}>
          <Icon name="pencil" width={24} height={24} />
        </TouchableOpacity>
      </View>
      <View style={[layout.flex1, layout.center]}>
        <Text fontSize={36} style={[colors.textPrimary]}>
          {selected?.toFixed(2)}
        </Text>
      </View>
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
});

export default SelectedCard;
