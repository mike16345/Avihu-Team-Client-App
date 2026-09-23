import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

interface AndroidManifest {
  application?: Array<{ $: Record<string, string> }>;
}

const require = createRequire(import.meta.url);
const plugin = require("../../plugins/withAndroidBackCompatibility.js") as {
  applyAndroidBackCompatibility: (manifest: AndroidManifest) => AndroidManifest;
};

describe("withAndroidBackCompatibility", () => {
  it("opts the application out of predictive back without changing its other attributes", () => {
    const manifest: AndroidManifest = {
      application: [
        {
          $: {
            "android:name": ".MainApplication",
            "android:label": "@string/app_name",
            "android:enableOnBackInvokedCallback": "true",
          },
        },
      ],
    };

    plugin.applyAndroidBackCompatibility(manifest);
    plugin.applyAndroidBackCompatibility(manifest);

    expect(manifest.application).toEqual([
      {
        $: {
          "android:name": ".MainApplication",
          "android:label": "@string/app_name",
          "android:enableOnBackInvokedCallback": "false",
        },
      },
    ]);
  });
});
