import WorkoutGraph from "@/components/WorkoutProgression/WorkoutGraph";
import useStyles from "@/styles/useGlobalStyles";
import { extractExercises } from "@/utils/utils";
import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import DropDownPicker, { ValueType } from "react-native-dropdown-picker";

const fakeData = [
  {
    muscleGroup: "חזה",
    recordedSets: {
      "לחיצת חזה": [
        {
          weight: 80,
          repsDone: 12,
          date: new Date("2025-01-01"),
        },
        {
          weight: 85,
          repsDone: 10,
          date: new Date("2025-01-1"),
        },
        {
          weight: 88,
          repsDone: 9,
          date: new Date("2025-01-5"),
        },
        {
          weight: 92,
          repsDone: 8,
          date: new Date("2025-01-5"),
        },
      ],
      "לחיצת חזה בשיפוע חיובי": [
        {
          weight: 40,
          repsDone: 15,
          date: new Date("2025-01-02"),
        },
        {
          weight: 45,
          repsDone: 12,
          date: new Date("2025-01-02"),
        },
      ],
    },
  },
  {
    muscleGroup: "גב",
    recordedSets: {
      מתח: [
        {
          weight: 0,
          repsDone: 10,
          date: new Date("2025-01-03"),
        },
        {
          weight: 0,
          repsDone: 8,
          date: new Date("2025-01-03"),
        },
      ],
      "חתירה עם מוט": [
        {
          weight: 60,
          repsDone: 12,
          date: new Date("2025-01-04"),
        },
        {
          weight: 65,
          repsDone: 10,
          date: new Date("2025-01-04"),
        },
      ],
    },
  },
];

const MyWorkoutProgressionScreen = () => {
  const { colors, common, fonts, layout, spacing, text } = useStyles();

  const [openMuscleGroupDropdown, setOpenMuscleGroupDropdown] = useState(false);
  const [openExerciseDropdown, setOpenExerciseDropdown] = useState(false);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<ValueType>(
    fakeData[0].muscleGroup
  );
  const [selectedExercise, setSelectedExercise] = useState<ValueType>(
    extractExercises(fakeData[0].recordedSets)[0]
  );

  const muscleGroupOptions = fakeData.map(({ muscleGroup }) => ({
    label: muscleGroup,
    value: muscleGroup,
  }));

  const exerciseOptions = fakeData
    .filter((item) => item.muscleGroup === selectedMuscleGroup) // Filter by muscleGroup
    .flatMap((item) => extractExercises(item.recordedSets))
    .map((item) => ({ label: item, value: item }));

  const repValues = fakeData
    .filter((item) => item.muscleGroup === selectedMuscleGroup)
    .flatMap((item) => item.recordedSets[selectedExercise])
    .flatMap((item) => item.repsDone);

  const weightValues = fakeData
    .filter((item) => item.muscleGroup === selectedMuscleGroup)
    .flatMap((item) => item.recordedSets[selectedExercise])
    .flatMap((item) => item.weight);

  const dateValues = fakeData
    .filter((item) => item.muscleGroup === selectedMuscleGroup)
    .flatMap((item) => item.recordedSets[selectedExercise])
    .map((item) =>
      new Date(item.date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      })
    );

  console.log(dateValues);

  const dropDownsArr = [
    {
      value: selectedMuscleGroup,
      setValue: setSelectedMuscleGroup,
      open: openMuscleGroupDropdown,
      setOpen: setOpenMuscleGroupDropdown,
      placeholder: `בחר קבוצת שריר`,
      items: muscleGroupOptions,
    },
    {
      value: selectedExercise,
      setValue: setSelectedExercise,
      open: openExerciseDropdown,
      setOpen: setOpenExerciseDropdown,
      placeholder: `בחר תרגיל`,
      items: exerciseOptions,
    },
  ];

  return (
    <View style={[layout.sizeFull, colors.background, spacing.gapDefault, spacing.pdDefault]}>
      {dropDownsArr.map(({ placeholder, setOpen, setValue, open, value, items }, i) => (
        <DropDownPicker
          key={i}
          items={items}
          value={value}
          setValue={setValue}
          style={[colors.backgroundSecondaryContainer]}
          listItemContainerStyle={[colors.backgroundSecondaryContainer, { zIndex: 100 }]}
          placeholder={placeholder}
          placeholderStyle={text.textRight}
          theme="DARK"
          rtl
          open={open}
          setOpen={setOpen}
          labelStyle={text.textRight}
          listItemLabelStyle={[text.textRight, { zIndex: 100 }]}
        />
      ))}
      <ScrollView contentContainerStyle={[spacing.gapDefault]}>
        <WorkoutGraph label="חזרות" values={repValues} dates={dateValues} />
        <WorkoutGraph label="משקל" values={weightValues} dates={dateValues} />
      </ScrollView>
    </View>
  );
};

export default MyWorkoutProgressionScreen;
