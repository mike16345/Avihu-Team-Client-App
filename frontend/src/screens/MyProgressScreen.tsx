import React from "react";
import { Dimensions, StyleSheet, ScrollView, StatusBar, Text, Platform } from "react-native";
import { WeightGraph } from "../components/WeightGraph/WeightGraph";

const screenWidth = Dimensions.get("window").width;

const MyProgressScreen = () => {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      <WeightGraph />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "black",
    padding: 20,
    gap: 4,
    paddingTop: StatusBar.currentHeight || 0,
    ...Platform.select({
      ios: {
        paddingTop: 32,
      },
    }),
  },
});

export default MyProgressScreen;
