import { StyleSheet, Text, View, TouchableHighlight, TextInput } from "react-native";
import { FC, useState } from "react";
import Button from "@/components/Button/Button";
import { Colors } from "@/constants/Colors";
import { IWeighInPost } from "@/interfaces/User";
import { useLayoutStyles } from "@/styles/useLayoutStyles";
import useCommonStyles from "@/styles/useCommonStyles";
import { CustomModal } from "../ui/Modal";

interface AddWeightProps {
  onSave: (newWeighIn: IWeighInPost) => void;
}

const AddWeightModal: FC<AddWeightProps> = ({ onSave }) => {
  const [openAddWeightModal, setOpenAddWeightModal] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [weight, setWeight] = useState(0);
  const commonStyles = useCommonStyles();
  const layoutStyles = useLayoutStyles();

  const handleInputWeight = (value: string) => {
    setWeight(Number(value));
  };

  const handleSaveWeight = (weight: number) => {
    const weighIn: IWeighInPost = {
      weight: weight,
    };

    setOpenAddWeightModal(false);
    console.log("weigh in", weighIn);
    onSave(weighIn);
  };

  return (
    <>
      <View></View>
      <CustomModal
        dismissableBackButton
        contentContainerStyle={[styles.modalView, commonStyles.paddingLarge]}
        visible={openAddWeightModal}
        onDismiss={() => setOpenAddWeightModal(false)}
      >
        <Text> הוסף משקל</Text>
        <View style={[layoutStyles.flex1]}>
          <View style={{ flex: 1, gap: 20, justifyContent: "center" }}>
            <View className="  flex-row-reverse items-center justify-between ">
              <Text className=" text-lg  font-bold text-white">משקל:</Text>

              <TextInput
                onChangeText={(val) => handleInputWeight(val)}
                className="inpt  h-10 w-24 ml-2"
                keyboardType="number-pad"
              />
            </View>
          </View>
          <Button style={styles.saveWeightBtn} onPress={handleSaveWeight}>
            <Text className="font-bold text-lg">שמור</Text>
          </Button>
        </View>
      </CustomModal>
    </>
  );
};

export default AddWeightModal;

const styles = StyleSheet.create({
  centeredView: {
    backgroundColor: Colors.dark,
  },

  title: {
    color: Colors.light,
  },
  modalView: {
    borderRadius: 20,
    gap: 12,
    width: "100%",
    height: 200,
  },
  addWeightBtn: {
    width: "100%",
    height: 50,
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },

  saveWeightBtn: {
    backgroundColor: Colors.bgPrimary,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 4,
  },
});
