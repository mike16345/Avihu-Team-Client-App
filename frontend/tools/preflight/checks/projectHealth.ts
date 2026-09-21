import {
  createProcessCheck,
  executeProcessCheck,
  type ProcessPreflightContext,
} from "../processCheck";
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

const samePackages = (actual: string[], expected: string[]) =>
  actual.length === expected.length && actual.every((value, index) => value === expected[index]);

const parseDoctorCategories = (output: string) => {
  const blockStart = output.indexOf("Validate packages against React Native Directory");
  if (blockStart < 0) return [];
  const block = output.slice(blockStart).split(/^\s*Advice:\s*$/mu)[0];
  return block
    .split(/\r?\n/u)
    .map((line) => line.match(/^\s*([^:]+):\s*(.+)$/u))
    .filter((match): match is RegExpMatchArray => match !== null)
    .map((match) => ({
      category: match[1].trim(),
      packages: match[2]
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
        .sort(),
    }));
};

const nativeMaintenanceCheck: CheckDefinition<ProcessPreflightContext> = {
  check: "expo.doctor",
  run: async (context): Promise<CheckResult> => {
    const execution = await executeProcessCheck(
      {
        check: "expo.doctor",
        command: "npx",
        args: ["--yes", "expo-doctor@1.20.2"],
        successSummary: "Expo Doctor passed",
        failureSummary: "Expo Doctor reported project-health findings",
        remediation: "Run npx --yes expo-doctor@1.20.2 and resolve each unacknowledged finding.",
      },
      context
    );
    const result = execution.result;
    if (result.status === "pass") {
      return result;
    }

    const evidence = `${execution.sanitizedStdout}\n${execution.sanitizedStderr}`;
    const categories = parseDoctorCategories(evidence);
    const expectedCategories = [
      {
        category: "Untested on New Architecture",
        packages: ["react-native-health", "react-native-infinite-wheel-picker"],
      },
      {
        category: "Unmaintained",
        packages: ["expo-health-connect", "react-native-infinite-wheel-picker"],
      },
    ];
    const isOnlyAcknowledgedFinding =
      !execution.outputTruncated &&
      /(?:^|\n)1 check failed(?:,|\.|\n)/u.test(evidence) &&
      (evidence.match(/^✖/gmu)?.length ?? 0) === 1 &&
      evidence.includes("Validate packages against React Native Directory") &&
      categories.length === expectedCategories.length &&
      expectedCategories.every((expected) => {
        const matches = categories.filter(({ category }) => category === expected.category);
        return matches.length === 1 && samePackages(matches[0].packages, expected.packages);
      });

    if (!isOnlyAcknowledgedFinding) {
      return result;
    }

    return {
      ...result,
      status: "warn",
      check: "expo.doctor",
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

export const createPlatformPolicyChecks = (
  platforms: readonly ("ios" | "android")[]
): CheckDefinition<ProcessPreflightContext>[] => [
  ...(platforms.includes("android")
    ? [androidR8Check, androidEdgeToEdgeCheck, androidLargeScreenCheck]
    : []),
  ...(platforms.includes("ios") ? [iosPlatformPolicyCheck] : []),
];
