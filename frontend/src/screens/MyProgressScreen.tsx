import { StyleSheet, ScrollView, StatusBar, Platform, View } from "react-native";
import { WeightGraph } from "@/components/WeightGraph/WeightGraph";
import WeightCalendar from "@/components/Calendar/WeightCalendar";

const MyProgressScreen = () => {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      <View style={styles.calendarContainer}>
        <WeightCalendar />
      </View>
      <View style={styles.graphContainer}>
        <WeightGraph />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
  calendarContainer: {
    flex: 1,
    marginBottom: 20,
  },
  graphContainer: {
    flex: 1,
  },
});

export default MyProgressScreen;
