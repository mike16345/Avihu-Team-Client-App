import WeightCalendar from "@/components/Calendar/WeightCalendar";
import { WeightGraph } from "@/components/WeightGraph/WeightGraph";
import { Colors } from "@/constants/Colors";
import useHideTabBarOnScroll from "@/hooks/useHideTabBarOnScroll";
import { useWeighInApi } from "@/hooks/useWeighInApi";
import { IWeighIn } from "@/interfaces/User";
import { useUserStore } from "@/store/userStore";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, ScrollView, StatusBar, Platform, View } from "react-native";

const MyProgressScreen = () => {
  const { handleScroll } = useHideTabBarOnScroll();
  const { getWeighInsByUserId } = useWeighInApi();

  const currentUser = useUserStore((state) => state.currentUser);
  const [weighIns, setWeighIns] = useState<IWeighIn[]>([]);

  const getUserWeightIns = async () => {
    if (!currentUser) return;

    getWeighInsByUserId(currentUser._id)
      .then((weighIns) => {
        console.log("weigh ins", weighIns);
        setWeighIns(weighIns);
      })
      .catch((err) => console.log(err));
  };

  const scrollRef = useRef(null);

  useEffect(() => {
    getUserWeightIns();
  }, []);

  return (
    <ScrollView
      ref={scrollRef}
      onScroll={handleScroll}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <View style={styles.calendarContainer}>
        <WeightCalendar weighIns={weighIns} />
      </View>
      <View style={styles.graphContainer}>
        <WeightGraph weighIns={weighIns} />
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
