import { TouchableOpacity, TouchableOpacityProps } from "react-native";
import Icon from "@/components/Icon/Icon";
import useStyles from "@/styles/useGlobalStyles";

interface SendButtonProps {
  onPress: () => void;
  disabled?: boolean;
  testID?: TouchableOpacityProps["testID"];
}

const SendButton: React.FC<SendButtonProps> = ({ onPress, disabled, testID }) => {
  const { colors, common, layout, spacing } = useStyles();

  return (
    <TouchableOpacity
      testID={testID}
      disabled={disabled}
      onPress={onPress}
      style={[
        colors.backgroundPrimary,
        layout.alignSelfEnd,
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
