import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "@/components/ui/Text";
import Icon from "@/components/Icon/Icon";
import Animated, { Easing, FadeIn, FadeInDown } from "react-native-reanimated";
import useStyles from "@/styles/useGlobalStyles";
import { useEffect, useMemo, useState } from "react";
import { IWorkoutPlan } from "@/interfaces/Workout";
import BlocksStrip from "@/components/WorkoutPlan/BlocksStrip";
import useTrainerBlockBackgroundsQuery from "@/hooks/queries/useTrainerBlockBackgroundsQuery";
import { useUserStore } from "@/store/userStore";
import MuscleGroupContainer from "@/components/WorkoutPlan/MuscleGroupContainer";
import useWorkoutPlanQuery from "@/hooks/queries/useWorkoutPlanQuery";
import { ConditionalRender } from "@/components/ui/ConditionalRender";
import WorkoutPlanSkeletonLoader from "@/components/ui/loaders/skeletons/WorkoutPlanSkeletonLoader";
import ErrorScreen from "./ErrorScreen";
import usePullDownToRefresh from "@/hooks/usePullDownToRefresh";
import WorkoutPlanSelector from "@/components/WorkoutPlan/WorkoutPlanSelector";
import { CARDIO_VALUE } from "@/constants/Constants";
import CardioWrapper from "@/components/WorkoutPlan/cardio/CardioWrapper";
import { DropDownContextProvider } from "@/context/useDropdown";
import { mapToDropDownItems } from "@/utils/utils";
import queryClient from "@/QueryClient/queryClient";
import { WORKOUT_SESSION_KEY } from "@/constants/reactQuery";
import { useShadowStyles } from "@/styles/useShadowStyles";
import CustomScrollView from "@/components/ui/scrollview/CustomScrollView";
import PlanPendingState from "@/components/ui/PlanPendingState";
import { RouteProp, useRoute } from "@react-navigation/native";
import { WorkoutPlanStackParamList } from "@/types/navigatorTypes";

const shouldOpenCardio = (openCardio?: boolean | string) =>
  openCardio === true || openCardio === "true";

