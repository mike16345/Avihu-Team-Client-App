import { View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { ListItem } from "@rneui/themed";
import Icon from "react-native-vector-icons/FontAwesome5";
import NativeIcon from "../Icon/NativeIcon";

export default function CollapsableItem({ meal, title, uiStates, setUiState }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View className="w-full items-start">
      <ListItem.Accordion
        content={
          <>
            <ListItem.Title style={{ backgroundColor: "black", color: "white" }}>
              {title}
            </ListItem.Title>
          </>
        }
        isExpanded={expanded}
        onPress={() => setExpanded(!expanded)}
        className="w-screen items-end"
        style={{ backgroundColor: "black" }}
        containerStyle={{ backgroundColor: "black" }}
      >
        <View className="flex-row-reverse w-screen items-center justify-evenly border-2">
          <ListItem containerStyle={{ backgroundColor: "black" }}>
            <TouchableOpacity onPress={() => setUiState(uiStates.PROTEIN)}>
              <View
                style={{ backgroundColor: "black" }}
                className="flex-row items-center border-2  justify-center"
              >
                <NativeIcon
                  library="FontAwesome5"
                  name="drumstick-bite"
                  color="rgb(110 231 183)"
                  size={24}
                />
                <Text
                  style={{ color: "rgb(110 231 183)" }}
                  className="text-lg pl-2"
                >{`${meal.totalProtein}x`}</Text>
              </View>
            </TouchableOpacity>
          </ListItem>
          <ListItem containerStyle={{ backgroundColor: "black" }}>
            <TouchableOpacity onPress={() => setUiState(uiStates.CARBS)}>
              <View
                style={{ backgroundColor: "black" }}
                className="flex-row items-center border-2  justify-center"
              >
                <NativeIcon
                  library="FontAwesome5"
                  name="bread-slice"
                  color="rgb(110 231 183)"
                  size={24}
                />
                <Text
                  style={{ color: "rgb(110 231 183)" }}
                  className="text-lg pl-2"
                >{`${meal.totalCarbs}x`}</Text>
              </View>
            </TouchableOpacity>
          </ListItem>
          <ListItem containerStyle={{ backgroundColor: "black" }}>
            <TouchableOpacity>
              <View
                style={{ backgroundColor: "black" }}
                className="flex-row items-center border-2 justify-center"
              >
                <NativeIcon
                  library="FontAwesome5"
                  name="carrot"
                  color="rgb(110 231 183)"
                  size={24}
                />
                <Text
                  style={{ color: "rgb(110 231 183)" }}
                  className="text-lg pl-2"
                >{`${meal.totalVeggies}x`}</Text>
              </View>
            </TouchableOpacity>
          </ListItem>
        </View>
      </ListItem.Accordion>
    </View>
  );
}
