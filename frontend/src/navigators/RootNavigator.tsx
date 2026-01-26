import { useEffect, useRef, useState } from "react";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { useUserApi } from "@/hooks/api/useUserApi";
import { useUserStore } from "@/store/userStore";
import useNotification from "@/hooks/useNotification";
import { NO_ACCESS, SESSION_EXPIRED } from "@/constants/Constants";
import { ONBOARDING_FORM_PRESET_KEY, SESSION_TOKEN_KEY } from "@/constants/reactQuery";
import useLogout from "@/hooks/useLogout";
import useUserQuery from "@/hooks/queries/useUserQuery";
import SplashScreen from "@/screens/SplashScreen";
import { useToast } from "@/hooks/useToast";
import AuthNavigator from "./AuthNavigator";
import AppNavigator from "./AppNavigator";
import { useFormPresetsApi } from "@/hooks/api/useFormPresetsApi";
import { FormPreset } from "@/interfaces/FormPreset";
import { useFormStore } from "@/store/formStore";
import { useQueryClient } from "@tanstack/react-query";
import { RootStackParamList } from "@/types/navigatorTypes";

type InitialRoute = {
  route: keyof RootStackParamList;
  params?: RootStackParamList[keyof RootStackParamList];
};

const RootNavigator = () => {
  const queryClient = useQueryClient();
  const sessionStorage = useAsyncStorage(SESSION_TOKEN_KEY);
  const { triggerErrorToast } = useToast();

  const { getOnBoardingFormPreset } = useFormPresetsApi();

  const agreementSignedByUserId = useFormStore((state) => state.agreementSignedByUserId);
  const onboardingCompletedByUserId = useFormStore((state) => state.onboardingCompletedByUserId);
  const setActiveFormId = useFormStore((state) => state.setActiveFormId);

  const currentUser = useUserStore((state) => state.currentUser);
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);

  const { data } = useUserQuery(currentUser?._id);

  const { checkUserSessionToken } = useUserApi();
  const { requestPermissions } = useNotification();
  const { handleLogout } = useLogout();

  const [loading, setLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState<InitialRoute | null>(null);

  const gatedForUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const token = await sessionStorage.getItem();
        let tokenData: any = null;

        if (token) {
          try {
            tokenData = JSON.parse(token);
          } catch {
            tokenData = null;
          }
        }

        const user = tokenData?.data?.user;
        if (user) setCurrentUser(user);

        // If no token, we're done booting (AuthNavigator will show)
        if (!tokenData) return;

        const { isValid, hasAccess } = await checkUserSessionToken(tokenData);

        if (!hasAccess) {
          triggerErrorToast({ message: NO_ACCESS });
          await handleLogout();
          return;
        }

        if (!isValid) {
          triggerErrorToast({ message: SESSION_EXPIRED });
          await handleLogout();
          return;
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
    requestPermissions().catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    if (!data) return;
    setCurrentUser(data);
  }, [data]);

  useEffect(() => {
    const userId = currentUser?._id;
    if (!userId) {
      setInitialRoute(null);
      return;
    }

    if (gatedForUserIdRef.current === userId) return;
    gatedForUserIdRef.current = userId;

    let cancelled = false;

    const runGate = async () => {
      const onBoardingStep = currentUser.onboardingStep;
      if (onBoardingStep == "completed") return setInitialRoute({ route: "BottomTabs" });

      const markedCompleted = onboardingCompletedByUserId[userId];
      const markedSigned = agreementSignedByUserId[userId];
      const hasCompletedOnboarding = onBoardingStep !== "form" || !!markedCompleted;
      const hasSignedAgreement = onBoardingStep !== "agreement" || !!markedSigned;

      if (!hasCompletedOnboarding) {
        try {
          const onboardingForm = await queryClient.fetchQuery<FormPreset>({
            queryKey: [ONBOARDING_FORM_PRESET_KEY],
            queryFn: getOnBoardingFormPreset,
          });

          if (cancelled) return;

          if (onboardingForm?._id) {
            setActiveFormId(onboardingForm._id);
            setInitialRoute({ route: "FormPreset", params: { formId: onboardingForm._id } as any });
            return;
          }
        } catch (error) {
          console.error("Error fetching onboarding form:", error);
        }

        if (!cancelled) setInitialRoute({ route: "BottomTabs" });
        return;
      }

      if (!hasSignedAgreement) {
        if (!cancelled) setInitialRoute({ route: "agreements" });
        return;
      }

      if (!cancelled) setInitialRoute({ route: "BottomTabs" });
    };

    runGate();

    return () => {
      cancelled = true;
    };
  }, [currentUser?._id]);

  if (loading) return <SplashScreen />;

  if (!currentUser) return <AuthNavigator />;

  if (!initialRoute) return <SplashScreen />;

  return <AppNavigator initialRoute={initialRoute} />;
};

export default RootNavigator;
