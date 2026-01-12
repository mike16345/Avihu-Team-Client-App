import { TouchableOpacity, View } from "react-native";
import React from "react";
import { Text } from "@/components/ui/Text";
import { Card } from "@/components/ui/Card";
import useStyles from "@/styles/useGlobalStyles";
import Icon from "@/components/Icon/Icon";
import { RootStackParamListNavigationProp } from "@/types/navigatorTypes";
import { useNavigation } from "@react-navigation/native";
import { INotification } from "@/store/notificationStore";

interface FormReminderContainerProps {
  notification: INotification;
  handleDismiss: () => void;
  onNavigate: () => void;
}

const FormReminderContainer: React.FC<FormReminderContainerProps> = ({
  notification,
  handleDismiss,
  onNavigate,
}) => {
  const { common, layout, spacing } = useStyles();

  const navigation = useNavigation<RootStackParamListNavigationProp>();

  const handleNavigation = () => {
    navigation.navigate("FormPreset", { formId: notification.data.id });

    onNavigate();
  };

  return (
    <Card style={[common.roundedMd, layout.widthFull, layout.itemsStart, spacing.pdMd]}>
      <Card.Content style={[layout.flexRow, layout.itemsStart, { gap: 10 }]}>
        <Icon name="info" height={20} width={20} />
        <View style={[layout.flex1, layout.itemsStart]}>
          <Text fontSize={16} fontVariant="semibold" style={{ paddingBottom: 4 }}>
            {notification.body}
          </Text>

          <View style={[layout.flexRow, layout.justifyStart, { gap: 12 }]}>
            <TouchableOpacity onPress={handleNavigation}>
              <Text fontSize={14} fontVariant="semibold">
                למעבר לחץ כאן
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDismiss}>
              <Text fontSize={14} fontVariant="semibold" style={{ color: "grey" }}>
                התעלם
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity onPress={handleDismiss}>
          <Icon name="closeSoft" height={20} width={20} />
        </TouchableOpacity>
      </Card.Content>
    </Card>
  );
};

export default FormReminderContainer;
