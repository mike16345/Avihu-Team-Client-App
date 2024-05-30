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
      className="items-end"
      style={{ backgroundColor: "black" }}
      containerStyle={{ backgroundColor: "black" }}
    >
      <View className="items-end">
        {item.map((workout, index) => {
          const { name, sets } = workout;
          const totalSets = sets.length;

          return (
            <View key={index} className="flex-row items-center p-2">
              <ListItem
                containerStyle={{
                  backgroundColor: "black",
                  padding: 16,
                }}
              >
                <TouchableOpacity
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-evenly",
                  }}
                >
                  <View style={{ flexDirection: "row", backgroundColor: "black" }}>
                    {sets.map((set, index) => (
                      <Text className="text-emerald-300">
                        {set.minReps}-{index == totalSets - 1 ? `x${totalSets}` : ""}
                      </Text>
                    ))}
                  </View>
                  <NativeIcon
                    library="MaterialCommunityIcons"
                    name="arm-flex"
                    color="rgb(110 231 183)"
                    size={24}
                  />
                </TouchableOpacity>
              </ListItem>
              <Text className="underline" style={{ color: "white", fontWeight: 600 }}>
                {name}:
              </Text>
            </View>
          );
        })}
      </View>
    </ListItem.Accordion>
  );
};

export default CollapsablePlan;
