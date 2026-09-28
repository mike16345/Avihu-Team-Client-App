import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { E2E_TEST_IDS } from "../../../src/constants/e2e";

const workspace = resolve(process.cwd(), ".maestro");

const readWorkspace = () => {
  expect(existsSync(workspace), ".maestro workspace must exist").toBe(true);

  const topLevelFlows = readdirSync(workspace)
    .filter((name) => /^0[1-5]-.*\.yaml$/.test(name))
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
  it("defines exactly five independently runnable numbered flows", () => {
    const { contents, topLevelFlows } = readWorkspace();

    expect(topLevelFlows).toHaveLength(5);
    topLevelFlows.forEach((name) => {
      expect(contents[name]).toContain("appId: ${MAESTRO_APP_ID}");
    });
  });

  it("injects credentials into both authenticated flows", () => {
    const { contents } = readWorkspace();

    for (const name of ["04-successful-login.yaml", "05-navigation-and-logout.yaml"]) {
      expect(contents[name]).toContain("${MAESTRO_E2E_EMAIL}");
      expect(contents[name]).toContain("${MAESTRO_E2E_PASSWORD}");
    }
  });

  it("covers every critical stable selector", () => {
    const { allText } = readWorkspace();

    Object.values(E2E_TEST_IDS).forEach((testId) => expect(allText).toContain(testId));
  });

  it("contains no committed credentials, production URL, or mutation action", () => {
    const { allText } = readWorkspace();

    expect(allText).not.toMatch(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/);
    expect(allText).not.toMatch(/https?:\/\//i);
    expect(allText).not.toMatch(/\b(?:create|update|delete|save|submit workout|complete workout)\b/i);
  });

  it("keeps artifacts ignored and subflows out of top-level discovery", () => {
    const config = readFileSync(resolve(workspace, "config.yaml"), "utf8");
    const gitignore = readFileSync(resolve(process.cwd(), ".gitignore"), "utf8");

    expect(config).toContain('flows: ["0[1-5]-*.yaml"]');
    expect(config).toContain("testOutputDir: .maestro-artifacts");
    expect(gitignore).toMatch(/(?:^|\n)\.maestro-artifacts\/(?:\n|$)/);
  });
});
