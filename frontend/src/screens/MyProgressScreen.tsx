import WeightCalendar from "@/components/Calendar/WeightCalendar";
import FABGroup from "@/components/ui/FABGroup";
import { WeightGraph } from "@/components/WeightGraph/WeightGraph";
import WeightInputModal from "@/components/WeightGraph/WeightInputModal";
import { DEFAULT_INITIAL_WEIGHT, DEFAULT_MESSAGE_TO_TRAINER } from "@/constants/Constants";
import useHideTabBarOnScroll from "@/hooks/useHideTabBarOnScroll";
import { useWeighInApi } from "@/hooks/useWeighInApi";
import { IWeighIn, IWeighInPost } from "@/interfaces/User";
import { useUserStore } from "@/store/userStore";
import { useThemeContext } from "@/themes/useAppTheme";
import DateUtils from "@/utils/dateUtils";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, ScrollView, StatusBar, Platform, View, Linking } from "react-native";
import { Portal } from "react-native-paper";

const MyProgressScreen = () => {
  const TRAINER_PHONE_NUMBER = process.env.EXPO_PUBLIC_TRAINER_PHONE_NUMBER;

  const currentUser = useUserStore((state) => state.currentUser);
  const { theme } = useThemeContext();
  const { handleScroll } = useHideTabBarOnScroll();
  const { getWeighInsByUserId, updateWeighInById, addWeighIn } = useWeighInApi();

  const [weighIns, setWeighIns] = useState<IWeighIn[]>([]);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [openWeightModal, setOpenWeightModal] = useState(false);

  const scrollRef = useRef(null);

  const currentWeight = DateUtils.getLatestItem(weighIns, "date")?.weight || DEFAULT_INITIAL_WEIGHT;

  const handleSaveWeighIn = (
    weighIn: IWeighInPost,
    weighInId?: string | null,
    isNew: boolean = true
  ) => {
    setOpenWeightModal(false);

    if (isNew && currentUser) {
      return addWeighIn(currentUser._id, weighIn)
        .then((res) => setWeighIns(res.weighIns))
        .catch((err) => console.log("err", err));
    }
    if (!weighInId) return;

    handleUpdateWeighIn(weighInId, weighIn);
  };

  const handleUpdateWeighIn = async (weighInId: string, weighIn: IWeighInPost) => {
    try {
      const updateResult = await updateWeighInById(weighInId, weighIn);

      setWeighIns((prev) => prev.map((item) => (item._id === weighInId ? updateResult : item)));
    } catch (e) {
      console.error(e);
    }
  };

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
          <WeightCalendar weighIns={weighIns} onSaveWeighIn={handleSaveWeighIn} />
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
              onPress: () => setOpenWeightModal(true),
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
      {openWeightModal && (
        <WeightInputModal
          handleDismiss={() => setOpenWeightModal(false)}
          currentWeight={currentWeight || 0}
          handleSaveWeight={(weight) => handleSaveWeighIn({ weight })}
        />
      )}
    </Portal.Host>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
    marginHorizontal: 10,
  },
  graphContainer: {
    flex: 2,
  },
});

export default MyProgressScreen;
