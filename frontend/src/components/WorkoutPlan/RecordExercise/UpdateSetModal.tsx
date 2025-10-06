import UpdateDataModal, { FieldConfig } from "@/components/ui/modals/UpdateDataModal";
import { useRecordedSetsMutations } from "@/hooks/mutations/useRecordedSetsMutations";
import { useToast } from "@/hooks/useToast";
import { FC, useMemo } from "react";
import { SetInput } from "./SetInputContainer";
import { IRecordedSetRes } from "@/interfaces/Workout";
import SetInputSchema from "@/schemas/setSchema";
import { useUserStore } from "@/store/userStore";

interface UpdateSetModalProps {
  set: IRecordedSetRes;
  exercise: string;
}

const UpdateSetModal: FC<UpdateSetModalProps> = ({ set, exercise }) => {
  const userId = useUserStore((state) => state.currentUser?._id);

  const { triggerSuccessToast, triggerErrorToast } = useToast();
  const { useUpdateRecordedSet: updateRecordedSet, useDeleteRecordedSet: deleteRecordedSet } =
    useRecordedSetsMutations();

  const handleSave = async (vals: Record<string, unknown>) => {
    try {
      const result: SetInput = {
        setNumber: set.setNumber,
        weight: Number(vals.weight),
        repsDone: Number(vals.repsDone),
      };

      await updateRecordedSet.mutateAsync({ set: result, id: set._id, exercise });
      triggerSuccessToast({ message: "הסט עודכן בהצלחה" });
    } catch (e: any) {
      throw e;
    }
  };

  const handleDeleteSet = async () => {
    if (!userId) return;

    try {
      await deleteRecordedSet.mutateAsync({ exercise, setId: set._id, userId: userId });
    } catch (e: any) {
      throw e;
    }
  };

  const fields: FieldConfig[] = useMemo(
    () => [
      {
        key: "repsDone",
        label: "חזרות",
        placeholder: "הכניסו חזרות",
        prefix: "חזרות",
        keyboardType: "numeric",
        existingValue: set.repsDone?.toString() ?? "",
        schemaKey: "repsDone",
      },
      {
        key: "weight",
        label: "משקל",
        placeholder: "הכניסו משקל",
        prefix: "משקל",
        keyboardType: "numeric",
        existingValue: set.weight?.toString() ?? "",
        schemaKey: "weight",
      },
    ],
    [set._id, set.repsDone, set.weight]
  );

  return (
    <UpdateDataModal
      date={set.date}
      onSave={handleSave}
      onDelete={handleDeleteSet}
      schema={SetInputSchema}
      prefix=""
      fields={fields}
    />
  );
};

export default UpdateSetModal;
