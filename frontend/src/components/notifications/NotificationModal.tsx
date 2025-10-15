import React from "react";
import { CustomModal, CustomModalProps } from "../ui/modals/Modal";
import { Text } from "../ui/Text";
import { useLayoutStyles } from "@/styles/useLayoutStyles";
import { ConditionalRender } from "../ui/ConditionalRender";
import ReminderContainer from "./containers/ReminderContainer";

interface NotificationModalProps extends CustomModalProps {
  notifications: any[];
}

const NotificationModal: React.FC<NotificationModalProps> = ({ notifications, ...props }) => {
  const { center } = useLayoutStyles();

  return (
    <CustomModal {...props}>
      <CustomModal.Header>התראות</CustomModal.Header>
      <CustomModal.Content style={center}>
        <ConditionalRender condition={!notifications.length}>
          <Text>אין התראות</Text>

          <ReminderContainer />
        </ConditionalRender>

        <ConditionalRender condition={!!notifications.length}>
          <Text>אין התראות</Text>
        </ConditionalRender>
      </CustomModal.Content>
    </CustomModal>
  );
};

export default NotificationModal;
