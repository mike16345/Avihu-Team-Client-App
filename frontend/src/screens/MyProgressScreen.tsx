import WeightCalendar from "@/components/Calendar/WeightCalendar";
import FABGroup from "@/components/ui/FABGroup";
import ProgressScreenSkeleton from "@/components/ui/loaders/skeletons/ProgressScreenSkeleton";
import { WeightGraph } from "@/components/WeightGraph/WeightGraph";
import WeightInputModal from "@/components/WeightGraph/WeightInputModal";
import { DEFAULT_INITIAL_WEIGHT, DEFAULT_MESSAGE_TO_TRAINER } from "@/constants/Constants";
import { useWeighInApi } from "@/hooks/useWeighInApi";
import { IWeighIn, IWeighInPost } from "@/interfaces/User";
import { useUserStore } from "@/store/userStore";
import useStyles from "@/styles/useGlobalStyles";
import useSlideFadeIn from "@/styles/useSlideFadeIn";
import useSlideInAnimations from "@/styles/useSlideInAnimations";
import DateUtils from "@/utils/dateUtils";
import { useEffect, useState } from "react";
import { StyleSheet, ScrollView, View, Linking, Animated } from "react-native";
import { Portal } from "react-native-paper";

const MyProgressScreen = () => {
  const TRAINER_PHONE_NUMBER = process.env.EXPO_PUBLIC_TRAINER_PHONE_NUMBER;

  const currentUser = useUserStore((state) => state.currentUser);
  const { getWeighInsByUserId, updateWeighInById, deleteWeighIn, addWeighIn } = useWeighInApi();

  const { colors, spacing, layout } = useStyles();
  const { slideInLeftDelay0, slideInRightDelay100 } = useSlideInAnimations();

  const [weighIns, setWeighIns] = useState<IWeighIn[]>([]);
  const [isLoading, setisLoading] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [openWeightModal, setOpenWeightModal] = useState(false);

  const currentWeight = DateUtils.getLatestItem(weighIns, "date")?.weight || DEFAULT_INITIAL_WEIGHT;

  const handleSaveWeighIn = (
    weighIn: IWeighInPost,
    weighInId?: string | null,
    isNew: boolean = true
  ) => {
    setOpenWeightModal(false);

    if (isNew && currentUser) {
      return addWeighIn(currentUser._id, weighIn)
        .then((res) => setWeighIns(res.data.weighIns))
        .catch((err) => console.log("err", err));
    }
    if (!weighInId) return;

    handleUpdateWeighIn(weighInId, weighIn);
  };

  const handleUpdateWeighIn = async (weighInId: string, weighIn: IWeighInPost) => {
    try {
      const updateResult = await (await updateWeighInById(weighInId, weighIn)).data;

      setWeighIns((prev) => prev.map((item) => (item._id === weighInId ? updateResult : item)));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteWeighIn = async (weighInId: string | null) => {
    if (!weighInId) return;

    try {
      console.log("weigh in id", weighInId);
      const response = await deleteWeighIn(weighInId);

      setWeighIns(response.data.weighIns);
      setOpenWeightModal(false);
    } catch (e) {
      console.error(e);
    }
  };

  const getUserWeightIns = async () => {
    console.log("current user ", currentUser);
    if (!currentUser) return;
    setisLoading(true);
    getWeighInsByUserId(currentUser._id)
      .then((weighIns) => {
        console.log("got weigh ins", weighIns[0].weight);
        setWeighIns(weighIns);
      })
      .catch((err) => console.log(err))
      .finally(() => setisLoading(false));
  };

  useEffect(() => {
    getUserWeightIns();
  }, []);

  if (isLoading) return <ProgressScreenSkeleton />;

  return (
    <Portal.Host>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          layout.flexGrow,
          colors.background,
          spacing.pdBottomBar,
          spacing.pdStatusBar,
        ]}
      >
        <Animated.View style={[styles.calendarContainer, slideInLeftDelay0]}>
          <WeightCalendar
            weighIns={weighIns}
            onSaveWeighIn={handleSaveWeighIn}
            onDeleteWeighIn={(weighInId) => handleDeleteWeighIn(weighInId)}
          />
        </Animated.View>
        <Animated.View style={[styles.graphContainer, slideInRightDelay100]}>
          <WeightGraph weighIns={weighIns} />
        </Animated.View>
        <FABGroup
          icon={isFabOpen ? "close" : "plus"}
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
  calendarContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  graphContainer: {
    flex: 2,
  },
});

export default MyProgressScreen;
