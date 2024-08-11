import WeightCalendar from "@/components/Calendar/WeightCalendar";
import FABGroup from "@/components/ui/FABGroup";
import { WeightGraph } from "@/components/WeightGraph/WeightGraph";
import { Colors } from "@/constants/Colors";
import { DEFAULT_MESSAGE_TO_TRAINER } from "@/constants/Constants";
import useHideTabBarOnScroll from "@/hooks/useHideTabBarOnScroll";
import { useWeighInApi } from "@/hooks/useWeighInApi";
import { IWeighIn } from "@/interfaces/User";
import { useUserStore } from "@/store/userStore";
import { useThemeContext } from "@/themes/useAppTheme";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, ScrollView, StatusBar, Platform, View, Linking } from "react-native";
import { Portal } from "react-native-paper";

const MyProgressScreen = () => {
  const TRAINER_PHONE_NUMBER = process.env.EXPO_PUBLIC_TRAINER_PHONE_NUMBER;

  const currentUser = useUserStore((state) => state.currentUser);
  const { theme } = useThemeContext();
  const { handleScroll } = useHideTabBarOnScroll();
  const { getWeighInsByUserId } = useWeighInApi();

  const [weighIns, setWeighIns] = useState<IWeighIn[]>([]);
  const [isFabOpen, setIsFabOpen] = useState(false);

  const scrollRef = useRef(null);

  const getUserWeightIns = async () => {
    if (!currentUser) return;

    getWeighInsByUserId(currentUser._id)
      .then((weighIns) => {
        setWeighIns(weighIns);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    getUserWeightIns();
  }, []);

  return (
    <Portal.Host>
      <ScrollView
        ref={scrollRef}
        onScroll={handleScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ ...styles.container, backgroundColor: theme.colors.background }}
      >
        <View style={styles.calendarContainer}>
          <WeightCalendar weighIns={weighIns} />
        </View>
        <View style={styles.graphContainer}>
          <WeightGraph weighIns={weighIns} />
        </View>
        <FABGroup
          icon="plus"
          visible
          onStateChange={({ open }) => {
            setIsFabOpen(open);
          }}
          variant="primary"
          open={isFabOpen}
          actions={[
            {
              icon: "plus",
              onPress: () => console.log("pressed add weight"),
              label: "Add Weight",
            },
            {
              icon: "camera",
              onPress: () => console.log("Open camera to take weigh in photo"),
              label: "Add Photo",
            },
            {
              icon: "whatsapp",
              onPress: () =>
                Linking.openURL(
                  `whatsapp://send?phone=${TRAINER_PHONE_NUMBER}&text=${DEFAULT_MESSAGE_TO_TRAINER}`
                ),
              label: "Message Avihu",
            },
          ]}
        />
      </ScrollView>
    </Portal.Host>
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
