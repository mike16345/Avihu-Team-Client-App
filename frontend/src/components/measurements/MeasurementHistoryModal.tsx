import { TouchableOpacity } from "react-native";
import { useState } from "react";
import { CustomModal } from "../ui/modals/Modal";
import { Text } from "../ui/Text";
import useStyles from "@/styles/useGlobalStyles";
import MeasurementHistoryContent from "./MeasurementHistoryContent";

const MeasurementHistoryModal = () => {
  const { colors } = useStyles();

  const [openModal, setOpenModal] = useState(false);

  return (
    <>
      <TouchableOpacity onPress={() => setOpenModal(true)}>
        <Text fontSize={16} fontVariant="bold">
          לצפייה בהיקפים
        </Text>
      </TouchableOpacity>

      <CustomModal visible={openModal} onDismiss={() => setOpenModal(false)}>
        <CustomModal.Header dismissIcon="chevronRightBig">
          <Text fontSize={14} fontVariant="semibold">
            היקפים
          </Text>
        </CustomModal.Header>

        <CustomModal.Content style={[{ borderWidth: 0 }, colors.background]}>
          <MeasurementHistoryContent />
        </CustomModal.Content>
      </CustomModal>
    </>
  );
};

export default MeasurementHistoryModal;
