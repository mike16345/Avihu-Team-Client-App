import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { E2E_TEST_IDS } from "../../../src/constants/e2e";

const workspace = resolve(process.cwd(), ".maestro");

const EXPECTED_TOP_LEVEL_FLOWS = [
  "01-fresh-launch.yaml",
  "02-login-validation.yaml",
  "03-rejected-login.yaml",
  "04-successful-login.yaml",
  "05-navigation-and-logout.yaml",
  "06-forgot-password-navigation.yaml",
  "07-forgot-password-validation.yaml",
  "08-forgot-password-otp-validation.yaml",
  "09-session-restoration.yaml",
] as const;

const readWorkspace = () => {
  expect(existsSync(workspace), ".maestro workspace must exist").toBe(true);

  const topLevelFlows = readdirSync(workspace)
    .filter((name) => /^\d{2}-.*\.yaml$/.test(name))
    .sort();
  const subflows = readdirSync(resolve(workspace, "subflows"))
    .filter((name) => name.endsWith(".yaml"))
    .sort();
  const files = [...topLevelFlows, ...subflows.map((name) => `subflows/${name}`)];
  const contents = Object.fromEntries(
    files.map((name) => [name, readFileSync(resolve(workspace, name), "utf8")])
  );

  return { contents, topLevelFlows, allText: Object.values(contents).join("\n") };
};

describe("Maestro E2E flow contract", () => {
  it("defines the independently runnable authentication flows", () => {
    const { contents, topLevelFlows } = readWorkspace();

    expect(topLevelFlows).toEqual([...EXPECTED_TOP_LEVEL_FLOWS]);
    topLevelFlows.forEach((name) => {
      expect(contents[name]).toContain("appId: ${MAESTRO_APP_ID}");
    });
  });

  it("injects credentials only into flows that need the test account", () => {
    const { contents } = readWorkspace();

    for (const name of [
      "04-successful-login.yaml",
      "05-navigation-and-logout.yaml",
      "09-session-restoration.yaml",
    ]) {
      expect(contents[name]).toContain("${MAESTRO_E2E_EMAIL}");
      expect(contents[name]).toContain("${MAESTRO_E2E_PASSWORD}");
    }

    expect(contents["08-forgot-password-otp-validation.yaml"]).toContain("${MAESTRO_E2E_EMAIL}");
    expect(contents["08-forgot-password-otp-validation.yaml"]).not.toContain(
      "${MAESTRO_E2E_PASSWORD}"
    );
  });

  it("covers every critical stable selector", () => {
    const { allText } = readWorkspace();

    Object.values(E2E_TEST_IDS).forEach((testId) => expect(allText).toContain(testId));
  });

  it("contains no committed credentials, production URL, or mutation action", () => {
    const { allText } = readWorkspace();

    expect(allText).not.toMatch(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/);
    expect(allText).not.toMatch(/https?:\/\//i);
    expect(allText).not.toMatch(
      /\b(?:create|update|delete|save|submit workout|complete workout)\b/i
    );
  });

  it("keeps artifacts ignored and subflows out of top-level discovery", () => {
    const config = readFileSync(resolve(workspace, "config.yaml"), "utf8");
    const gitignore = readFileSync(resolve(process.cwd(), ".gitignore"), "utf8");

    expect(config).toContain('flows: ["0[1-9]-*.yaml"]');
    expect(config).toContain("testOutputDir: .maestro-artifacts");
    expect(gitignore).toMatch(/(?:^|\n)\.maestro-artifacts\/(?:\n|$)/);
  });

  it("uses fast, bounded interactions instead of Maestro's slower defaults", () => {
    const { contents, allText } = readWorkspace();

    expect(contents["subflows/fast-input.yaml"]).toContain(
      "evalScript: ${maestro.copiedText = TEXT}"
    );
    expect(contents["subflows/fast-input.yaml"]).toContain("- pasteText");
    expect(allText).not.toContain("- inputText:");

    const tapCount = allText.match(/^- tapOn:/gm)?.length ?? 0;
    const boundedTapCount = allText.match(/^    waitToSettleTimeoutMs: 500$/gm)?.length ?? 0;

    expect(tapCount).toBeGreaterThan(0);
    expect(boundedTapCount).toBe(tapCount);
  });
});
