import {
  Animated,
  Dimensions,
  FlatList,
  ImageBackground,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useState, useEffect, FC, useMemo } from "react";
import logoBlack from "@assets/avihu/avihu-logo-black.png";
import { IWorkoutPlan } from "@/interfaces/Workout";
import WorkoutTips from "./WorkoutTips";
import { useWorkoutPlanApi } from "@/hooks/api/useWorkoutPlanApi";
import ExerciseContainer from "./ExerciseContainer";
import useStyles from "@/styles/useGlobalStyles";
import { useUserStore } from "@/store/userStore";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { StackNavigatorProps, WorkoutPlanStackParamList } from "@/types/navigatorTypes";
import NoDataScreen from "@/screens/NoDataScreen";
import ErrorScreen from "@/screens/ErrorScreen";
import { Text } from "../ui/Text";
import usePullDownToRefresh from "@/hooks/usePullDownToRefresh";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ONE_DAY, WORKOUT_PLAN_KEY, WORKOUT_SESSION_KEY } from "@/constants/reactQuery";
import useSlideInAnimations from "@/styles/useSlideInAnimations";
import CardioWrapper from "./cardio/CardioWrapper";
import WorkoutDropdownSelector from "./WorkoutDropdownSelector";
import WorkoutPlanSkeletonLoader from "../ui/loaders/skeletons/WorkoutPlanSkeletonLoader";
import useWorkoutSessionQuery from "@/hooks/queries/useWorkoutSessionQuery";

const width = Dimensions.get("window").width;
interface WorkoutPlanProps
  extends StackNavigatorProps<WorkoutPlanStackParamList, "WorkoutPlanPage"> {}

