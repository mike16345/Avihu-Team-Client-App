import React, { useCallback } from "react";
import { Modal, Pressable, TouchableOpacity, View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import { Text } from "../ui/Text";

interface MessageContextMenuProps {
  visible: boolean;
  onClose: () => void;
  onCopy?: () => void;
  onDelete?: () => void;
}

const MessageContextMenu: React.FC<MessageContextMenuProps> = ({
  visible,
  onClose,
  onCopy,
  onDelete,
}) => {
  const { colors, layout, spacing, common } = useStyles();

  const handleCopy = useCallback(() => {
    onCopy?.();
    onClose();
  }, [onClose, onCopy]);

  const handleDelete = useCallback(() => {
    onDelete?.();
    onClose();
  }, [onClose, onDelete]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={[layout.flex1, layout.justifyCenter, layout.itemsCenter, colors.backdrop]}
        onPress={onClose}
      >
        <View
          style={[
            colors.backgroundSurface,
            colors.outline,
            common.borderXsm,
            common.rounded,
            spacing.pdMd,
            spacing.gapSm,
            { minWidth: 180 },
          ]}
        >
          {onCopy ? (
            <TouchableOpacity onPress={handleCopy} style={[spacing.pdXs]}>
              <Text fontVariant="semibold">העתקה</Text>
            </TouchableOpacity>
          ) : null}

          {onDelete ? (
            <TouchableOpacity onPress={handleDelete} style={[spacing.pdXs]}>
              <Text fontVariant="semibold">מחיקה</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </Pressable>
    </Modal>
  );
};

export default MessageContextMenu;
