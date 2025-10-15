import React, { useMemo } from "react";
import { CustomModal, CustomModalProps } from "../ui/modals/Modal";
import { Text } from "../ui/Text";
import { ConditionalRender } from "../ui/ConditionalRender";
import Notification from "./containers/Notification";
import { INotification } from "@/store/notificationStore";
import { ScrollView, View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";

interface NotificationModalProps extends CustomModalProps {
  notifications: INotification[];
}

const NotificationModal: React.FC<NotificationModalProps> = ({ notifications, ...props }) => {
  const { layout, spacing, common } = useStyles();

  const notificationMap = useMemo(() => {
    if (!notifications.length) return;

    return notifications.map((notification) => (
      <Notification key={notification.id} notification={notification} />
    ));
  }, [notifications]);

  return (
    <CustomModal {...props}>
      <CustomModal.Header>התראות</CustomModal.Header>
      <CustomModal.Content style={{ padding: 0 }}>
        <ConditionalRender condition={!notifications.length}>
          <View style={[layout.flex1, layout.center]}>
            <Text>אין התראות</Text>
          </View>
        </ConditionalRender>

        <ConditionalRender condition={!!notifications.length}>
          <ScrollView
            style={common.roundedMd}
            contentContainerStyle={[spacing.gapLg, spacing.pdLg]}
          >
            {notificationMap}
          </ScrollView>
        </ConditionalRender>
      </CustomModal.Content>
    </CustomModal>
  );
};

export default NotificationModal;
