import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

const resolveSelection = (selection: string | true) => {
  const output = execFileSync(
    process.execPath,
    [
      "--import",
      "tsx",
      "-e",
      `
      const root = require('node:path').dirname(require.resolve('@expo/cli/package.json'));
      const simulator = {
        udid: '56C8B818-9FA6-4283-921D-DF529ED48951', name: 'iPhone 17',
        deviceTypeIdentifier: 'com.apple.CoreSimulator.SimDeviceType.iPhone-17',
        state: 'Booted', isAvailable: true, osType: 'iOS', osVersion: '26.5',
      };
      const physical = { udid: 'physical-phone', name: 'Real iPhone', deviceType: 'device', osType: 'iOS' };
      const replace = (path, overrides) => {
        const original = require(path);
        require.cache[path].exports = { ...original, ...overrides };
      };
      // Mock only native enumeration/boot and the chooser, retaining Expo's resolver and classifier.
      replace(root + '/build/src/run/ios/appleDevice/AppleDevice.js', {
        getConnectedDevicesAsync: async () => [
          { ...physical, udid: simulator.udid, name: simulator.name }, physical,
        ],
      });
      replace(root + '/build/src/start/platforms/ios/simctl.js', {
        getDevicesAsync: async () => [simulator],
        getBootedSimulatorsAsync: async () => [simulator],
        bootAsync: async () => simulator,
      });
      replace(root + '/build/src/run/ios/options/promptDevice.js', {
        promptDeviceAsync: async devices => devices.find(device => device.name === 'iPhone 17'),
      });
      (async () => {
        await require('./tools/app-control/iosSimulatorCompatibility.ts').installDeviceHubCompatibility({
          platform: 'darwin', exists: () => true,
          execute: async command => command === 'xcode-select' ? '/Applications/Xcode.app/Contents/Developer' : '',
        });
        const { resolveDeviceAsync, isSimulatorDevice } = require(root + '/build/src/run/ios/options/resolveDevice.js');
        const { AppleDeviceManager } = require(root + '/build/src/start/platforms/ios/AppleDeviceManager.js');
        AppleDeviceManager.assertSystemRequirementsAsync = async () => {};
        const device = await resolveDeviceAsync(${JSON.stringify(selection)}, { osType: 'iOS' });
        console.log(JSON.stringify({ udid: device.udid, isSimulator: isSimulatorDevice(device) }));
      })().catch(error => { console.error(error); process.exitCode = 1; });
      `,
    ],
    { cwd: process.cwd(), encoding: "utf8" }
  );
  return JSON.parse(output.trim().split("\n").at(-1)!);
};

describe("Expo iOS build device discovery", () => {
  it.each(["56C8B818-9FA6-4283-921D-DF529ED48951", "iPhone 17", true] as const)(
    "classifies the simulator correctly when selected by %s despite a duplicate physical entry",
    (selection) => {
      expect(resolveSelection(selection)).toEqual({
        udid: "56C8B818-9FA6-4283-921D-DF529ED48951",
        isSimulator: true,
      });
    }
  );

  it("retains signing requirements for a real physical device", () => {
    expect(resolveSelection("physical-phone")).toEqual({
      udid: "physical-phone",
      isSimulator: false,
    });
  });
});
