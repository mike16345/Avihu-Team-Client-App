import React, { useMemo } from "react";
import { CustomModal, CustomModalProps } from "../ui/modals/Modal";
import { Text } from "../ui/Text";
import { useLayoutStyles } from "@/styles/useLayoutStyles";
import { ConditionalRender } from "../ui/ConditionalRender";
import Notification from "./containers/Notification";
import { INotification } from "@/store/notificationStore";

interface NotificationModalProps extends CustomModalProps {
  notifications: INotification[];
}

const NotificationModal: React.FC<NotificationModalProps> = ({ notifications, ...props }) => {
  const { center } = useLayoutStyles();

  const notificationMap = useMemo(() => {
    if (!notifications.length) return;

    return notifications.map((notification) => (
      <Notification key={notification.id} notification={notification} />
    ));
  }, [notifications]);

  return (
    <CustomModal {...props}>
      <CustomModal.Header>התראות</CustomModal.Header>
      <CustomModal.Content style={center}>
        <ConditionalRender condition={!notifications.length}>
          <Text>אין התראות</Text>
        </ConditionalRender>

        <ConditionalRender condition={!!notifications.length}>{notificationMap}</ConditionalRender>
      </CustomModal.Content>
    </CustomModal>
  );
};

export default NotificationModal;
