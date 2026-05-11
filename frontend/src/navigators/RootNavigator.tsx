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

type InitialRoute = {
  route: keyof RootStackParamList;
  params?: RootStackParamList[keyof RootStackParamList];
};

const RootNavigator = () => {
  const queryClient = useQueryClient();
  const { triggerErrorToast } = useToast();

  const { getOnBoardingFormPreset } = useFormPresetsApi();

  const agreementSignedByUserId = useFormStore((state) => state.agreementSignedByUserId);
  const onboardingCompletedByUserId = useFormStore((state) => state.onboardingCompletedByUserId);
  const setActiveFormId = useFormStore((state) => state.setActiveFormId);

  const currentUser = useUserStore((state) => state.currentUser);
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);

  const { data } = useUserQuery(currentUser?._id);

  const { requestPermissions } = useNotification();
  const { handleLogout } = useLogout();

  const [loading, setLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState<InitialRoute | null>(null);

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

          console.log(`Current user from API:`, JSON.stringify(me, undefined, 2));

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
    const userId = currentUser?._id;
    if (!userId) {
      setInitialRoute(null);
      return;
    }

    let cancelled = false;

    const runGate = async () => {
      const onBoardingStep = currentUser.onboardingStep;
      if (onBoardingStep == "completed") return setInitialRoute({ route: "BottomTabs" });

      const markedCompleted = onboardingCompletedByUserId[userId];
      const markedSigned = agreementSignedByUserId[userId];

      if (markedSigned) {
        setInitialRoute({ route: "BottomTabs" });
        return;
      }

      if (markedCompleted) {
        setInitialRoute({ route: "agreements" });
        return;
      }

      if (onBoardingStep == "form") {
        try {
          const onboardingForm = await queryClient.fetchQuery<FormPreset>({
            queryKey: [ONBOARDING_FORM_PRESET_KEY],
            queryFn: getOnBoardingFormPreset,
          });

          if (cancelled) return;

          if (onboardingForm?._id) {
            setActiveFormId(onboardingForm._id);
            setInitialRoute({
              route: "FormPreset",
              params: { formId: onboardingForm._id } as any,
            });
            return;
          }
        } catch (error) {
          console.error("Error fetching onboarding form:", error);
        }

        if (!cancelled) setInitialRoute({ route: "BottomTabs" });
        return;
      } else if (onBoardingStep == "agreement") {
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
