import useStyles from "@/styles/useGlobalStyles";
import DateUtils from "@/utils/dateUtils";
import { View, TouchableOpacity, useWindowDimensions, Keyboard } from "react-native";
import PrimaryButton from "../ui/buttons/PrimaryButton";
import { Text } from "../ui/Text";
import { IWeighIn } from "@/interfaces/User";
import { FC, useState } from "react";
import Icon from "../Icon/Icon";
import Input from "../ui/inputs/Input";
import useUpdateWeighIn from "@/hooks/mutations/WeighIns/useUpdateWeighIn";
import useDeleteWeighIn from "@/hooks/mutations/WeighIns/useDeleteWeighIn";
import weighInSchema from "@/schemas/weighInSchema";
import { useToast } from "@/hooks/useToast";

interface EditWeighInProps {
  date: string;
  weighInToEdit: IWeighIn | undefined;
  handleDismissModal: () => void;
}

const EditWeighIn: FC<EditWeighInProps> = ({ date, weighInToEdit, handleDismissModal }) => {
  const { width } = useWindowDimensions();
  const { text, spacing, layout } = useStyles();
  const { triggerErrorToast, triggerSuccessToast } = useToast();

  const { mutateAsync: updateWeighIn, isPending: isUpdating } = useUpdateWeighIn();
  const { mutateAsync: deleteWeighIn, isPending: isDeleting } = useDeleteWeighIn();

  const [weighIn, setWeighIn] = useState<string | undefined>(String(weighInToEdit?.weight));
  const [error, setError] = useState<string | null>(null);

  const isButtonDisabled = isDeleting || isUpdating;

  const handleUpdateWeighIn = async () => {
    const parsed = Number(weighIn);

    const result = weighInSchema.safeParse({
      weight: parsed,
    });

    if (!result.success) {
      const message = result.error.errors[0]?.message ?? "שגיאה לא ידועה";

      triggerErrorToast({ message });
      setError(message);
      handleDeleteWeighIn;
      return;
    }
    Keyboard.dismiss();
    await updateWeighIn({
      id: weighInToEdit?._id || "",
      data: { ...weighInToEdit, weight: Number(weighIn) },
    });

    triggerSuccessToast({ title: "הועלה בהצלחה ", message: "ניתן להיות במעקב דרך גרף השקילות" });

    handleDismissModal();
  };

  const handleDeleteWeighIn = async () => {
    try {
      await deleteWeighIn(weighInToEdit?._id || "");
      handleDismissModal();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={[layout.widthFull, layout.center, spacing.gapMd]}>
      <Text fontSize={16}>{DateUtils.formatDate(date!, "DD.MM.YYYY")}</Text>
      <Text fontSize={16}>
        משקל <Text style={[text.textUnderline]}>{weighIn ? weighIn : "_"}</Text>
      </Text>

      <View style={[spacing.gapLg, layout.center]}>
        <Input
          value={weighIn}
          error={!!error}
          onChangeText={setWeighIn}
          keyboardType="number-pad"
          label="משקל"
          style={[{ width: width * 0.75 }]}
          placeholder="הכנס משקל"
        />
        <View style={[spacing.gapMd, { width: width * 0.5 }]}>
          <PrimaryButton
            loading={isUpdating}
            disabled={isButtonDisabled}
            onPress={handleUpdateWeighIn}
            block
          >
            עדכון
          </PrimaryButton>
          <PrimaryButton
            disabled={isButtonDisabled}
            onPress={() => handleDismissModal()}
            mode="light"
            block
          >
            ביטול
          </PrimaryButton>
        </View>
      </View>
      <TouchableOpacity disabled={isButtonDisabled} onPress={handleDeleteWeighIn}>
        <Icon name="trash" />
      </TouchableOpacity>
    </View>
  );
};

export default EditWeighIn;
