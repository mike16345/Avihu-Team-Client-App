import useStyles from "@/styles/useGlobalStyles";
import DateUtils from "@/utils/dateUtils";
import { View, TouchableOpacity, useWindowDimensions } from "react-native";
import PrimaryButton from "../ui/buttons/PrimaryButton";
import { Text } from "../ui/Text";
import { IWeighIn } from "@/interfaces/User";
import { FC, useState } from "react";
import Icon from "../Icon/Icon";
import Input from "../ui/inputs/Input";
import useUpdateWeighIn from "@/hooks/mutations/WeighIns/useUpdateWeighIn";
import useDeleteWeighIn from "@/hooks/mutations/WeighIns/useDeleteWeighIn";

interface EditWeighInProps {
  date: string;
  weighInToEdit: IWeighIn | undefined;
  handleDismissModal: () => void;
}

const EditWeighIn: FC<EditWeighInProps> = ({ date, weighInToEdit, handleDismissModal }) => {
  const { width } = useWindowDimensions();
  const { text, spacing, layout } = useStyles();

  const { mutate: updateWeighIn } = useUpdateWeighIn();
  const { mutate: deleteWeighIn } = useDeleteWeighIn();

  const [weighIn, setWeighIn] = useState<string | undefined>(String(weighInToEdit?.weight));

  return (
    <View style={[layout.widthFull, layout.center, spacing.gapMd]}>
      <Text fontSize={16}>{DateUtils.formatDate(date!, "DD.MM.YYYY")}</Text>
      <Text fontSize={16}>
        משקל <Text style={[text.textUnderline]}>{weighIn ? weighIn : "_"}</Text>
      </Text>

      <View style={[spacing.gapLg, layout.center]}>
        <Input
          value={weighIn}
          onChangeText={setWeighIn}
          keyboardType="number-pad"
          label="משקל"
          style={[{ width: width * 0.75 }]}
          placeholder="הכנס משקל"
        />
        <View style={[spacing.gapMd, { width: width * 0.5 }]}>
          <PrimaryButton
            onPress={() => {
              updateWeighIn({
                id: weighInToEdit?._id || "",
                data: { ...weighInToEdit, weight: Number(weighIn) },
              });
              handleDismissModal();
            }}
            block
          >
            עדכון
          </PrimaryButton>
          <PrimaryButton onPress={() => handleDismissModal()} mode="light" block>
            ביטול
          </PrimaryButton>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => {
          deleteWeighIn(weighInToEdit?._id || "");
          handleDismissModal();
        }}
      >
        <Icon name="trash" />
      </TouchableOpacity>
    </View>
  );
};

export default EditWeighIn;
