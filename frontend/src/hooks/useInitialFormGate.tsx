import { useNavigation } from "@react-navigation/native";
import { useUserStore } from "@/store/userStore";
import { useFormStore } from "@/store/formStore";
import { useEffect, useRef } from "react";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQueryClient } from "@tanstack/react-query";
import { ONBOARDING_FORM_PRESET_KEY, FORM_PRESETS_KEY } from "@/constants/reactQuery";
import { useFormResponseApi } from "./api/useFormResponseApi";
import { useFormPresetsApi } from "./api/useFormPresetsApi";
import { FormPreset } from "@/interfaces/FormPreset";
import useGetOnboardingForm from "./queries/FormPreset/useGetOnboardingForm";

type NavigationProp = NativeStackNavigationProp<any>;

const useInitialFormGate = () => {
  const navigation = useNavigation<NavigationProp>();
  const { currentUser } = useUserStore();
  const { setActiveFormId, isFormCompleted } = useFormStore();
  const queryClient = useQueryClient();
  const hasNavigatedRef = useRef(false);
  const { getOnBoardingFormPreset, getFormPresets, getGeneralFormForToday } = useFormPresetsApi();
  const { getFormResponses } = useFormResponseApi();

  // --- Navigation helper ---
  const navigateToForm = (formId: string) => {
    if (hasNavigatedRef.current) return;
    hasNavigatedRef.current = true;
    setActiveFormId(formId);
    navigation.navigate("FormPreset");
  };

  useEffect(() => {
    const performChecks = async () => {
      if (!currentUser || hasNavigatedRef.current) return;

      console.warn("currentUser", currentUser.completedOnboarding);

      // 1. Onboarding
      if (!currentUser.completedOnboarding) {
        const onboardingForm = await queryClient.fetchQuery<FormPreset>({
          queryKey: [ONBOARDING_FORM_PRESET_KEY],
          queryFn: getOnBoardingFormPreset,
        });

        console.warn("onboardingForm", onboardingForm);
        if (onboardingForm) {
          navigateToForm(onboardingForm._id);
          return;
        }
      }

      // 2. Monthly
      const monthlySubmissions = await getFormResponses({
        userId: currentUser._id,
        formType: "monthly",
      });

      const currentMonth = new Date().getMonth();
      const hasSubmittedThisMonth = (monthlySubmissions || []).some(
        (sub) => new Date(sub.submittedAt).getMonth() === currentMonth
      );

      if (!hasSubmittedThisMonth) {
        const presets = await queryClient.fetchQuery<FormPreset[]>({
          queryKey: [FORM_PRESETS_KEY],
          queryFn: getFormPresets,
        });
        const latestMonthlyPreset = (presets || [])
          .filter((fp) => fp.type === "monthly" && fp.showOn)
          .sort((a, b) => new Date(b.showOn!).getTime() - new Date(a.showOn!).getTime())[0];

        if (latestMonthlyPreset) {
          navigateToForm(latestMonthlyPreset._id);
          return;
        }
      }

      // 3. Daily
      const dailyForm = await getGeneralFormForToday();

      if (dailyForm) {
        const occurrenceKey = dailyForm.showOn!.substring(0, 10);
        if (!isFormCompleted("general", currentUser._id, dailyForm._id, occurrenceKey)) {
          navigateToForm(dailyForm._id);
          return;
        }
      }
    };

    performChecks();
  }, [currentUser, queryClient]);

  // Effect to invalidate onboarding form query once completed
  useEffect(() => {
    if (currentUser?.completedOnboarding) {
      queryClient.invalidateQueries({ queryKey: [ONBOARDING_FORM_PRESET_KEY] });
    }
  }, [currentUser?.completedOnboarding, queryClient]);
};

export default useInitialFormGate;
