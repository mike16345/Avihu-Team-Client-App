import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

interface AndroidManifest {
  "uses-permission"?: Array<{ $: Record<string, string> }>;
  "uses-feature"?: Array<{ $: Record<string, string> }>;
}

const require = createRequire(import.meta.url);
const plugin = require("../../plugins/withOptionalCameraFeature.js") as {
  applyOptionalCameraFeature: (manifest: AndroidManifest) => AndroidManifest;
};

describe("withOptionalCameraFeature", () => {
  it("adds one optional camera feature without changing permissions or other features", () => {
    const cameraPermission = { $: { "android:name": "android.permission.CAMERA" } };
    const autofocus = {
      $: {
        "android:name": "android.hardware.camera.autofocus",
        "android:required": "false",
      },
    };
    const manifest: AndroidManifest = {
      "uses-permission": [cameraPermission],
      "uses-feature": [autofocus],
    };

    plugin.applyOptionalCameraFeature(manifest);
    plugin.applyOptionalCameraFeature(manifest);

    expect(manifest["uses-permission"]).toEqual([cameraPermission]);
    expect(manifest["uses-feature"]).toEqual([
      autofocus,
      {
        $: {
          "android:name": "android.hardware.camera",
          "android:required": "false",
        },
      },
    ]);
  });

  it("normalizes an existing camera feature to optional instead of duplicating it", () => {
    const manifest: AndroidManifest = {
      "uses-feature": [
        {
          $: {
            "android:name": "android.hardware.camera",
            "android:required": "true",
            "android:version": "1",
          },
        },
      ],
    };

    plugin.applyOptionalCameraFeature(manifest);

    expect(manifest["uses-feature"]).toEqual([
      {
        $: {
          "android:name": "android.hardware.camera",
          "android:required": "false",
          "android:version": "1",
        },
      },
    ]);
  });
});
