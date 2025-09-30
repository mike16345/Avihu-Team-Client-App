import { IWeighIn } from "@/interfaces/User";
import { FC } from "react";
import useUpdateWeighIn from "@/hooks/mutations/WeighIns/useUpdateWeighIn";
import useDeleteWeighIn from "@/hooks/mutations/WeighIns/useDeleteWeighIn";
import weighInSchema from "@/schemas/weighInSchema";
import { useToast } from "@/hooks/useToast";
import UpdateDataModal from "../ui/modals/UpdateDataModal";
import useAddWeighIn from "@/hooks/mutations/WeighIns/useAddWeighIn";

interface EditWeighInProps {
  date: string;
  weighInToEdit: IWeighIn | undefined;
}

const UpdateWeighIn: FC<EditWeighInProps> = ({ date, weighInToEdit }) => {
  const { triggerSuccessToast } = useToast();

  const { mutateAsync: updateWeighIn } = useUpdateWeighIn();
  const { mutateAsync: addWeighIn } = useAddWeighIn();
  const { mutateAsync: deleteWeighIn } = useDeleteWeighIn();

  const isEdit = !!weighInToEdit?._id;

  const handleSaveWeighIn = async (value: string) => {
    try {
      if (isEdit) {
        await updateWeighIn({
          id: weighInToEdit?._id || "",
          data: { ...weighInToEdit, weight: Number(value) },
        });

        triggerSuccessToast({
          title: "הועלה בהצלחה ",
          message: "ניתן להיות במעקב דרך גרף השקילות",
        });
      } else {
        await addWeighIn({ date, weight: Number(value) });
      }
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteWeighIn = async () => {
    try {
      await deleteWeighIn(weighInToEdit?._id || "");
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  return (
    <UpdateDataModal
      date={date}
      label="משקל"
      prefix="משקל"
      existingValue={weighInToEdit?.weight.toString() || undefined}
      placeholder="הכנס משקל"
      schema={weighInSchema}
      schemaKey="weight"
      onSave={handleSaveWeighIn}
      onDelete={handleDeleteWeighIn}
    />
  );
};

export default UpdateWeighIn;
