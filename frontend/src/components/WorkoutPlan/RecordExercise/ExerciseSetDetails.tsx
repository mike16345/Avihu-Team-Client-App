import { Text } from "@/components/ui/Text";
import { ISet } from "@/interfaces/Workout";
import useColors from "@/styles/useColors";
import useCommonStyles from "@/styles/useCommonStyles";
import { useSpacingStyles } from "@/styles/useSpacingStyles";
import { FC, useMemo } from "react";
import { View } from "react-native";

interface ExerciseSetDetailsProps {
  sets: ISet[];
  exerciseMethod?: string;
}

const ExerciseSetDetails: FC<ExerciseSetDetailsProps> = ({ sets, exerciseMethod }) => {
  const { backgroundSurface } = useColors();
  const { pdVerticalXs, pdHorizontalMd } = useSpacingStyles();
  const { roundedSm } = useCommonStyles();

  const details = useMemo(() => {
    let details = "";
    if (!sets || !sets.length) return details;

    // prefer min/max; fall back to reps/targetReps if needed
    const mins = sets.map((s) => [s.minReps].find((v) => Number.isFinite(v)) as number);
    const maxs = sets.map((s) => [s.maxReps, s.minReps].find((v) => Number.isFinite(v)) as number);

    const allEqual = (arr: number[]) => arr.every((v) => v === arr[0]);

    const prefix = exerciseMethod ? `${exerciseMethod}:` : "עבודה: ";
    const countPart = `${sets.length} סטים`;

    // Case 1: all sets same exact reps (e.g., 10)
    if (allEqual(mins) && allEqual(maxs) && mins[0] === maxs[0]) {
      details = `${prefix} ${countPart} ${mins[0]} חזרות`;
    }
    // Case 2: all sets share same min–max range (e.g., 8–12)
    else if (allEqual(mins) && allEqual(maxs)) {
      const includeMax = maxs[0] !== 0;
      const reps = includeMax ? `${mins[0]}–${maxs[0]}` : mins[0];
      details = `${prefix}${countPart} ${reps} חזרות`;
    }
    // Case 3: different per-set (use minReps only, e.g., 8 | 10 | 12 | 14)
    else {
      details = `${prefix} ${mins.join(" | ")}`;
    }

    return details.replace(/\([^)]*[A-Za-z][^)]*\)/g, "").trim();
  }, [sets, exerciseMethod]);

  return (
    <View style={[backgroundSurface, pdVerticalXs, pdHorizontalMd, roundedSm]}>
      <Text fontVariant="semibold" fontSize={16}>
        {details}
      </Text>
    </View>
  );
};

export default ExerciseSetDetails;
