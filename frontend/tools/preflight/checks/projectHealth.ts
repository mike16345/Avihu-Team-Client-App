import { createProcessCheck, type ProcessPreflightContext } from "../processCheck";
import type { CheckDefinition, CheckResult } from "../types";

const getAndroidBuildProperties = (context: Readonly<ProcessPreflightContext>) => {
  const plugin = context.expoConfig.plugins?.find((candidate) => {
    const name = typeof candidate === "string" ? candidate : candidate[0];
    return name === "expo-build-properties";
  });

  if (!plugin || typeof plugin === "string" || !plugin[1] || typeof plugin[1] !== "object") {
    return {};
  }

  const android = (plugin[1] as Record<string, unknown>).android;
  return android && typeof android === "object" ? (android as Record<string, unknown>) : {};
};

const androidR8Check: CheckDefinition<ProcessPreflightContext> = {
  check: "android.r8",
  run: (context): CheckResult => {
    const properties = getAndroidBuildProperties(context);
    const r8Enabled = properties.enableProguardInReleaseBuilds === true;
    const shrinkingEnabled = properties.enableShrinkResourcesInReleaseBuilds === true;

    if (!r8Enabled || !shrinkingEnabled) {
      return {
        status: "warn",
        check: "android.r8",
        summary: "Android release shrinking is not fully enabled",
        details: [
          `R8: ${r8Enabled ? "enabled" : "disabled"}`,
          `Resource shrinking: ${shrinkingEnabled ? "enabled" : "disabled"}`,
        ],
        remediation: "Complete Task 10, then regenerate Android and rerun release preflight.",
      };
    }

    return {
      status: "pass",
      check: "android.r8",
      summary: "Android R8 and resource shrinking are enabled",
    };
  },
};

const androidEdgeToEdgeCheck: CheckDefinition<ProcessPreflightContext> = {
  check: "android.edge-to-edge",
  run: (context): CheckResult => {
    if (context.expoConfig.android?.edgeToEdgeEnabled !== true) {
      return {
        status: "warn",
        check: "android.edge-to-edge",
        summary: "Android edge-to-edge is not enabled",
        remediation: "Complete Task 11, then regenerate Android and rerun release preflight.",
      };
    }

    return {
      status: "pass",
      check: "android.edge-to-edge",
      summary: "Android edge-to-edge policy is enabled",
    };
  },
};

const androidLargeScreenCheck: CheckDefinition<ProcessPreflightContext> = {
  check: "android.large-screen-adaptability",
  run: (context): CheckResult => {
    if (context.expoConfig.orientation === "portrait") {
      return {
        status: "warn",
        check: "android.large-screen-adaptability",
        summary: "Phone layouts intentionally prefer portrait orientation",
        details: ["Android may override orientation restrictions on larger screens."],
        remediation: "Review portrait and large-screen behavior during the release smoke pass.",
      };
    }

    return {
      status: "pass",
      check: "android.large-screen-adaptability",
      summary: "Android orientation does not impose the accepted portrait limitation",
    };
  },
};

const iosPlatformPolicyCheck: CheckDefinition<ProcessPreflightContext> = {
  check: "ios.platform-policy",
  run: (context): CheckResult => {
    const missing: string[] = [];
    const { permissions } = context.tenantConfig;

    if (!context.expoConfig.ios?.bundleIdentifier) {
      missing.push("iOS bundle identifier");
    }
    if (!permissions.camera.trim()) {
      missing.push("camera usage description");
    }
    if (!permissions.photos.trim()) {
      missing.push("photo-library usage description");
    }
    if (!permissions.healthShare.trim() || !permissions.healthUpdate.trim()) {
      missing.push("Health usage descriptions");
    }

    if (missing.length > 0) {
      return {
        status: "fail",
        check: "ios.platform-policy",
        summary: "iOS release policy is incomplete",
        details: missing.map((name) => `Missing: ${name}`),
        remediation: "Complete the selected tenant's iOS identity and permission descriptions.",
      };
    }

    return {
      status: "pass",
      check: "ios.platform-policy",
      summary: "iOS identity and permission policy is complete",
    };
  },
};

const expoDoctorProcess = createProcessCheck({
  check: "expo.doctor",
  command: "npx",
  args: ["--yes", "expo-doctor@1.20.2"],
  successSummary: "Expo Doctor passed",
  failureSummary: "Expo Doctor reported project-health findings",
  remediation: "Run npx --yes expo-doctor@1.20.2 and resolve each unacknowledged finding.",
});

const nativeMaintenanceCheck: CheckDefinition<ProcessPreflightContext> = {
  check: "dependencies.native-maintenance",
  run: async (context): Promise<CheckResult> => {
    const result = await expoDoctorProcess.run(context);
    if (result.status === "pass") {
      return { ...result, check: "dependencies.native-maintenance" };
    }

    const evidence = result.details?.join("\n") ?? "";
    const isOnlyAcknowledgedFinding =
      evidence.includes("1 check failed") &&
      evidence.includes("Validate packages against React Native Directory") &&
      evidence.includes("react-native-health") &&
      evidence.includes("react-native-infinite-wheel-picker") &&
      evidence.includes("expo-health-connect");

    if (!isOnlyAcknowledgedFinding) {
      return result;
    }

    return {
      ...result,
      status: "warn",
      check: "dependencies.native-maintenance",
      summary: "Expo Doctor reported only acknowledged native maintenance findings",
      remediation:
        "Exercise the owned health and wheel-picker integrations during the release smoke pass.",
    };
  },
};

export const createProjectHealthChecks = (): CheckDefinition<ProcessPreflightContext>[] => [
  createProcessCheck({
    check: "project.typescript",
    command: "npm",
    args: ["run", "typecheck"],
    successSummary: "TypeScript compilation passed",
    failureSummary: "TypeScript compilation failed",
    remediation: "Run npm run typecheck and fix the reported errors.",
  }),
  createProcessCheck({
    check: "tests.unit",
    command: "npm",
    args: ["run", "test:unit"],
    successSummary: "Unit tests passed",
    failureSummary: "Unit tests failed",
    remediation: "Run npm run test:unit and fix the failing tests.",
  }),
  nativeMaintenanceCheck,
  createProcessCheck({
    check: "expo.install",
    command: "npx",
    args: ["expo", "install", "--check"],
    successSummary: "Expo dependency versions are compatible",
    failureSummary: "Expo dependency versions are incompatible",
    remediation: "Run npx expo install --fix, review the changes, and rerun preflight.",
  }),
];

export const createPlatformPolicyChecks = (): CheckDefinition<ProcessPreflightContext>[] => [
  androidR8Check,
  androidEdgeToEdgeCheck,
  androidLargeScreenCheck,
  iosPlatformPolicyCheck,
];
