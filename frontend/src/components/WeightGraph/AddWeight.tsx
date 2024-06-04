import { StyleSheet, Text, View, TouchableHighlight, TextInput } from "react-native";
import { FC, useState } from "react";
import Button from "@/components/Button/Button";
import { Colors } from "@/constants/Colors";
import { ButtonGroup, Dialog } from "react-native-elements";
import { IWeighIn } from "@/interfaces/User";
import type { WeightUnit } from "@/types/weightTypes";

interface AddWeightProps {
  onSave: (newWeighIn: IWeighIn) => void;
}

const AddWeightModal: FC<AddWeightProps> = ({ onSave }) => {
  const [openAddWeightModal, setOpenAddWeightModal] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [weight, setWeight] = useState(0);
  const [weightType, setWeightType] = useState<WeightUnit>("kgs");

  const handleInputWeight = (value: string) => {
    setWeight(Number(value));
  };

  const handleSaveWeight = () => {
    const weighIn: IWeighIn = {
      date: new Date(),
      weight: weight,
      weightUnit: weightType,
    };

    setOpenAddWeightModal(false);
    onSave(weighIn);
  };

  return (
    <View>
      <Dialog
        animationType="slide"
        overlayStyle={styles.centeredView}
        transparent={true}
        backdropStyle={{ backgroundColor: "rgba(0, 0 , 0, 0.5)" }}
        onBackdropPress={() => setOpenAddWeightModal(false)}
        isVisible={openAddWeightModal}
        statusBarTranslucent
        onRequestClose={() => {
          setOpenAddWeightModal((open) => !open);
        }}
      >
        <Dialog.Title titleStyle={styles.title} title="הוסף משקל" />
        <View style={styles.modalView}>
          <View style={{ flex: 1, gap: 20, justifyContent: "center" }}>
            <View className="  flex-row-reverse items-center justify-between ">
              <Text className=" text-lg  font-bold text-white">משקל:</Text>
              <TextInput
                onChangeText={(val) => handleInputWeight(val)}
                className="inpt  h-10 w-24 ml-2"
                keyboardType="number-pad"
              />
            </View>
            <View className="flex-row-reverse items-center justify-between ">
              <Text className=" text-lg  font-bold text-white">סוג:</Text>
              <ButtonGroup
                buttons={["Kg", "lb"]}
                selectedIndex={selectedIndex}
                onPress={(value) => {
                  setSelectedIndex(value);
                  setWeightType(value == 0 ? "kgs" : "lbs");
                }}
                containerStyle={{ width: 90, height: 30 }}
              />
            </View>
          </View>
          <Button style={styles.saveWeightBtn} onPress={handleSaveWeight}>
            <Text className="font-bold text-lg">שמור</Text>
          </Button>
        </View>
      </Dialog>
      <View className="w-screen px-2 ">
        <TouchableHighlight
          onPress={() => setOpenAddWeightModal((open) => !open)}
          style={styles.addWeightBtn}
        >
          <Text className="font-bold text-lg">הוסף משקל</Text>
        </TouchableHighlight>
      </View>
    </View>
  );
};

export default AddWeightModal;

const styles = StyleSheet.create({
  centeredView: {
    backgroundColor: Colors.dark,
  },
  modalView: {
    borderRadius: 20,
    gap: 12,
    width: "100%",
    height: 200,
  },
  title: {
    color: Colors.light,
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
