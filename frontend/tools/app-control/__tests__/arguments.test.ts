import { describe, expect, it } from "vitest";
import { parseAppArguments } from "../arguments";

describe("parseAppArguments", () => {
  it("parses a direct local run for a named device", () => {
    expect(
      parseAppArguments([
        "run",
        "ios",
        "--tenant",
        "avihu",
        "--environment",
        "production",
        "--device",
        "iPhone 16 Pro",
        "--yes",
      ])
    ).toMatchObject({
      action: "run",
      platform: "ios",
      device: "iPhone 16 Pro",
    });
  });

  it("parses installing an existing binary on a named device", () => {
    expect(
      parseAppArguments([
        "install",
        "android",
        "--tenant",
        "avihu",
        "--environment",
        "production",
        "--binary",
        "/tmp/elevate-coach.apk",
        "--device",
        "Pixel_9_API_36",
        "--yes",
      ])
    ).toMatchObject({
      action: "install",
      platform: "android",
      binaryPath: "/tmp/elevate-coach.apk",
      device: "Pixel_9_API_36",
    });
  });

  it("requires a binary path for confirmed install commands", () => {
    expect(() =>
      parseAppArguments([
        "install",
        "android",
        "--tenant",
        "avihu",
        "--environment",
        "production",
        "--yes",
      ])
    ).toThrowError("--binary is required for install in non-interactive mode");
  });

  it("rejects binary paths for actions that do not install existing builds", () => {
    expect(() =>
      parseAppArguments([
        "run",
        "android",
        "--tenant",
        "avihu",
        "--environment",
        "production",
        "--binary",
        "/tmp/elevate-coach.apk",
      ])
    ).toThrowError("--binary is only supported for install actions");
  });

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

  it("parses a confirmed Android development build", () => {
    expect(
      parseAppArguments([
        "build",
        "android",
        "--tenant",
        "avihu",
        "--profile",
        "development",
        "--yes",
      ])
    ).toMatchObject({
      action: "build",
      platform: "android",
      tenantId: "avihu",
      environment: "development",
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
