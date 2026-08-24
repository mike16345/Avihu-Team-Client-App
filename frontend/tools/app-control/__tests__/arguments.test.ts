import { describe, expect, it } from "vitest";
import { parseAppArguments } from "../arguments";

describe("parseAppArguments", () => {
  it("requires an explicit tenant for confirmed non-interactive commands", () => {
    expect(() =>
      parseAppArguments(["build", "android", "--profile", "production", "--yes"])
    ).toThrowError("--tenant is required in non-interactive mode");
  });

  it("parses a confirmed Android production build", () => {
    expect(
      parseAppArguments([
        "build",
        "android",
        "--tenant",
        "avihu",
        "--profile",
        "production",
        "--yes",
      ])
    ).toMatchObject({
      action: "build",
      platform: "android",
      tenantId: "avihu",
      environment: "production",
      confirmed: true,
    });
  });

  it("rejects unknown tenants before a command can run", () => {
    expect(() =>
      parseAppArguments([
        "preflight",
        "--tenant",
        "missing",
        "--environment",
        "development",
        "--yes",
      ])
    ).toThrowError('Unknown tenant "missing"');
  });

  it("rejects unsupported action and platform combinations", () => {
    expect(() =>
      parseAppArguments([
        "preflight",
        "android",
        "--tenant",
        "avihu",
        "--environment",
        "development",
      ])
    ).toThrowError('Action "preflight" does not support platform "android"');
  });

  it("requires every build selection when confirmation bypasses prompts", () => {
    expect(() =>
      parseAppArguments(["build", "android", "--tenant", "avihu", "--yes"])
    ).toThrowError("--profile is required for build in non-interactive mode");
  });
});
