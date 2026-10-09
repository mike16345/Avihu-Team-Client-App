import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { promisify } from "node:util";

interface SimulatorDevice {
  udid?: string;
}

interface ListedDevice {
  udid: string;
}

interface CompatibilityOptions {
  platform?: string;
  exists?: (path: string) => boolean;
  execute?: (command: string, args: string[]) => Promise<string>;
}

const requireExpo = createRequire(join(__dirname, "expoCli.ts"));
const execFileAsync = promisify(execFile);
const executeCommand = async (command: string, args: string[]): Promise<string> => {
  const result = await execFileAsync(command, args);
  return result.stdout;
};

// SDK 53's CLI predates Device Hub. Adapt its in-memory modules before the CLI loads them;
// never modify node_modules or Xcode. Revisit this adapter when upgrading the Expo SDK.
export const installDeviceHubCompatibility = async ({
  platform = process.platform,
  exists = existsSync,
  execute = executeCommand,
}: CompatibilityOptions = {}): Promise<boolean> => {
  if (platform !== "darwin") return false;

  let developerDirectory: string;
  try {
    developerDirectory = (await execute("xcode-select", ["-p"])).trim();
  } catch {
    // Metro also works without Xcode; Expo retains its own prerequisite diagnostics.
    return false;
  }

  const deviceHubPath = join(dirname(developerDirectory), "Applications", "DeviceHub.app");
  if (!exists(deviceHubPath)) return false;

  const packagePath = requireExpo.resolve("@expo/cli/package.json");
  const { version } = requireExpo(packagePath) as { version: string };
  if (version !== "0.24.24") {
    throw new Error(
      `Device Hub compatibility expects @expo/cli 0.24.24; found ${version}. Review the adapter after upgrading Expo.`
    );
  }

  const cliRoot = dirname(packagePath);
  const ensurePath = join(cliRoot, "build/src/start/platforms/ios/ensureSimulatorAppRunning.js");
  const prerequisitePath = join(cliRoot, "build/src/start/doctor/apple/SimulatorAppPrerequisite.js");
  const managerPath = join(cliRoot, "build/src/start/platforms/ios/AppleDeviceManager.js");

  // Xcode 27 can include simulator UDIDs in devicectl's connected-device list. Expo merges
  // that list first, so its UDID deduplication would otherwise classify them as physical.
  const connectedPath = join(cliRoot, "build/src/run/ios/appleDevice/AppleDevice.js");
  const simctlPath = join(cliRoot, "build/src/start/platforms/ios/simctl.js");
  const connectedDevices = requireExpo(connectedPath) as {
    getConnectedDevicesAsync: () => Promise<ListedDevice[]>;
  };
  const simctl = requireExpo(simctlPath) as { getDevicesAsync: () => Promise<ListedDevice[]> };
  const connectedModule = requireExpo.cache[connectedPath];
  if (!connectedModule) throw new Error("Unable to load Expo's iOS device discovery");
  connectedModule.exports = {
    ...connectedDevices,
    getConnectedDevicesAsync: async () => {
      const [connected, simulators] = await Promise.all([
        connectedDevices.getConnectedDevicesAsync(),
        simctl.getDevicesAsync(),
      ]);
      const simulatorIds = new Set(simulators.map((device) => device.udid));
      return connected.filter((device) => !simulatorIds.has(device.udid));
    },
  };

  const openDeviceHub = async (device: SimulatorDevice): Promise<void> => {
    const args = ["-a", deviceHubPath];
    if (device.udid) {
      args.push(`devices://device/open?id=${encodeURIComponent(device.udid)}`);
    }
    await execute("open", args);
  };

  const originalEnsure = requireExpo(ensurePath) as Record<string, unknown>;
  const ensureModule = requireExpo.cache[ensurePath];
  if (!ensureModule) throw new Error("Unable to load Expo's simulator launcher");
  ensureModule.exports = {
    ...originalEnsure,
    ensureSimulatorAppRunningAsync: openDeviceHub,
  };

  const { SimulatorAppPrerequisite } = requireExpo(prerequisitePath) as {
    SimulatorAppPrerequisite: {
      prototype: { assertImplementation: () => Promise<void> };
      instance: { resetAssertion: () => void };
    };
  };
  SimulatorAppPrerequisite.prototype.assertImplementation = async () => {
    await execute("xcrun", ["simctl", "help"]);
  };
  // Prerequisite binds and memoizes the original method when its singleton is constructed.
  SimulatorAppPrerequisite.instance.resetAssertion();

  const { AppleDeviceManager } = requireExpo(managerPath) as {
    AppleDeviceManager: {
      prototype: { device: SimulatorDevice; activateWindowAsync: () => Promise<void> };
    };
  };
  AppleDeviceManager.prototype.activateWindowAsync = async function () {
    await openDeviceHub(this.device);
  };

  return true;
};
