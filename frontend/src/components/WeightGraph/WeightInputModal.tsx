import { useWindowDimensions, View } from "react-native";
import React, { FC, useState } from "react";
import { CustomModal } from "../ui/Modal";
import { Button, TextInput, Text } from "react-native-paper";
import useStyles from "@/styles/useGlobalStyles";
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
  const { text, fonts, colors, layout } = useStyles();

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
      <View style={layout.container}>
        <Text style={[fonts.xl, text.textBold, colors.textOnSurfaceVariant]}>הוסף משקל</Text>
        <View style={[layout.justifyBetween, layout.widthFull, layout.flexRow]}>
          <Text style={[text.textBold]}>משקל:</Text>
          <TextInput onChangeText={(val) => handleInputWeight(val)} keyboardType="number-pad" />
          <Button mode="contained" onPress={handleClickSave}>
            <Text style={[text.textBold, fonts.lg]}>שמור</Text>
          </Button>
        </View>
      </View>
    </CustomModal>
  );
};

export default WeightInputModal;
