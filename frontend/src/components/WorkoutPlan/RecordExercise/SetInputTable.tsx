import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, StyleSheet, Pressable, TextInput } from "react-native";
import Animated, { FadeInDown, FadeOutUp, LinearTransition } from "react-native-reanimated";
import { Swipeable } from "react-native-gesture-handler";

import { Text } from "@/components/ui/Text";
import Icon from "@/components/Icon/Icon";
import SpinningIcon from "@/components/ui/loaders/SpinningIcon";
import { useThemeContext } from "@/themes/useAppTheme";
import { IExercise } from "@/interfaces/Workout";
import { useGetLastRecordedSetForSetNumber } from "@/hooks/queries/RecordedSets/useLastRecordedSetQuery";
import useRecordedSetsQuery from "@/hooks/queries/RecordedSets/useRecordedSetsQuery";

import { SetInput } from "./SetInputContainer";
import {
  buildRowsFromServer,
  collectTodaySets,
  emptyRow,
  findTodaySetId,
  getLatestDeletableRowIndex,
  getPlannedReps,
  RowState,
} from "./setInputTableUtils";

const HEADER_LABELS = ["סט", "ק״ג", "חזרות", "רזרבה"] as const;

interface SetInputTableProps {
  exercise: IExercise;
  maxSets: number;
  onSaveSet: (set: SetInput) => Promise<string | undefined>;
  onUpdateSet: (setId: string, set: SetInput) => Promise<unknown>;
  onDeleteSet: (setId: string) => Promise<boolean>;
}

