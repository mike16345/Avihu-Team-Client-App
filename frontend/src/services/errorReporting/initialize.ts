import * as Sentry from "@sentry/react-native";
import Constants from "expo-constants";
import * as Updates from "expo-updates";
import { Platform } from "react-native";
import { getRuntimeTenant } from "@/config/runtimeTenant";
import { setErrorReporter } from "./reportError";
import { sanitizeSentryBreadcrumb, sanitizeSentryEvent } from "./sanitize";

let initialized = false;

export const initializeErrorReporting = (): void => {
  if (initialized) return;
  try {
    const tenant = getRuntimeTenant(Constants);
    if (!tenant.monitoring) return;
    Sentry.init({
      dsn: tenant.monitoring.sentry.dsn,
      environment: tenant.environment,
      sendDefaultPii: false,
      tracesSampleRate: 0,
      profilesSampleRate: 0,
      enableAutoPerformanceTracing: false,
      attachScreenshot: false,
      attachViewHierarchy: false,
      beforeSend: sanitizeSentryEvent,
      beforeBreadcrumb: sanitizeSentryBreadcrumb,
    });
    Sentry.setTag("tenant", tenant.id);
    Sentry.setTag("platform", Platform.OS);
    Sentry.setTag("app-version", Constants.nativeAppVersion ?? Constants.expoConfig?.version ?? "unknown");
    Sentry.setTag("build-version", Constants.nativeBuildVersion ?? "unknown");
    Sentry.setTag("expo-update-id", Updates.updateId ?? "embedded");
    Sentry.setTag("expo-runtime-version", Updates.runtimeVersion ?? "unknown");
    Sentry.setTag("expo-is-embedded-update", String(Updates.isEmbeddedLaunch));
    setErrorReporter((error, context) => {
      let eventId: string | undefined;
      Sentry.withScope((scope) => {
        scope.setTag("operation", context.operation);
        if (context.tags) scope.setTags(context.tags);
        if (context.diagnostics) scope.setContext("diagnostics", context.diagnostics);
        eventId = Sentry.captureException(error);
      });
      return eventId;
    });
    initialized = true;
  } catch {
    // Monitoring cannot prevent the application from starting.
  }
};
