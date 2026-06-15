import { isNotFoundError } from "@/API/api";
import { getCurrentAuthUser, refreshAccessToken } from "@/API/authApi";
import { NO_ACCESS, SESSION_EXPIRED } from "@/constants/Constants";
import { ONBOARDING_FORM_PRESET_KEY } from "@/constants/reactQuery";
import { FormPreset } from "@/interfaces/FormPreset";
import { IUser } from "@/interfaces/User";
import { useFormPresetsApi } from "@/hooks/api/useFormPresetsApi";
import useNotification from "@/hooks/useNotification";
import useUserQuery from "@/hooks/queries/useUserQuery";
import useLogout from "@/hooks/useLogout";
import AppNavigator from "@/navigators/AppNavigator";
import AuthNavigator from "@/navigators/AuthNavigator";
import SplashScreen from "@/screens/SplashScreen";
import { useFormStore } from "@/store/formStore";
import { useUserStore } from "@/store/userStore";
import {
  getAccessToken,
  loadPersistedAuthSession,
  setAuthSession,
  setAuthSessionFromRefresh,
} from "@/services/authSession";
import { RootStackParamList } from "@/types/navigatorTypes";
import { useToast } from "@/hooks/useToast";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useGetCurrentAgreement } from "@/hooks/queries/agreements/useGetCurrentAgreement";

type InitialRoute = {
  route: keyof RootStackParamList;
  params?: RootStackParamList[keyof RootStackParamList];
};

const RootNavigator = () => {
  const queryClient = useQueryClient();
  const { triggerErrorToast } = useToast();

  const { getOnBoardingFormPreset } = useFormPresetsApi();

  const { resolveAgreement } = useGetCurrentAgreement();
  const setActiveFormId = useFormStore((state) => state.setActiveFormId);

  const currentUser = useUserStore((state) => state.currentUser);
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);

  const { data } = useUserQuery(currentUser?._id);

  const { requestPermissions } = useNotification();
  const { handleLogout } = useLogout();

  const [loading, setLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState<InitialRoute | null>(null);
  const currentUserId = currentUser?._id;

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const session = await loadPersistedAuthSession();
        const persistedUser = session?.user;

        if (persistedUser) {
          setCurrentUser(persistedUser as IUser);
        }

        if (!session) return;

        try {
          const me = await getCurrentAuthUser();

          if (!me.user.hasAccess) {
            triggerErrorToast({ message: NO_ACCESS });
            await handleLogout();
            return;
          }

          await setAuthSession({ nextUser: me.user });
          setCurrentUser(me.user as IUser);
        } catch {
          if (!session.refreshToken) {
            triggerErrorToast({ message: SESSION_EXPIRED });
            await handleLogout();
            return;
          }

          const refreshedSession = await refreshAccessToken(session.refreshToken);
          await setAuthSessionFromRefresh(refreshedSession);

          const nextUser = refreshedSession.user;

          if (!nextUser.hasAccess || !getAccessToken()) {
            triggerErrorToast({ message: nextUser.hasAccess ? SESSION_EXPIRED : NO_ACCESS });
            await handleLogout();
            return;
          }

          setCurrentUser(nextUser as IUser);
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
    const userId = currentUserId;
    if (!userId) {
      setInitialRoute(null);
      return;
    }

    let cancelled = false;

    const runGate = async () => {
      const onBoardingStep = currentUser.onboardingStep;
      const hasCompletedOnboarding = onBoardingStep === "completed";
      const shouldResolveAgreementOnly = onBoardingStep === "agreement";

      const resolveOnboardingForm = async () => {
        try {
          const onboardingForm = await queryClient.fetchQuery<FormPreset>({
            queryKey: [ONBOARDING_FORM_PRESET_KEY, userId],
            queryFn: getOnBoardingFormPreset,
          });

          return onboardingForm ?? null;
        } catch (error) {
          if (isNotFoundError(error)) {
            return null;
          }

          return null;
        }
      };

      if (hasCompletedOnboarding) {
        console.log("User has completed onboarding, navigating to main app");
        setInitialRoute({ route: "BottomTabs" });
        return;
      }

      if (shouldResolveAgreementOnly) {
        console.log("Resolving agreement only");
        const agreement = await resolveAgreement();
        if (cancelled) return;

        if (agreement?.agreementId) {
          setInitialRoute({ route: "agreements" });
          return;
        }

        setInitialRoute({ route: "BottomTabs" });
        return;
      }

      const onboardingForm = await resolveOnboardingForm();
      if (cancelled) return;

      console.log("Resolved onboarding form:", onboardingForm);
      if (onboardingForm?._id) {
        setActiveFormId(onboardingForm._id);
        setInitialRoute({
          route: "FormPreset",
          params: { formId: onboardingForm._id } as any,
        });
        return;
      }

      const agreement = await resolveAgreement();
      if (cancelled) return;

      if (agreement?.agreementId) {
        setInitialRoute({ route: "agreements" });
        return;
      }

      setInitialRoute({ route: "BottomTabs" });
    };

    runGate();

    return () => {
      cancelled = true;
    };
  }, [currentUser?.onboardingStep, currentUserId]);

  if (loading) return <SplashScreen />;
  if (!currentUser) return <AuthNavigator />;

  if (!initialRoute) return <SplashScreen />;

  return <AppNavigator initialRoute={initialRoute} />;
};

export default RootNavigator;
