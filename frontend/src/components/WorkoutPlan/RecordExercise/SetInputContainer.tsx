import { FC, useState } from "react";
import { useUserStore } from "@/store/userStore";
import { IExercise, IRecordedSet } from "@/interfaces/Workout";
import TableSetInput from "./TableSetInput";
import WheelSetInput from "./WheelSetInput";

export type SetInput = Omit<IRecordedSet, "plan">;

interface SetInputContainerProps {
  maxSets: number;
  exercise: IExercise;
  sheetHeight: number;
  setNumber: number;
  handleRecordSets: (sets: SetInput[]) => Promise<string | undefined>;
  handleRecordSetsWheel: (sets: SetInput[]) => Promise<number | undefined>;
  handleUpdateSet: (setId: string, set: SetInput) => Promise<unknown>;
  handleDeleteSet: (setId: string) => Promise<boolean>;
}

const SetInputContainer: FC<SetInputContainerProps> = ({
  maxSets,
  exercise,
  sheetHeight,
  setNumber,
  handleRecordSets,
  handleRecordSetsWheel,
  handleUpdateSet,
  handleDeleteSet,
}) => {
  const [style] = useState<"wheel" | "table">(
    () => useUserStore.getState().currentUser?.setInputType ?? "wheel"
  );

  if (style === "wheel") {
    return (
      <WheelSetInput
        sheetHeight={sheetHeight}
        setNumber={setNumber}
        maxSets={maxSets}
        exercise={exercise}
        handleRecordSets={handleRecordSetsWheel}
      />
    );
  }

  return (
    <TableSetInput
      maxSets={maxSets}
      exercise={exercise}
      handleRecordSets={handleRecordSets}
      handleUpdateSet={handleUpdateSet}
      handleDeleteSet={handleDeleteSet}
    />
  );
};

export default SetInputContainer;
