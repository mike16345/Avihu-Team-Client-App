import { describe, expect, it } from "vitest";

import { renderHuman } from "../renderHuman";
import type { PreflightReport } from "../types";

const report: PreflightReport = {
  schemaVersion: 1,
  tenant: "noam-mz",
  environment: "development",
  timestamp: "2026-08-26T04:18:50.564Z",
  counts: { pass: 1, warn: 1, fail: 1 },
  results: [
    {
      status: "pass",
      check: "tenant.config",
      summary: "Tenant configuration is valid",
      details: ["Tenant: noam-mz", "This successful detail should stay compact"],
    },
    {
      status: "warn",
      check: "expo.doctor",
      summary: "Expo Doctor needs maintenance review",
      details: ["17 of 18 checks passed"],
      policy: {
        originalStatus: "fail",
        reason: "Owned native maintenance finding",
        acknowledged: true,
      },
      remediation: "Exercise the integration during the release smoke pass.",
    },
    {
      status: "fail",
      check: "native.drift",
      summary: "Generated native configuration is stale",
      details: ["Android package does not match"],
      remediation: "Run a clean Expo prebuild.",
    },
  ],
  exitCode: 1,
};

describe("renderHuman", () => {
  it("keeps passes compact and expands warnings and failures", () => {
    const output = renderHuman(report, false);

    expect(output).toContain("┌  Tenant preflight");
    expect(output).toContain("◆  noam-mz · development");
    expect(output).toContain("◇  Tenant configuration  passed");
    expect(output).not.toContain("This successful detail should stay compact");
    expect(output).toContain("▲  Expo Doctor  warning");
    expect(output).toContain("│  Expo Doctor needs maintenance review");
    expect(output).toContain("│  17 of 18 checks passed");
    expect(output).toContain("│  Policy: Owned native maintenance finding");
    expect(output).toContain("│  → Exercise the integration during the release smoke pass.");
    expect(output).toContain("■  Native configuration  failed");
    expect(output).toContain("│  → Run a clean Expo prebuild.");
    expect(output).toContain("└  1 passed · 1 warning · 1 failed");
    expect(output).not.toContain("Exit code:");
    expect(output).not.toContain("PASS (");
  });

  it("omits empty status sections and ends successful reports with ready", () => {
    const output = renderHuman(
      {
        ...report,
        counts: { pass: 1, warn: 0, fail: 0 },
        results: [report.results[0]],
        exitCode: 0,
      },
      false
    );

    expect(output).not.toContain("warning");
    expect(output).not.toContain("failed");
    expect(output).toContain("└  1 passed · ready");
  });

  it("collapses verbose warning detail while retaining its sanitized log", () => {
    const output = renderHuman(
      {
        ...report,
        counts: { pass: 0, warn: 1, fail: 0 },
        results: [
          {
            status: "warn",
            check: "expo.doctor",
            summary: "Expo Doctor needs maintenance review",
            details: [
              "Command: expo-doctor",
              "Exit code: 1",
              "detail three",
              "detail four",
              "detail five",
              "Full sanitized log: /tmp/expo.doctor.log",
            ],
            remediation: "Review the integration.",
          },
        ],
        exitCode: 0,
      },
      false
    );

    expect(output).toContain("│  Command: expo-doctor");
    expect(output).toContain("│  Exit code: 1");
    expect(output).toContain("│  … 3 more details in sanitized log");
    expect(output).toContain("│  Full sanitized log: /tmp/expo.doctor.log");
    expect(output).not.toContain("detail three");
  });
});
