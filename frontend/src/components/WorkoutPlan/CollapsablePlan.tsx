import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { FC, useState } from "react";
import { ListItem } from "@rneui/themed";
import NativeIcon from "../Icon/NativeIcon";
import { IWorkout } from "../../interfaces/Workout";

interface CollapsableWorkoutPlanProps {
  title: string;
  item: IWorkout[];
}

const CollapsablePlan: FC<CollapsableWorkoutPlanProps> = ({ title, item }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <ListItem.Accordion
      content={
        <ListItem.Title style={{ backgroundColor: "black", color: "white" }}>
          {title}
        </ListItem.Title>
      }
      icon={
        <NativeIcon
          library="MaterialCommunityIcons"
          name="chevron-down"
          color={"white"}
          size={28}
        />
      }
      isExpanded={isExpanded}
      onPress={() => setIsExpanded((isExpanded) => !isExpanded)}
      className="w-screen items-end"
      style={{ backgroundColor: "black" }}
      containerStyle={{ backgroundColor: "black" }}
    >
      <View className="flex-row-reverse w-screen items-center justify-center border-2">
        {item.map((workout, index) => {
          const { name, sets } = workout;
          const totalSets = sets.length;

          return (
            <ListItem containerStyle={{ flexDirection: "row", backgroundColor: "black" }}>
              <TouchableOpacity>
                <NativeIcon
                  library="MaterialCommunityIcons"
                  name="arm-flex"
                  color="rgb(110 231 183)"
                  size={24}
                />
                <View
                  style={{ backgroundColor: "black" }}
                  className="flex-row items-center border-2 w-[33vw] justify-center"
                >
                  {sets.map((set, index) => (
                    <Text className="text-emerald-300">
                      {set.minReps}-{index == totalSets - 1 ? `x${totalSets}` : ""}
                    </Text>
                  ))}
                </View>
              </TouchableOpacity>
            </ListItem>
          );
        })}
      </View>
    </ListItem.Accordion>
  );
};

export default CollapsablePlan;

const styles = StyleSheet.create({});
