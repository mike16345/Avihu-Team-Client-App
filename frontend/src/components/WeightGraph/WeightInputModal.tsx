import { useWindowDimensions, View } from "react-native";
import React, { FC, useState } from "react";
import { CustomModal } from "../ui/Modal";
import { Button, TextInput, Text } from "react-native-paper";
import useGlobalStyles from "@/styles/useGlobalStyles";
import { useThemeContext } from "@/themes/useAppTheme";

interface WeightInputModalProps {
  openAddWeightModal: boolean;
  setOpenAddWeightModal: React.Dispatch<React.SetStateAction<boolean>>;
  handleSaveWeight: (weight: number) => void;
}

const WeightInputModal: FC<WeightInputModalProps> = ({
  handleSaveWeight,
  openAddWeightModal,
  setOpenAddWeightModal,
}) => {
  const { width } = useWindowDimensions();
  const { theme } = useThemeContext();
  const [weight, setWeight] = useState(0);
  const globalStyles = useGlobalStyles();

  const handleInputWeight = (value: string) => {
    setWeight(Number(value));
  };

  const handleClickSave = () => {
    setOpenAddWeightModal(false);
    handleSaveWeight(weight);
  };

  const modalBgColor = theme.colors.surface;

  return (
    <CustomModal
      dismissableBackButton
      contentContainerStyle={{
        borderRadius: theme.roundness,
        marginHorizontal: "auto",
        width: width - 40,
        backgroundColor: modalBgColor,
      }}
      visible={openAddWeightModal}
      onDismiss={() => setOpenAddWeightModal(false)}
    >
      <View style={globalStyles.container}>
        <Text
          style={[globalStyles.xl, globalStyles.textBold, { color: theme.colors.onSurfaceVariant }]}
        >
          הוסף משקל
        </Text>
        <View
          style={[globalStyles.justifyContentBetween, globalStyles.fullWidth, globalStyles.flexRow]}
        >
          <Text style={[globalStyles.textBold]}>משקל:</Text>
          <TextInput onChangeText={(val) => handleInputWeight(val)} keyboardType="number-pad" />
          <Button mode="contained" onPress={handleClickSave}>
            <Text style={[globalStyles.textBold, globalStyles.lg]}>שמור</Text>
          </Button>
        </View>
      </View>
    </CustomModal>
  );
};

export default WeightInputModal;
