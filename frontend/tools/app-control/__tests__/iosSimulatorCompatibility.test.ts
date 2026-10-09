import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

// Isolate Expo's module cache while exercising its installed prerequisite and device manager.
const probe = (platform: string, hasDeviceHub: boolean, failure = "") =>
  JSON.parse(
    execFileSync(
      process.execPath,
      [
        "--import",
        "tsx",
        "-e",
        `
        const { installDeviceHubCompatibility } = require('./tools/app-control/iosSimulatorCompatibility.ts');
        const calls = [];
        (async () => {
          const active = await installDeviceHubCompatibility({
            platform: ${JSON.stringify(platform)},
            exists: () => ${hasDeviceHub},
            execute: async (command, args) => {
              calls.push([command, args]);
              if (command === 'xcode-select') return '/Applications/Xcode Custom.app/Contents/Developer\\n';
              if (command === ${JSON.stringify(failure)}) throw new Error('command failed');
              return '';
            },
          });
          if (active) {
            const root = require('node:path').dirname(require.resolve('@expo/cli/package.json'));
            const { SimulatorAppPrerequisite } = require(root + '/build/src/start/doctor/apple/SimulatorAppPrerequisite.js');
            await SimulatorAppPrerequisite.instance.assertAsync();
            const { AppleDeviceManager } = require(root + '/build/src/start/platforms/ios/AppleDeviceManager.js');
            await new AppleDeviceManager({ udid: 'selected-iphone', name: 'iPhone', osType: 'iOS' }).activateWindowAsync();
          }
          console.log(JSON.stringify({ active, calls }));
        })().catch(error => console.log(JSON.stringify({ error: error.message, calls })));
        `,
      ],
      { cwd: process.cwd(), encoding: "utf8" }
    ).trim()
  );

describe("Expo Device Hub compatibility", () => {
  it("validates simctl and focuses the requested simulator without Simulator.app", () => {
    expect(probe("darwin", true)).toEqual({
      active: true,
      calls: [
        ["xcode-select", ["-p"]],
        ["xcrun", ["simctl", "help"]],
        [
          "open",
          [
            "-a",
            "/Applications/Xcode Custom.app/Contents/Applications/DeviceHub.app",
            "devices://device/open?id=selected-iphone",
          ],
        ],
      ],
    });
  });

  it("leaves the legacy launcher intact when selected Xcode has no Device Hub", () => {
    expect(probe("darwin", false)).toEqual({
      active: false,
      calls: [["xcode-select", ["-p"]]],
    });
  });

  it("does not inspect Xcode on non-macOS hosts", () => {
    expect(probe("linux", true)).toEqual({ active: false, calls: [] });
  });

  it("preserves the simctl prerequisite failure", () => {
    expect(probe("darwin", true, "xcrun").error).toBe("command failed");
  });

  it("reports a Device Hub launch failure instead of claiming the simulator opened", () => {
    expect(probe("darwin", true, "open").error).toBe("command failed");
  });
});
