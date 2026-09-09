import { describe, expect, it } from "vitest";

import { runChecks } from "../engine";
import { renderHuman } from "../renderHuman";
import { renderJson } from "../renderJson";

describe("runChecks", () => {
  it("aggregates result statuses into counts and a failure exit code", async () => {
    const report = await runChecks([
      async () => ({ status: "pass", check: "one", summary: "ok" }),
      async () => ({
        status: "fail",
        check: "two",
        summary: "broken",
        remediation: "Fix two",
      }),
    ]);

    expect(report.counts).toEqual({ pass: 1, warn: 0, fail: 1 });
    expect(report.exitCode).toBe(1);
  });

  it("preserves definition order while checks resolve concurrently", async () => {
    const completionOrder: string[] = [];
    const report = await runChecks([
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 20));
        completionOrder.push("slow");
        return { status: "pass" as const, check: "slow", summary: "finished second" };
      },
      async () => {
        completionOrder.push("fast");
        return { status: "warn" as const, check: "fast", summary: "finished first" };
      },
    ]);

    expect(completionOrder).toEqual(["fast", "slow"]);
    expect(report.results.map(({ check }) => check)).toEqual(["slow", "fast"]);
  });

  it("converts an unexpected exception into a failure for the declared check", async () => {
    const report = await runChecks([
      {
        check: "broken.check",
        run: async () => {
          throw new Error("unexpected issue");
        },
      },
    ]);

    expect(report.results).toEqual([
      expect.objectContaining({
        check: "broken.check",
        status: "fail",
        summary: "Check threw an unexpected error",
        details: ["unexpected issue"],
      }),
    ]);
  });

  it("uses an explicit function check ID when that check throws", async () => {
    const throwingCheck = Object.assign(
      async () => {
        throw new Error("unexpected issue");
      },
      { check: "function.check" }
    );

    const report = await runChecks([throwingCheck]);

    expect(report.results[0]).toMatchObject({ check: "function.check", status: "fail" });
  });

  it("provides checks with an immutable context", async () => {
    const report = await runChecks(
      [
        (context) => {
          expect(Object.isFrozen(context)).toBe(true);
          expect(context.tenant).toBe("avihu");
          return { status: "pass" as const, check: "context", summary: "received" };
        },
      ],
      { tenant: "avihu", environment: "production", timestamp: "2026-08-24T00:00:00.000Z" }
    );

    expect(report.tenant).toBe("avihu");
    expect(report.environment).toBe("production");
  });
});

describe("preflight renderers", () => {
  it("groups human results and prints remediation only for non-pass results", async () => {
    const report = await runChecks([
      async () => ({ status: "pass", check: "one", summary: "ok", remediation: "not shown" }),
      async () => ({ status: "warn", check: "two", summary: "review", remediation: "Do this" }),
      async () => ({ status: "fail", check: "three", summary: "broken", remediation: "Fix this" }),
    ]);

    const output = renderHuman(report);

    expect(output).toContain("◇  One  passed");
    expect(output).toContain("▲  Two  warning");
    expect(output).toContain("■  Three  failed");
    expect(output).not.toContain("not shown");
    expect(output).toContain("│  → Do this");
    expect(output).toContain("│  → Fix this");
  });

  it("serializes a stable machine-readable report without ANSI escape codes", async () => {
    const report = await runChecks(
      [async () => ({ status: "warn", check: "one", summary: "\u001b[31mwarning\u001b[0m" })],
      { tenant: "avihu", environment: "production", timestamp: "2026-08-24T00:00:00.000Z" }
    );

    const output = renderJson(report);

    expect(output).not.toMatch(/\u001B\[/);
    expect(JSON.parse(output)).toMatchObject({
      schemaVersion: 1,
      tenant: "avihu",
      environment: "production",
      timestamp: "2026-08-24T00:00:00.000Z",
      counts: { pass: 0, warn: 1, fail: 0 },
      exitCode: 0,
      results: [{ check: "one", summary: "warning" }],
    });
  });

  it("removes an OSC title sequence terminated by BEL without changing surrounding text", async () => {
    const report = await runChecks([
      async () => ({
        status: "warn",
        check: "one",
        summary: "title\u001b]0;release\u0007done",
      }),
    ]);

    const output = renderJson(report);

    expect(output).not.toContain("\u001b");
    expect(JSON.parse(output).results[0].summary).toBe("titledone");
  });

  it("removes an OSC title sequence terminated by ST without changing surrounding text", async () => {
    const report = await runChecks([
      async () => ({
        status: "warn",
        check: "one",
        summary: "title\u001b]0;release\u001b\\done",
      }),
    ]);

    const output = renderJson(report);

    expect(output).not.toContain("\u001b");
    expect(JSON.parse(output).results[0].summary).toBe("titledone");
  });
});