const SetInputTable: FC<SetInputTableProps> = ({
  exercise,
  maxSets,
  onSaveSet,
  onUpdateSet,
  onDeleteSet,
}) => {
  const { theme } = useThemeContext();
  const { data: recordedSetsData } = useRecordedSetsQuery();

  const todaySets = useMemo(
    () => collectTodaySets(recordedSetsData, exercise.exerciseId.name),
    [recordedSetsData, exercise.exerciseId.name]
  );

  const [rows, setRows] = useState<RowState[]>(() => buildRowsFromServer(todaySets, maxSets));
  const [deletingRowIndex, setDeletingRowIndex] = useState<number | null>(null);
  const latestDeletableRowIndex = useMemo(() => getLatestDeletableRowIndex(rows), [rows]);

  const hydratedRef = useRef(false);
  const deletingRowIndexRef = useRef<number | null>(null);

  useEffect(() => {
    if (hydratedRef.current) return;
    if (!recordedSetsData) return;
    hydratedRef.current = true;
    setRows(buildRowsFromServer(todaySets, maxSets));
  }, [recordedSetsData, todaySets, maxSets]);

  const updateField = useCallback(
    (index: number, field: "weight" | "reps" | "rir", value: string) => {
      setRows((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], [field]: value.replace(/[^0-9.]/g, "") };
        return next;
      });
    },
    []
  );

  const handleAddSet = useCallback(() => {
    setRows((prev) => {
      const last = prev[prev.length - 1];
      const nextRow: RowState = {
        setNumber: last.setNumber + 1,
        weight: "",
        reps: "",
        rir: "",
        completed: false,
        saving: false,
      };
      return [...prev, nextRow];
    });
  }, []);

  const handleDeleteRow = useCallback(
    async (index: number) => {
      if (deletingRowIndexRef.current !== null) return;
      if (index !== getLatestDeletableRowIndex(rows)) return;

      const row = rows[index];
      if (!row.savedSetId) return;

      deletingRowIndexRef.current = index;
      setDeletingRowIndex(index);

      try {
        const success = await onDeleteSet(row.savedSetId);
        if (!success) return;

        setRows((prev) => {
          const remaining = prev.filter((_, i) => i !== index);
          if (remaining.length === 0) {
            return [emptyRow(1)];
          }
          return remaining.map((r, i) => ({ ...r, setNumber: i + 1 }));
        });
      } finally {
        deletingRowIndexRef.current = null;
        setDeletingRowIndex(null);
      }
    },
    [rows, onDeleteSet]
  );

  const handleTapCheck = useCallback(
    async (index: number) => {
      const row = rows[index];
      if (row.saving) return;

      if (row.completed) {
        setRows((prev) => {
          const next = [...prev];
          next[index] = { ...next[index], completed: false };
          return next;
        });
        return;
      }

      const fallbackReps = getPlannedReps(exercise, row.setNumber);
      const weightNumber = Number(row.weight) || 0;
      const repsNumber = Number(row.reps) || fallbackReps;
      if (weightNumber <= 0 || repsNumber <= 0) return;

      setRows((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], saving: true };
        return next;
      });

      try {
        const rirValue = row.rir.trim();
        const rirNumber = rirValue === "" ? undefined : Number(rirValue);
        const setPayload: SetInput = {
          setNumber: row.setNumber,
          weight: weightNumber,
          repsDone: repsNumber,
          ...(rirNumber !== undefined && !Number.isNaN(rirNumber) ? { rir: rirNumber } : {}),
        };
        const existingId =
          row.savedSetId ??
          findTodaySetId(recordedSetsData, exercise.exerciseId.name, row.setNumber);
        let nextSavedSetId = existingId;
        if (existingId) {
          await onUpdateSet(existingId, setPayload);
        } else {
          const returnedSetId = await onSaveSet(setPayload);
          if (returnedSetId) nextSavedSetId = returnedSetId;
        }
        setRows((prev) => {
          const next = [...prev];
          next[index] = {
            ...next[index],
            weight: String(weightNumber),
            reps: String(repsNumber),
            rir: rirNumber !== undefined && !Number.isNaN(rirNumber) ? String(rirNumber) : "",
            completed: true,
            saving: false,
            savedSetId: nextSavedSetId,
          };
          return next;
        });
      } catch (e: any) {
        console.log("Error saving/updating set at index:", index, "Row data:", row, "Error:", e);
        setRows((prev) => {
          const next = [...prev];
          next[index] = { ...next[index], saving: false };
          return next;
        });
      }
    },
    [rows, onSaveSet, onUpdateSet, exercise, recordedSetsData]
  );

  return (
    <View style={styles.container}>
      <View style={[styles.headerRow, { borderBottomColor: theme.colors.outline }]}>
        {HEADER_LABELS.map((label) => (
          <Cell key={label}>
            <Text
              fontVariant="semibold"
              style={[styles.headerLabel, { color: theme.colors.primary }]}
            >
              {label}
            </Text>
          </Cell>
        ))}
        <Cell>
          <Icon name="check" width={16} height={16} color={theme.colors.primary} />
        </Cell>
      </View>

      {rows.map((row, index) => (
        <SetRow
          key={row.setNumber + "-" + index}
          row={row}
          index={index}
          canDelete={index === latestDeletableRowIndex}
          isDeleting={index === deletingRowIndex}
          exercise={exercise}
          onChangeField={updateField}
          onTapCheck={handleTapCheck}
          onDelete={handleDeleteRow}
        />
      ))}

      <Pressable
        onPress={handleAddSet}
        style={({ pressed }) => [
          styles.addButton,
          {
            backgroundColor: theme.colors.secondary,
            borderColor: theme.colors.outline,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <Text fontVariant="semibold" style={{ color: theme.colors.primary, fontSize: 15 }}>
          + הוסף סט
        </Text>
      </Pressable>
    </View>
  );
};

const SetRow: FC<{
  row: RowState;
  index: number;
  canDelete: boolean;
  isDeleting: boolean;
  exercise: IExercise;
  onChangeField: (index: number, field: "weight" | "reps" | "rir", value: string) => void;
  onTapCheck: (index: number) => void;
  onDelete: (index: number) => void;
}> = ({
  row,
  index,
  canDelete,
  isDeleting,
  exercise,
  onChangeField,
  onTapCheck,
  onDelete,
}) => {
  const { theme } = useThemeContext();
  const previous = useGetLastRecordedSetForSetNumber(exercise.exerciseId.name, row.setNumber - 1);

  const weightPlaceholder = previous ? String(previous.weight) : "0";
  const repsPlaceholder = previous
    ? String(previous.repsDone)
    : String(getPlannedReps(exercise, row.setNumber));

  const rowBackground = row.completed ? theme.colors.successContainer : theme.colors.surface;
  const inputColor = row.completed ? theme.colors.onSuccess : theme.colors.primary;
  const setNumberColor = row.completed ? theme.colors.onSuccess : theme.colors.primary;

  const renderDeleteAction = () => (
    <Pressable
      onPress={() => onDelete(index)}
      disabled={isDeleting}
      style={({ pressed }) => [
        styles.deleteAction,
        { opacity: isDeleting ? 0.7 : pressed ? 0.5 : 1 },
      ]}
    >
      {isDeleting ? (
        <SpinningIcon mode="light" />
      ) : (
        <Icon name="trash" width={22} height={22} color={theme.colors.error} />
      )}
    </Pressable>
  );

  return (
    <Swipeable
      renderLeftActions={canDelete ? renderDeleteAction : undefined}
      overshootLeft={false}
      friction={2}
    >
      <Animated.View
        entering={FadeInDown.duration(160)}
        exiting={FadeOutUp.duration(140)}
        layout={LinearTransition.duration(200)}
        style={[
          styles.row,
          { borderBottomColor: theme.colors.outline, backgroundColor: rowBackground },
        ]}
      >
        <Cell>
          <Text fontVariant="semibold" style={{ color: setNumberColor, fontSize: 16 }}>
            {String(row.setNumber)}
          </Text>
        </Cell>

        <Cell>
          <TextInput
            value={row.weight}
            onChangeText={(v) => onChangeField(index, "weight", v)}
            editable={!row.completed}
            keyboardType="decimal-pad"
            placeholder={weightPlaceholder}
            placeholderTextColor={theme.colors.onSurfaceVariant + "80"}
            style={[styles.input, { color: inputColor }]}
          />
        </Cell>

        <Cell>
          <TextInput
            value={row.reps}
            onChangeText={(v) => onChangeField(index, "reps", v)}
            editable={!row.completed}
            keyboardType="number-pad"
            placeholder={repsPlaceholder}
            placeholderTextColor={theme.colors.onSurfaceVariant + "80"}
            style={[styles.input, { color: inputColor }]}
          />
        </Cell>

        <Cell>
          <TextInput
            value={row.rir}
            onChangeText={(v) => onChangeField(index, "rir", v)}
            editable={!row.completed}
            keyboardType="number-pad"
            placeholder="—"
            placeholderTextColor={theme.colors.onSurfaceVariant + "80"}
            maxLength={2}
            style={[styles.input, { color: inputColor }]}
          />
        </Cell>

        <Cell>
          <Pressable
            onPress={() => onTapCheck(index)}
            disabled={row.saving}
            style={({ pressed }) => [
              styles.checkButton,
              {
                backgroundColor: row.completed
                  ? theme.colors.successContainer
                  : theme.colors.secondary,
                borderColor: row.completed ? theme.colors.success : theme.colors.outline,
                opacity: row.saving ? 0.5 : pressed ? 0.7 : 1,
              },
            ]}
          >
            <Icon
              name="check"
              width={15}
              height={15}
              color={row.completed ? theme.colors.onSuccess : theme.colors.primary}
            />
          </Pressable>
        </Cell>
      </Animated.View>
    </Swipeable>
  );
};

const Cell: FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={styles.cell}>{children}</View>
);

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 4,
  },
  headerRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
  },
  headerLabel: {
    fontSize: 13,
    letterSpacing: 0.4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderRadius: 8,
  },
  cell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    textAlign: "center",
    fontSize: 20,
    fontFamily: "Assistant-SemiBold",
    minWidth: 40,
    paddingVertical: 0,
  },
  checkButton: {
    width: 30,
    height: 30,
    borderRadius: 7,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  addButton: {
    marginTop: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteAction: {
    width: 72,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginVertical: 2,
  },
});

export default SetInputTable;
