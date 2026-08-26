import { describe, expect, it } from "vitest";

import {
  renderDetailLines,
  renderError,
  renderHeader,
  renderStatusLine,
  renderSummary,
  supportsDecoratedOutput,
} from "../render";

describe("CLI presentation", () => {
  it("renders a compact guided header", () => {
    expect(renderHeader("Tenant preflight", "noam-mz · development", false)).toBe(
      "┌  Tenant preflight\n│\n◆  noam-mz · development\n│"
    );
  });

  it.each([
    ["pass", "Tenant configuration", "◇  Tenant configuration  passed"],
    ["warn", "Expo Doctor", "▲  Expo Doctor  warning"],
    ["fail", "Native configuration", "■  Native configuration  failed"],
    ["info", "Launch command", "◆  Launch command  ready"],
  ] as const)("renders %s statuses without relying on color", (status, label, expected) => {
    expect(renderStatusLine(status, label, false)).toBe(expected);
  });

  it("keeps detail and remediation lines in the visual guide", () => {
    expect(
      renderDetailLines(["17 of 18 checks passed", "Exercise the release smoke pass"], {
        remediationIndex: 1,
      })
    ).toBe("│  17 of 18 checks passed\n│  → Exercise the release smoke pass");
  });

  it("summarizes results and outcome in one footer", () => {
    expect(renderSummary({ pass: 8, warn: 2, fail: 1 })).toBe(
      "└  8 passed · 2 warnings · 1 failed"
    );
    expect(renderSummary({ pass: 8, warn: 0, fail: 0 })).toBe("└  8 passed · ready");
  });

  it("renders multiline failures with a distinct remediation", () => {
    expect(
      renderError("Unable to resolve tenant\nInvalid identifier", "Choose a valid tenant")
    ).toBe("■  Unable to resolve tenant\n│  Invalid identifier\n│\n└  → Choose a valid tenant");
  });

  it("disables decoration for NO_COLOR, CI, and redirected output", () => {
    expect(supportsDecoratedOutput({ isTTY: true, noColor: false, ci: false })).toBe(true);
    expect(supportsDecoratedOutput({ isTTY: true, noColor: true, ci: false })).toBe(false);
    expect(supportsDecoratedOutput({ isTTY: true, noColor: false, ci: true })).toBe(false);
    expect(supportsDecoratedOutput({ isTTY: false, noColor: false, ci: false })).toBe(false);
  });
});
