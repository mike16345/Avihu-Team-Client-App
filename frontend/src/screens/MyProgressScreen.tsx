import WeightCalendar from "@/components/Calendar/WeightCalendar";
import { WeightGraph } from "@/components/WeightGraph/WeightGraph";
import { Colors } from "@/constants/Colors";
import { StyleSheet, ScrollView, StatusBar, Platform, View } from "react-native";

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
    gap: 12,
    paddingTop: StatusBar.currentHeight || 0,
    ...Platform.select({
      ios: {
        paddingTop: 32,
      },
    }),
  },
  calendarContainer: {
    flex: 1,
    backgroundColor: Colors.bgSecondary,
    borderRadius: 12,
  },
  graphContainer: {
    flex: 2,
  },
});

export default MyProgressScreen;
