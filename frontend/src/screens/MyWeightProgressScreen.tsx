import WeightCalendar from "@/components/Calendar/WeightCalendar";
import FABGroup from "@/components/ui/FABGroup";
import Loader from "@/components/ui/loaders/Loader";
import ProgressScreenSkeleton from "@/components/ui/loaders/skeletons/ProgressScreenSkeleton";
import { WeightGraph } from "@/components/WeightGraph/WeightGraph";
import WeightInputModal from "@/components/WeightGraph/WeightInputModal";
import { DEFAULT_INITIAL_WEIGHT } from "@/constants/Constants";
import { useWeighInApi } from "@/hooks/api/useWeighInApi";
import { IWeighIn, IWeighInPost } from "@/interfaces/User";
import { ONE_DAY, WEIGH_INS_KEY } from "@/constants/reactQuery";
import { useUserStore } from "@/store/userStore";
import useStyles from "@/styles/useGlobalStyles";
import useSlideInAnimations from "@/styles/useSlideInAnimations";
import DateUtils from "@/utils/dateUtils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { StyleSheet, ScrollView, Linking, Animated } from "react-native";
import { Portal } from "react-native-paper";
import { checkIfDatesMatch, createRetryFunction } from "@/utils/utils";
import BottomDrawer from "@/components/ui/BottomDrawer";
import ImagePreview from "@/components/WeightGraph/ImagePreview";
import Constants from "expo-constants";
import useImageUploadStatus from "@/hooks/useImageUploadStatus";
import { softHaptic } from "@/utils/haptics";

const MyWeightProgressScreen = () => {
  const isDevMode = process.env.EXPO_PUBLIC_MODE == "development";
  const TRAINER_PHONE_NUMBER = isDevMode
    ? process.env.EXPO_PUBLIC_TRAINER_PHONE_NUMBER
    : Constants?.expoConfig?.extra?.TRAINER_PHONE_NUMBER;

  const currentUser = useUserStore((state) => state.currentUser);
  const { getWeighInsByUserId, updateWeighInById, deleteWeighIn, addWeighIn } = useWeighInApi();
  const queryClient = useQueryClient();

  const { colors, spacing, layout } = useStyles();
  const { slideInLeftDelay0, slideInRightDelay100 } = useSlideInAnimations();
  const { title } = useImageUploadStatus();

  const [isFabOpen, setIsFabOpen] = useState(false);
  const [openWeightModal, setOpenWeightModal] = useState(false);
  const [openUploadModal, setOpenUploadModal] = useState(false);
  const [lastWeighIn, setLastWeighIn] = useState<IWeighIn | null>(null);
  const [todaysWeighInExists, setTodaysWeighInExists] = useState(false);

  const handleGetWeighInsByUserId = async () => {
    if (!currentUser) return [];

    try {
      const weighIns = await getWeighInsByUserId(currentUser?._id);

      return weighIns;
    } catch (error: any) {
      return [];
    }
  };

  const { data, isLoading } = useQuery({
    queryFn: handleGetWeighInsByUserId,
    queryKey: [WEIGH_INS_KEY + currentUser!._id],
    enabled: !!currentUser,
    staleTime: ONE_DAY,
    retry: createRetryFunction(404, 2),
  });

  const successFunc = () => {
    queryClient.invalidateQueries({ queryKey: [WEIGH_INS_KEY + currentUser?._id] });
  };

  const failureFunc = (err: any) => {
    if (err.status == 404) {
    }
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

  useEffect(() => {
    if (!data || !data.length) return;
    const lastWeighInIndex = data?.length - 1;
    const latestWeghIn = data[lastWeighInIndex];

    const weighInExists = checkIfDatesMatch(new Date(latestWeghIn?.date), new Date());

    setLastWeighIn(latestWeghIn);
    setTodaysWeighInExists(weighInExists);
  }, [data]);

  if (isLoading) return <ProgressScreenSkeleton />;

  return (
    <Portal.Host>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          layout.flexGrow,
          colors.background,
          spacing.pdBottomBar,
          spacing.pdVerticalDefault,
        ]}
      >
        {(addNewWeighIn.isLoading || updateWeighIn.isLoading || removeWeighIn.isLoading) && (
          <Loader variant="Screen" />
        )}
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
            softHaptic()
            setIsFabOpen(open);
          }}
          color={colors.textOnBackground.color}
          fabStyle={[colors.backgroundPrimary]}
          variant="primary"
          open={isFabOpen}
          actions={[
            {
              icon: todaysWeighInExists ? "update" : "plus",
              onPress: () => setOpenWeightModal(true),
              label: todaysWeighInExists ? "עריכת שקילה יומית" : "הוספת שקילה יומית",
            },
            {
              icon: "camera",
              onPress: currentUser?.imagesUploaded
                ? () => console.log(`no`)
                : () => setOpenUploadModal(true),
              label: currentUser?.imagesUploaded ? title : "שלח/י תמונת מעקב",
              color: currentUser?.imagesUploaded ? "grey" : colors.textOnPrimaryContainer.color,
            },
            {
              icon: "whatsapp",
              onPress: () => Linking.openURL(`whatsapp://send?phone=${TRAINER_PHONE_NUMBER}`),
              label: "הודעה למאמן",
            },
          ]}
        />
      </ScrollView>
      {openWeightModal && (
        <WeightInputModal
          handleDismiss={() => setOpenWeightModal(false)}
          currentWeight={currentWeight || 0}
          handleSaveWeight={
            todaysWeighInExists
              ? (weight) => handleSaveWeighIn({ weight }, lastWeighIn?._id, false)
              : (weight) => handleSaveWeighIn({ weight })
          }
        />
      )}
      <BottomDrawer
        open={openUploadModal}
        onClose={() => setOpenUploadModal(false)}
        children={<ImagePreview handleClose={() => setOpenUploadModal(false)} />}
      />
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

export default MyWeightProgressScreen;
