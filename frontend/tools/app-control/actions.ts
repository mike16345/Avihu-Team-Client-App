import { existsSync } from "node:fs";
import { delimiter, join } from "node:path";
import { getTenant } from "../../config/tenants/registry";
import { assertTenantEasActionAllowed } from "../../config/tenants/schema";
import type { AppSelection, CommandSpec, CommandStep } from "./types";
import { EAS_CLI_ARGS } from "../eas/constants";

export { EAS_CLI_ARGS } from "../eas/constants";

export const assertTenantActionAllowed = (
  tenant: ReturnType<typeof getTenant>,
  selection: AppSelection
): void => {
  if (selection.action === "build" || selection.action === "update") {
    assertTenantEasActionAllowed(tenant, `${selection.action} actions`);
  }

  if (tenant.kind !== "local") return;

  const forbidden =
    selection.action === "build" ||
    selection.action === "update" ||
    (selection.action === "preflight" && selection.mode === "release") ||
    (selection.action === "run" && selection.environment !== "development");

  if (forbidden) {
    const action =
      selection.action === "preflight" ? "release preflight" : `${selection.action} actions`;
    throw new Error(`Local tenant "${tenant.id}" cannot run ${action}`);
  }
};

const findAndroidJavaHome = (): string => {
  const override = process.env.APP_ANDROID_JAVA_HOME?.trim();
  if (override) {
    return override;
  }

  const candidates = [
    process.env.JAVA_HOME_17_ARM64,
    process.env.JAVA_HOME_17_X64,
    process.platform === "darwin" ? "/opt/homebrew/opt/openjdk@17" : undefined,
    process.platform === "darwin" ? "/usr/local/opt/openjdk@17" : undefined,
    process.platform === "linux" ? "/usr/lib/jvm/java-17-openjdk" : undefined,
    process.platform === "linux" ? "/usr/lib/jvm/java-17-openjdk-amd64" : undefined,
  ];
  const javaExecutable = process.platform === "win32" ? "java.exe" : "java";
  const javaHome = candidates.find(
    (candidate): candidate is string =>
      typeof candidate === "string" && existsSync(join(candidate, "bin", javaExecutable))
  );

  if (!javaHome) {
    throw new Error(
      "Java 17 is required for local Android builds. Install Java 17 or set APP_ANDROID_JAVA_HOME."
    );
  }

  return javaHome;
};

const getAndroidJavaEnvironment = (): Record<string, string> => {
  const javaHome = findAndroidJavaHome();
  const existingPath = process.env.PATH ?? "";

  return {
    JAVA_HOME: javaHome,
    PATH: [join(javaHome, "bin"), existingPath].filter(Boolean).join(delimiter),
  };
};

const createCommandStep = (
  selection: AppSelection,
  command: string,
  args: string[],
  label: string,
  extraEnv: Record<string, string> = {}
): CommandStep => ({
  command,
  args,
  env: {
    APP_TENANT: selection.tenantId,
    APP_ENV: selection.environment,
    ...extraEnv,
  },
  label,
});

const createCommandSpec = (
  selection: AppSelection,
  command: string,
  args: string[],
  label: string,
  extraEnv: Record<string, string> = {}
): CommandSpec => createCommandStep(selection, command, args, label, extraEnv);

const getDeviceArguments = (platform: "android" | "ios", device?: string): string[] => {
  if (!device || (platform === "android" && device.includes("._adb-tls-connect._tcp"))) {
    return ["--device"];
  }

  return ["--device", device];
};

const withAndroidDevicePreparation = (
  selection: AppSelection,
  command: CommandSpec
): CommandSpec => ({
  ...command,
  env: { ...command.env, ADB_MDNS_AUTO_CONNECT: "0" },
  prerequisite: createCommandStep(
    selection,
    "npx",
    ["tsx", "tools/app-control/prepareAndroidDevice.ts"],
    "Prepare Android devices",
    { ADB_MDNS_AUTO_CONNECT: "0" }
  ),
});

export const resolveAction = (selection: AppSelection): CommandSpec => {
  const tenant = getTenant(selection.tenantId);
  assertTenantActionAllowed(tenant, selection);
  const labelPrefix = `${tenant.displayName} (${selection.environment})`;

  switch (selection.action) {
    case "start":
      return createCommandSpec(selection, "npx", ["expo", "start", "-c"], `Start ${labelPrefix}`);
    case "run": {
      const isRelease = selection.environment !== "development";
      const buildArguments =
        selection.platform === "android"
          ? ["--variant", isRelease ? "release" : "debug"]
          : ["--configuration", isRelease ? "Release" : "Debug"];
      const deviceArguments = getDeviceArguments(selection.platform, selection.device);

      const command = createCommandSpec(
        selection,
        "npx",
        [
          "expo",
          `run:${selection.platform}`,
          ...buildArguments,
          ...deviceArguments,
          ...(isRelease ? ["--no-bundler"] : []),
        ],
        `Build and run ${labelPrefix} on ${selection.platform}`,
        selection.platform === "android" ? getAndroidJavaEnvironment() : {}
      );
      return selection.platform === "android"
        ? withAndroidDevicePreparation(selection, command)
        : command;
    }
    case "install": {
      const deviceArguments = getDeviceArguments(selection.platform, selection.device);
      const command = createCommandSpec(
        selection,
        "npx",
        [
          "expo",
          `run:${selection.platform}`,
          "--binary",
          selection.binaryPath,
          ...deviceArguments,
          "--no-bundler",
        ],
        `Install ${labelPrefix} on ${selection.platform}`
      );
      return selection.platform === "android"
        ? withAndroidDevicePreparation(selection, command)
        : command;
    }
    case "preflight":
      return createCommandSpec(
        selection,
        "npm",
        ["run", selection.mode === "release" ? "preflight:release" : "preflight"],
        `${selection.mode === "release" ? "Release" : "Fast"} preflight for ${labelPrefix}`
      );
    case "assets":
      return createCommandSpec(
        selection,
        "npm",
        ["run", `assets:${selection.operation}`],
        `${selection.operation === "generate" ? "Generate" : "Audit"} assets for ${labelPrefix}`
      );
    case "build": {
      const build = createCommandSpec(
        selection,
        "npx",
        [
          ...EAS_CLI_ARGS,
          "build",
          "--platform",
          selection.platform,
          "--profile",
          selection.profile,
        ],
        `Build ${labelPrefix} for ${selection.platform}`
      );
      return {
        ...build,
        prerequisite: createCommandStep(
          selection,
          "npm",
          ["run", "preflight:eas"],
          `EAS preflight for ${labelPrefix}`
        ),
      };
    }
    case "update": {
      const update = createCommandSpec(
        selection,
        "npx",
        [
          ...EAS_CLI_ARGS,
          "update",
          "--branch",
          selection.environment,
          "--environment",
          selection.environment,
          "--auto",
          "--non-interactive",
        ],
        `Publish update for ${labelPrefix}`
      );
      return {
        ...update,
        prerequisite: createCommandStep(
          selection,
          "npm",
          ["run", "preflight"],
          `Fast preflight for ${labelPrefix}`
        ),
      };
    }
  }
};