const MyWorkoutPlanScreen = () => {
  const { colors, layout, spacing, common } = useStyles();
  const { frameShadow } = useShadowStyles();
  const { refresh } = usePullDownToRefresh();
  const route = useRoute<RouteProp<WorkoutPlanStackParamList, "WorkoutPlan">>();

  const { data, isError, isLoading, error, refetch, isRefetching } = useWorkoutPlanQuery();
  const trainerId = useUserStore((state) => state.currentUser?.trainerId);
  const { data: blockBackgroundsResponse } = useTrainerBlockBackgroundsQuery(trainerId);
  const blockBackgrounds = blockBackgroundsResponse?.data;

  const [selectedPlan, setSelectedPlan] = useState<IWorkoutPlan>();
  const [showCardio, setShowCardio] = useState(() => shouldOpenCardio(route.params?.openCardio));

  const effectiveBlocks = useMemo(() => {
    if (Array.isArray(data?.blocks) && data!.blocks!.length > 0) return data!.blocks!;
    return [];
  }, [data]);

  const inBlocksMode = data?.mode === "blocks" && effectiveBlocks.length > 0;
  const activeBlockIndex = data?.activeBlockIndex ?? 0;
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number>(activeBlockIndex);
  const [hasEnteredBlock, setHasEnteredBlock] = useState<boolean>(false);

  useEffect(() => {
    setSelectedBlockIndex(activeBlockIndex);
  }, [activeBlockIndex]);

  const handleEnterBlock = (index: number) => {
    setSelectedBlockIndex(index);
    setHasEnteredBlock(true);
  };

  const handleExitBlock = () => {
    setHasEnteredBlock(false);
  };

  const activeWorkoutPlans: IWorkoutPlan[] = useMemo(() => {
    if (inBlocksMode && effectiveBlocks[selectedBlockIndex]) {
      return effectiveBlocks[selectedBlockIndex].workoutPlans || [];
    }
    return data?.workoutPlans || [];
  }, [data, inBlocksMode, effectiveBlocks, selectedBlockIndex]);

  const activeBlockTips = useMemo(() => {
    if (inBlocksMode && effectiveBlocks[selectedBlockIndex]) {
      return effectiveBlocks[selectedBlockIndex].tips || [];
    }
    return undefined;
  }, [inBlocksMode, effectiveBlocks, selectedBlockIndex]);

  useEffect(() => {
    if (shouldOpenCardio(route.params?.openCardio)) {
      setShowCardio(true);
    }
  }, [route.params?.openCardio]);

  const handleRefetch = async () => {
    queryClient.invalidateQueries({ queryKey: [WORKOUT_SESSION_KEY] });
    await refetch();
  };

  const hasCardioPlan = Boolean(data?.cardio?.type && data?.cardio?.plan);
  const hasWorkoutPlanContent = activeWorkoutPlans.length > 0 || hasCardioPlan;

  const handleSelect = (val: any) => {
    if (val == CARDIO_VALUE) return setShowCardio(true);
    const selected = activeWorkoutPlans.find((plan) => plan._id === val);

    setSelectedPlan(selected);

    if (!showCardio) return;
    setShowCardio(false);
  };

  const plans = useMemo(() => {
    if (!data) return [];

    const nextPlans = mapToDropDownItems(activeWorkoutPlans, {
      labelKey: "planName",
      valueKey: "_id",
    });

    nextPlans.push({ label: CARDIO_VALUE, value: CARDIO_VALUE });
    setSelectedPlan(activeWorkoutPlans[0]);

    return nextPlans;
  }, [data, activeWorkoutPlans]);

  if (error?.status === 404 || (!isLoading && !isError && !hasWorkoutPlanContent)) {
    return (
      <PlanPendingState
        title="תוכנית האימונים שלך בבנייה"
        description=""
        isFetching={isRefetching}
        onRefresh={() => void refresh(handleRefetch)}
      />
    );
  }

  if (isError) {
    return <ErrorScreen refetchFunc={() => refresh(handleRefetch)} isFetching={isRefetching} />;
  }

  if (isLoading) return <WorkoutPlanSkeletonLoader />;

  const showBlocksList = inBlocksMode && !showCardio && !hasEnteredBlock;
  const showWorkoutView = !showBlocksList;

  return (
    <View style={[layout.flex1, colors.background, spacing.pdStatusBar]}>
      {showWorkoutView && (
        <Animated.View
          entering={FadeInDown.duration(520).easing(Easing.out(Easing.cubic))}
          style={[
            { zIndex: 2, elevation: 5 },
            showCardio ? undefined : frameShadow,
            spacing.pdHorizontalLg,
          ]}
        >
          {inBlocksMode && !showCardio && (
            <Pressable style={mwStyles.backBtn} onPress={handleExitBlock} hitSlop={10}>
              <Icon name="chevronRightSoft" width={18} height={18} />
              <Text fontSize={13} fontVariant="semibold">
                כל הבלוקים
              </Text>
            </Pressable>
          )}
          <DropDownContextProvider items={plans} onSelect={handleSelect}>
            <ScrollView style={[common.rounded]}>
              <WorkoutPlanSelector
                selectedPlan={showCardio ? CARDIO_VALUE : selectedPlan?.planName || ""}
                isCardio={showCardio}
                overrideTips={activeBlockTips}
              />
            </ScrollView>
          </DropDownContextProvider>
        </Animated.View>
      )}

      {showBlocksList && (
        <View style={mwStyles.blocksHeader}>
          <Text fontSize={20} fontVariant="bold">
            תוכנית האימונים שלי
          </Text>
          <Text fontSize={13} style={mwStyles.blocksSubtitle}>
            בחר בלוק כדי לצפות באימונים ובדגשים שלו
          </Text>
        </View>
      )}

      {showBlocksList && (
        <BlocksStrip
          blocks={effectiveBlocks}
          activeBlockIndex={activeBlockIndex}
          selectedBlockIndex={selectedBlockIndex}
          onSelectBlock={handleEnterBlock}
          backgrounds={blockBackgrounds}
          refreshing={isRefetching}
          onRefresh={() => void refresh(handleRefetch)}
        />
      )}

      {showWorkoutView && (
        <CustomScrollView
          style={{ zIndex: 1, elevation: 1 }}
          contentContainerStyle={[spacing.gapXxl, spacing.pdBottomBar, spacing.pdLg, { zIndex: 1 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={handleRefetch} />}
        >
          <ConditionalRender condition={showCardio}>
            <Animated.View entering={FadeIn.duration(400).delay(120)}>
              <CardioWrapper cardioPlan={data?.cardio} />
            </Animated.View>
          </ConditionalRender>

          <ConditionalRender condition={!showCardio}>
            {selectedPlan?.muscleGroups.map((muscleGroup, i) => (
              <Animated.View
                key={i}
                entering={FadeInDown.duration(520)
                  .delay(140 + i * 130)
                  .easing(Easing.out(Easing.cubic))}
              >
                <MuscleGroupContainer muscleGroup={muscleGroup} plan={selectedPlan.planName} />
              </Animated.View>
            ))}
          </ConditionalRender>
        </CustomScrollView>
      )}
    </View>
  );
};

const mwStyles = StyleSheet.create({
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    alignSelf: "flex-start",
  },
  blocksHeader: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 4,
    alignItems: "center",
  },
  blocksSubtitle: {
    color: "#64748B",
  },
  quoteText: {
    color: "#072723",
    marginBottom: 4,
    fontStyle: "italic",
  },
});

export default MyWorkoutPlanScreen;
