import * as Sentry from "@sentry/react-native";
import { useUserStore } from "@/store/userStore";
import { getAccessToken, getRefreshToken, subscribeAuthSession } from "@/services/authSession";
import { getApiKey } from "@/services/apiKey";
import { setReportingSecrets } from "./sanitize";

const syncSecrets = (): void => {
  let apiKey: string | undefined;
  try {
    apiKey = getApiKey();
  } catch {
    /* Missing config is handled by the API consumer. */
  }
  setReportingSecrets([apiKey, getAccessToken(), getRefreshToken()]);
};

export const syncReportingUser = (userId: string | null): void => {
  try {
    Sentry.setUser(userId ? { id: userId } : null);
    syncSecrets();
  } catch {
    /* Monitoring must not interfere with session updates. */
  }
};

export const subscribeReportingUser = (): (() => void) => {
  syncReportingUser(useUserStore.getState().currentUser?._id ?? null);
  const unsubscribeUser = useUserStore.subscribe((state, previous) => {
    if (state.currentUser?._id !== previous.currentUser?._id) {
      syncReportingUser(state.currentUser?._id ?? null);
    }
  });
  const unsubscribeAuth = subscribeAuthSession(syncSecrets);
  return () => {
    unsubscribeUser();
    unsubscribeAuth();
  };
};
