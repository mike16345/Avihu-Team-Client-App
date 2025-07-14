import { FC } from "react";
import { Modal, Portal } from "react-native-paper";
import { Props } from "react-native-paper/lib/typescript/components/Modal";

interface CustomModalProps extends Props {}

export const CustomModal: FC<CustomModalProps> = ({ ...props }) => {
  return (
    <Portal>
      <Modal {...props}>{props.children}</Modal>
    </Portal>
  );
};