const WorkoutPlan: FC<WorkoutPlanProps> = () => {
  const [value, setValue] = useState<string>("");
  const [openTips, setOpenTips] = useState(false);
  const [currentWorkoutPlan, setCurrentWorkoutPlan] = useState<IWorkoutPlan | null>(null);
  const [displayCardioPlan, setDisplayCardioPlan] = useState(false);
  const [currentWorkoutSession, setCurrentWorkoutSession] = useState<any>(null);

  const { fonts, layout, text, spacing, colors, common } = useStyles();
  const { getWorkoutPlanByUserId } = useWorkoutPlanApi();
  const { currentUser } = useUserStore();
  const { setItem } = useAsyncStorage(WORKOUT_SESSION_KEY);
  const { isRefreshing, refresh } = usePullDownToRefresh();

  const queryClient = useQueryClient();

  const {
    slideInRightDelay0,
    slideInRightDelay100,
    slideInRightDelay200,
    slideInRightDelay300,
    slideInRightDelay400,
    slideInBottomDelay500,
    slideInBottomDelay600,
  } = useSlideInAnimations();

  const slideAnimations = [
    slideInRightDelay0,
    slideInRightDelay100,
    slideInRightDelay200,
    slideInRightDelay300,
    slideInRightDelay400,
    slideInBottomDelay500,
    slideInBottomDelay600,
  ];

  const handleGetWorkoutPlan = async () => {
    try {
      const workoutPlan = await getWorkoutPlanByUserId(currentUser!._id);

      return workoutPlan;
    } catch (err: any) {
      throw err;
    }
  };

  const { data, isError, error, refetch } = useQuery({
    queryFn: handleGetWorkoutPlan,
    enabled: !!currentUser,
    queryKey: [WORKOUT_PLAN_KEY + currentUser?._id],
    staleTime: ONE_DAY,
  });

  const { data: workoutSessionData, refetch: refetchSession } = useWorkoutSessionQuery();

  const onSelectWorkout = (planName: string) => {
    if (planName == `cardio`) {
      return setDisplayCardioPlan(true);
    }
    setDisplayCardioPlan(false);

    const selectedWorkoutPlan = data?.workoutPlans.find((plan) => plan.planName === planName);

    if (!selectedWorkoutPlan) return;
    setCurrentWorkoutPlan({ ...selectedWorkoutPlan });
  };

  const handleUpdateSession = async (session: any) => {
    setCurrentWorkoutSession(session);
    await setItem(JSON.stringify(session));
    queryClient.invalidateQueries([WORKOUT_SESSION_KEY]);
  };

  const handleRefreshPage = async () => {
    return await Promise.allSettled([refetch(), refetchSession()]);
  };

  const plans = useMemo(() => {
    if (!data) return [];
    const plans = data.workoutPlans.map((workout) => ({
      label: workout.planName,
      value: workout.planName,
    }));

    plans.push({ label: "אירובי", value: "cardio" });
    setValue(plans[0].value);

    return plans;
  }, [data]);

  useEffect(() => {
    if (!data) return;

    setCurrentWorkoutPlan(data.workoutPlans[0]);
  }, [data]);

  useEffect(() => {
    if (!workoutSessionData) return;

    setCurrentWorkoutSession(workoutSessionData.data);
  }, [workoutSessionData]);

  if (isError && error.response.status == 404)
    return (
      <NoDataScreen
        variant="workoutPlan"
        refreshFunc={() => refresh(handleRefreshPage)}
        refreshing={isRefreshing}
      />
    );
  if (isError && error.response.status)
    return (
      <ErrorScreen error={error.response.data.message || ``} refetchFunc={handleRefreshPage} />
    );

  const Header = () => (
    <>
      <ImageBackground source={logoBlack} style={{ height: Dimensions.get("screen").height / 4 }} />
      <View style={[spacing.gapDefault, spacing.pdHorizontalDefault, colors.background]}>
        {value && plans && (
          <>
            <WorkoutDropdownSelector
              items={plans}
              onSelect={onSelectWorkout}
              value={value}
              setValue={setValue}
            />

            {data?.tips && data.tips.length > 0 && !displayCardioPlan && (
              <View style={[layout.flexRow, layout.justifyEnd, spacing.pdVerticalSm]}>
                <Pressable
                  style={[colors.backgroundPrimary, common.roundedSm, spacing.pdSm]}
                  onPress={() => setOpenTips(true)}
                >
                  <Text style={[fonts.md, colors.textOnBackground]}>דגשים לאימון</Text>
                </Pressable>
              </View>
            )}
          </>
        )}
      </View>
    </>
  );

  return (
    <>
      <View style={{ zIndex: 100 }}>
        <Header />
      </View>
      {!displayCardioPlan && (
        <FlatList
          data={currentWorkoutPlan?.muscleGroups || []}
          ListEmptyComponent={() => <WorkoutPlanSkeletonLoader />}
          keyExtractor={(item) => item.muscleGroup}
          style={colors.background}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => refresh(handleRefreshPage)}
            />
          }
          renderItem={({ item, index }) => (
            <Animated.View style={[spacing.pdHorizontalSm, slideAnimations[index + 1]]}>
              <Text style={[styles.muscleGroupText, text.textRight, fonts.xl]}>
                {item.muscleGroup}
              </Text>
              <View style={[spacing.gapLg]}>
                {item.exercises.map((exercise, index) => (
                  <ExerciseContainer
                    key={currentWorkoutPlan?.planName + "-" + index}
                    plan={currentWorkoutPlan?.planName || ""}
                    muscleGroup={item.muscleGroup}
                    exercise={exercise}
                    session={currentWorkoutSession}
                    updateSession={handleUpdateSession}
                  />
                ))}
              </View>
            </Animated.View>
          )}
          ListFooterComponent={
            <WorkoutTips tips={data?.tips} openTips={openTips} setOpenTips={setOpenTips} />
          }
          contentContainerStyle={styles.workoutContainer}
        />
      )}
      {displayCardioPlan && (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={() => refresh(refetch)} />
          }
          style={colors.background}
          contentContainerStyle={spacing.pdBottomBar}
        >
          <CardioWrapper cardioPlan={data?.cardio} />
        </ScrollView>
      )}
    </>
  );
};

export default WorkoutPlan;

const styles = StyleSheet.create({
  headerImage: {
    width: width,
    height: 250,
  },
  container: {
    width: "100%",
    alignItems: "flex-end",
  },
  tipsText: {
    textAlign: "right",
    fontSize: 18,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  workoutContainer: {
    gap: 12,
  },
  muscleGroupText: {
    color: "#f8f9fa",
    textAlign: "left",
    fontWeight: "bold",
    padding: 10,
  },
});
