import WeightCalendar from "@/components/Calendar/WeightCalendar";
import FABGroup from "@/components/ui/FABGroup";
import Loader from "@/components/ui/loaders/Loader";
import ProgressScreenSkeleton from "@/components/ui/loaders/skeletons/ProgressScreenSkeleton";
import { WeightGraph } from "@/components/WeightGraph/WeightGraph";
import WeightInputModal from "@/components/WeightGraph/WeightInputModal";
import { DEFAULT_INITIAL_WEIGHT, DEFAULT_MESSAGE_TO_TRAINER } from "@/constants/Constants";
import { ONE_DAY, WEIGH_INS_KEY } from "@/constants/reactQuery";
import { useWeighInApi } from "@/hooks/useWeighInApi";
import { IWeighInPost } from "@/interfaces/User";
import { useUserStore } from "@/store/userStore";
import useStyles from "@/styles/useGlobalStyles";
import useSlideInAnimations from "@/styles/useSlideInAnimations";
import DateUtils from "@/utils/dateUtils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { StyleSheet, ScrollView, Linking, Animated } from "react-native";
import { Portal } from "react-native-paper";
import ErrorScreen from "./ErrorScreen";

const MyProgressScreen = () => {
  const TRAINER_PHONE_NUMBER = process.env.EXPO_PUBLIC_TRAINER_PHONE_NUMBER;

  const currentUser = useUserStore((state) => state.currentUser);
  const { getWeighInsByUserId, updateWeighInById, deleteWeighIn, addWeighIn } = useWeighInApi();
  const queryClient = useQueryClient();

  const { colors, spacing, layout } = useStyles();
  const { slideInLeftDelay0, slideInRightDelay100 } = useSlideInAnimations();

  const [isFabOpen, setIsFabOpen] = useState(false);
  const [openWeightModal, setOpenWeightModal] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryFn: () => getWeighInsByUserId(currentUser?._id || ``),
    queryKey: [WEIGH_INS_KEY + currentUser?._id],
    enabled: !!currentUser,
    staleTime: ONE_DAY,
  });

  const successFunc = () => {
    queryClient.invalidateQueries({ queryKey: [WEIGH_INS_KEY + currentUser?._id] });
  };

  const failureFunc = (err: any) => {
    console.log(err);
  };

  const addNewWeighIn = useMutation({
    mutationFn: ({ userId, weighIn }: { userId: string; weighIn: IWeighInPost }) =>
      addWeighIn(userId, weighIn),
    onSuccess: successFunc,
    onError: failureFunc,
  });

  const updateWeighIn = useMutation({
    mutationFn: ({ weighInId, weighIn }: { weighInId: string; weighIn: IWeighInPost }) =>
      updateWeighInById(weighInId, weighIn),
    onSuccess: successFunc,
    onError: failureFunc,
  });

  const removeWeighIn = useMutation({
    mutationFn: (weighInId: string) => deleteWeighIn(weighInId),
    onSuccess: () => {
      successFunc();
      setOpenWeightModal(false);
    },
    onError: failureFunc,
  });

  const currentWeight =
    DateUtils.getLatestItem(data || [], "date")?.weight || DEFAULT_INITIAL_WEIGHT;

  const handleSaveWeighIn = (
    weighIn: IWeighInPost,
    weighInId?: string | null,
    isNew: boolean = true
  ) => {
    setOpenWeightModal(false);

    if (isNew && currentUser) {
      const userId = currentUser._id;
      addNewWeighIn.mutate({ userId, weighIn });
    }
    if (!weighInId) return;

    updateWeighIn.mutate({ weighInId, weighIn });
  };

  const handleDeleteWeighIn = async (weighInId: string | null) => {
    if (!weighInId) return;

    removeWeighIn.mutate(weighInId);
  };

  if (isLoading) return <ProgressScreenSkeleton />;
  if (addNewWeighIn.isLoading || updateWeighIn.isLoading || removeWeighIn.isLoading)
    return <Loader variant="Screen" />;
  if (isError || addNewWeighIn.isError || updateWeighIn.isError || removeWeighIn.isError)
    return (
      <ErrorScreen
        error={error || addNewWeighIn.error || updateWeighIn.error || removeWeighIn.error}
      />
    );

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
            weighIns={data || []}
            onSaveWeighIn={handleSaveWeighIn}
            onDeleteWeighIn={(weighInId) => handleDeleteWeighIn(weighInId)}
          />
        </Animated.View>
        <Animated.View style={[styles.graphContainer, slideInRightDelay100]}>
          <WeightGraph weighIns={data || []} />
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
