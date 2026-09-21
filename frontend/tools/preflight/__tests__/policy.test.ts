import { describe, expect, it } from "vitest";

import { applyPolicy } from "../policy";
import type { CheckResult } from "../types";

const warning = (check: string): CheckResult => ({
  status: "warn",
  check,
  summary: "Needs review",
  details: ["Original evidence"],
});

describe("applyPolicy", () => {
  it("promotes release-blocking warnings to failures without losing evidence", () => {
    const result = applyPolicy(warning("tests.unit"), {
      mode: "release",
      now: new Date("2026-08-24T00:00:00.000Z"),
    });

    expect(result).toMatchObject({
      status: "fail",
      check: "tests.unit",
      details: ["Original evidence"],
      policy: { originalStatus: "warn" },
    });
  });

  it("recalculates report counts and exit code after applying release policy", () => {
    const report = applyPolicy(
      {
        schemaVersion: 1,
        tenant: "avihu",
        environment: "production",
        timestamp: "2026-08-24T00:00:00.000Z",
        counts: { pass: 0, warn: 1, fail: 0 },
        results: [warning("tests.unit")],
        exitCode: 0,
      },
      { mode: "release", now: new Date("2026-08-24T00:00:00.000Z") }
    );

    expect(report).toMatchObject({
      counts: { pass: 0, warn: 0, fail: 1 },
      exitCode: 1,
      results: [{ status: "fail", check: "tests.unit" }],
    });
  });

  it("keeps the large-screen acknowledgement visible as a warning before its review date", () => {
    const result = applyPolicy(warning("android.large-screen-adaptability"), {
      mode: "release",
      now: new Date("2026-08-24T00:00:00.000Z"),
    });

    expect(result).toMatchObject({
      status: "warn",
      check: "android.large-screen-adaptability",
      details: ["Original evidence"],
      policy: {
        acknowledged: true,
        reviewDate: "2027-01-15",
        reason:
          "Phone-first portrait product; maintain usability when Android overrides restrictions.",
      },
    });
  });

  it("fails an acknowledged warning after its review date", () => {
    const result = applyPolicy(warning("android.large-screen-adaptability"), {
      mode: "release",
      now: new Date("2027-01-16T00:00:00.000Z"),
    });

    expect(result).toMatchObject({
      status: "fail",
      policy: {
        acknowledged: true,
        reviewDate: "2027-01-15",
        expired: true,
      },
    });
  });

  it("does not retain an orphan policy downgrade for the retired native-maintenance ID", () => {
    const result = applyPolicy(
      { status: "fail", check: "dependencies.native-maintenance", summary: "Expo Doctor finding" },
      { mode: "release", now: new Date("2026-08-24T00:00:00.000Z") }
    );

    expect(result).toMatchObject({ status: "fail" });
    expect(result).not.toHaveProperty("policy");
  });
});
