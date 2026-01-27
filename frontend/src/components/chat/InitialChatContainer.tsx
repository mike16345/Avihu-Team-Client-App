import { View } from "react-native";
import { Text } from "../ui/Text";
import useStyles from "@/styles/useGlobalStyles";
import Icon from "../Icon/Icon";

const InitialChatContainer = () => {
  const { layout, spacing, text } = useStyles();

  return (
    <View style={[layout.flex1, spacing.gap20, layout.itemsCenter]}>
      <View style={spacing.gapLg}>
        <View>
          <Text fontSize={24} fontVariant="light" style={text.textCenter}>
            מוזמנים לשאול כל שאלה
          </Text>
          <Text fontSize={24} fontVariant="light" style={text.textCenter}>
            בתחום האוכל, מענה אוטומטי
          </Text>
          <Text fontSize={24} fontVariant="light" style={text.textCenter}>
            מהיר בעזרת בינה מלאכותית
          </Text>
        </View>

        <View style={[layout.center]}>
          <Icon name="twinkle" height={35} width={35} />
        </View>
      </View>
    </View>
  );
};

export default InitialChatContainer;
