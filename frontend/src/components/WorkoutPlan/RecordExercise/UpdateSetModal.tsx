import UpdateDataModal, { FieldConfig } from "@/components/ui/modals/UpdateDataModal";
import { useRecordedSetsMutations } from "@/hooks/mutations/useRecordedSetsMutations";
import { useToast } from "@/hooks/useToast";
import { FC, useMemo } from "react";
import { IRecordedSetRes } from "@/interfaces/Workout";
import SetInputSchema from "@/schemas/setSchema";
import { useUserStore } from "@/store/userStore";
import { buildRecordedSetUpdate, hasRecordedSetRir } from "@/utils/recordedSets";

interface UpdateSetModalProps {
  set: IRecordedSetRes;
  exercise: string;
}

const UpdateSetModal: FC<UpdateSetModalProps> = ({ set, exercise }) => {
  const userId = useUserStore((state) => state.currentUser?._id);

  const { triggerSuccessToast } = useToast();
  const { useUpdateRecordedSet: updateRecordedSet, useDeleteRecordedSet: deleteRecordedSet } =
    useRecordedSetsMutations();

  const handleSave = async (vals: Record<string, unknown>) => {
    try {
      const result = buildRecordedSetUpdate(set, vals);

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
      triggerSuccessToast({ message: "הסט נמחק בהצלחה" });
    } catch (e: any) {
      throw e;
    }
  };

  const fields: FieldConfig[] = useMemo(() => {
    const nextFields: FieldConfig[] = [
      {
        key: "weight",
        label: "משקל",
        placeholder: "הכניסו משקל",
        prefix: `סט ${set.setNumber} | משקל`,
        keyboardType: "numeric",
        existingValue: set.weight?.toString() ?? "",
        schemaKey: "weight",
      },
      {
        key: "repsDone",
        label: "חזרות",
        placeholder: "הכניסו חזרות",
        prefix: ` | חזרות`,
        keyboardType: "numeric",
        existingValue: set.repsDone?.toString() ?? "",
        schemaKey: "repsDone",
      },
    ];

    if (hasRecordedSetRir(set)) {
      nextFields.push({
        key: "rir",
        label: "RIR",
        placeholder: "הכניסו RIR",
        prefix: " | RIR",
        keyboardType: "number-pad",
        existingValue: String(set.rir),
        schemaKey: "rir",
      });
    }

    return nextFields;
  }, [set.setNumber, set.repsDone, set.rir, set.weight]);

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
