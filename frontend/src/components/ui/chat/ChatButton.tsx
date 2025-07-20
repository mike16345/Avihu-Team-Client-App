import { TouchableOpacity } from "react-native";
import Icon from "@/components/Icon/Icon";
import useStyles from "@/styles/useGlobalStyles";

interface ChatButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

const ChatButton: React.FC<ChatButtonProps> = ({ onPress, disabled }) => {
  const { colors, common, layout, spacing } = useStyles();

  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      style={[
        colors.backgroundPrimary,
        layout.alignSelfStart,
        spacing.pdDefault,
        common.roundedFull,
      ]}
    >
      <Icon name="send" height={24} width={24} />
    </TouchableOpacity>
  );
};

export default ChatButton;
