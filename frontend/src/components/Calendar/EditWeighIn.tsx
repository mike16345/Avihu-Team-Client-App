import { IWeighIn } from "@/interfaces/User";
import { FC } from "react";
import useUpdateWeighIn from "@/hooks/mutations/WeighIns/useUpdateWeighIn";
import useDeleteWeighIn from "@/hooks/mutations/WeighIns/useDeleteWeighIn";
import weighInSchema from "@/schemas/weighInSchema";
import { useToast } from "@/hooks/useToast";
import UpdateDataModal from "../ui/modals/UpdateDataModal";

interface EditWeighInProps {
  date: string;
  weighInToEdit: IWeighIn | undefined;
}

const EditWeighIn: FC<EditWeighInProps> = ({ date, weighInToEdit }) => {
  const { triggerSuccessToast } = useToast();

  const { mutateAsync: updateWeighIn } = useUpdateWeighIn();
  const { mutateAsync: deleteWeighIn } = useDeleteWeighIn();

  const handleUpdateWeighIn = async (value: string) => {
    try {
      await updateWeighIn({
        id: weighInToEdit?._id || "",
        data: { ...weighInToEdit, weight: Number(value) },
      });

      triggerSuccessToast({ title: "הועלה בהצלחה ", message: "ניתן להיות במעקב דרך גרף השקילות" });
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
      onSave={handleUpdateWeighIn}
      onDelete={handleDeleteWeighIn}
    />
  );
};

export default EditWeighIn;
