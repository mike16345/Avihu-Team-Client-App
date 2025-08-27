import React from "react";
import { CustomModal, CustomModalProps } from "../ui/modals/Modal";
import { Text } from "../ui/Text";
import { useLayoutStyles } from "@/styles/useLayoutStyles";
import { ConditionalRender } from "../ui/ConditionalRender";

interface NotificationModalProps extends CustomModalProps {
  notifications: any[];
}

const NotificationModal: React.FC<NotificationModalProps> = ({ notifications, ...props }) => {
  const { center } = useLayoutStyles();

  return (
    <CustomModal {...props}>
      <CustomModal.Header>התראות</CustomModal.Header>
      <CustomModal.Content style={center}>
        <ConditionalRender condition={notifications.length == 0}>
          <Text>אין התראות</Text>
        </ConditionalRender>
      </CustomModal.Content>
    </CustomModal>
  );
};

export default NotificationModal;
