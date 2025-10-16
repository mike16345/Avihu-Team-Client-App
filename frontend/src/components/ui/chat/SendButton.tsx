import { TouchableOpacity } from "react-native";
import Icon from "@/components/Icon/Icon";
import useStyles from "@/styles/useGlobalStyles";

interface SendButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

const SendButton: React.FC<SendButtonProps> = ({ onPress, disabled }) => {
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
        disabled ? { opacity: 0.5 } : null,
      ]}
    >
      <Icon name="send" height={24} width={24} />
    </TouchableOpacity>
  );
};

export default SendButton;
