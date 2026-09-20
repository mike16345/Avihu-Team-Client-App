import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const plugin =
  require("../../native-modules/live-steps-activity/plugin/withLiveStepsActivity.js") as {
    renderIosBridgeSource: (source: string, displayName: string) => string;
  };

const templatePath = path.resolve(
  import.meta.dirname,
  "../../native-modules/live-steps-activity/ios-template/RNLiveSteps.swift"
);

describe("withLiveStepsActivity", () => {
  it("renders the resolved tenant name into the iOS Live Activity bridge", () => {
    const source = readFileSync(templatePath, "utf8");
    const rendered = plugin.renderIosBridgeSource(source, "Elevate Coach");

    expect(rendered).toContain('StepsActivityAttributes(trainerName: "Elevate Coach")');
    expect(rendered).not.toContain("__APP_DISPLAY_NAME__");
    expect(rendered).not.toContain("Avihu Team");
  });

  it("escapes tenant names before creating a Swift string literal", () => {
    const rendered = plugin.renderIosBridgeSource(
      'let attrs = StepsActivityAttributes(trainerName: "__APP_DISPLAY_NAME__")',
      'Elevate "North"'
    );

    expect(rendered).toBe(
      'let attrs = StepsActivityAttributes(trainerName: "Elevate \\"North\\"")'
    );
  });

  it("rejects a native template that has lost its tenant-name marker", () => {
    expect(() => plugin.renderIosBridgeSource("let name = 1", "Elevate Coach")).toThrow(
      "display-name marker"
    );
  });
});
