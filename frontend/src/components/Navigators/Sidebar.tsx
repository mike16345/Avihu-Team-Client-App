import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { HomePage } from "../../screens/HomePage";
import TopBar from "./TopBar";
const Drawer = createDrawerNavigator();

const Sidebar = () => {
  return (
    <Drawer.Navigator
      screenOptions={{
        header: (props) => <TopBar />,
        drawerPosition: "right",
      }}
      initialRouteName="Home"
    >
      <Drawer.Screen name="Home" component={HomePage} />
    </Drawer.Navigator>
  );
};

export default Sidebar;

const styles = StyleSheet.create({});
