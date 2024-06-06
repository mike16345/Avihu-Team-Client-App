import WeightCalendar from "@/components/Calendar/WeightCalendar";
import { WeightGraph } from "@/components/WeightGraph/WeightGraph";
import { Colors } from "@/constants/Colors";
import useHideTabBarOnScroll from "@/hooks/useHideTabBarOnScroll";
import { useRef } from "react";
import { StyleSheet, ScrollView, StatusBar, Platform, View } from "react-native";

const MyProgressScreen = () => {
  const { handleScroll } = useHideTabBarOnScroll();

  const scrollRef = useRef(null);

  return (
    <ScrollView
      ref={scrollRef}
      onScroll={handleScroll}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
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
    ...Platform.select({
      ios: {
        paddingTop: 40,
      },
      android: {
        paddingTop: StatusBar.currentHeight || 0,
      },
    }),
  },
  calendarContainer: {
    flex: 1,
    marginHorizontal: 12,
    backgroundColor: Colors.bgSecondary,
    borderRadius: 12,
  },
  graphContainer: {
    flex: 2,
  },
});

export default MyProgressScreen;
