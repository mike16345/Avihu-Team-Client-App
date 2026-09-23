import { beforeEach, describe, expect, it, vi } from "vitest";

const promptMocks = vi.hoisted(() => ({
  box: vi.fn(),
  select: vi.fn(),
  text: vi.fn(),
}));

vi.mock("@clack/prompts", () => ({
  box: promptMocks.box,
  cancel: vi.fn(),
  confirm: vi.fn(),
  isCancel: (value: unknown) => typeof value === "symbol",
  path: vi.fn(),
  select: promptMocks.select,
  text: promptMocks.text,
}));

import { printSelectionSummary, promptForSelection } from "../prompts";

const backValue = (prompt: { options: Array<{ value: unknown; label?: string }> }) =>
  prompt.options.find((option) => option.label === "← Back")?.value;

const optionValue =
  (label: string) => (prompt: { options: Array<{ value: unknown; label?: string }> }) =>
    prompt.options.find((option) => option.label === label)?.value;

describe("interactive app-control navigation", () => {
  beforeEach(() => {
    promptMocks.box.mockReset();
    promptMocks.select.mockReset();
    promptMocks.text.mockReset();
  });

  it("offers the previous command after tenant choices and returns it directly", async () => {
    const previousSelection = {
      action: "run" as const,
      tenantId: "avihu",
      environment: "development" as const,
      platform: "android" as const,
    };
    promptMocks.select.mockImplementationOnce(
      (prompt: { options: Array<{ value: unknown; label?: string }> }) => {
        const previousIndex = prompt.options.findIndex(
          (option) => option.label === "Run previous command"
        );

        expect(previousIndex).toBe(prompt.options.length - 1);
        expect(previousIndex).toBeGreaterThan(0);
        return prompt.options[previousIndex].value;
      }
    );

    await expect(
      promptForSelection({ confirmed: false, dryRun: false }, previousSelection)
    ).resolves.toEqual(previousSelection);
    expect(promptMocks.select).toHaveBeenCalledTimes(1);
  });

  it("returns from a development action to the intent menu", async () => {
    promptMocks.select
      .mockResolvedValueOnce("avihu")
      .mockResolvedValueOnce("develop")
      .mockImplementationOnce(backValue)
      .mockResolvedValueOnce("verify")
      .mockResolvedValueOnce("development")
      .mockResolvedValueOnce("fast");

    await expect(promptForSelection({ confirmed: false, dryRun: false })).resolves.toMatchObject({
      action: "preflight",
      tenantId: "avihu",
      environment: "development",
      mode: "fast",
    });
  });

  it("returns from platform selection to environment selection", async () => {
    promptMocks.select
      .mockResolvedValueOnce("avihu")
      .mockResolvedValueOnce("develop")
      .mockResolvedValueOnce("run")
      .mockResolvedValueOnce("production")
      .mockImplementationOnce(backValue)
      .mockResolvedValueOnce("development")
      .mockResolvedValueOnce("android");

    await expect(promptForSelection({ confirmed: false, dryRun: false })).resolves.toMatchObject({
      action: "run",
      tenantId: "avihu",
      environment: "development",
      platform: "android",
    });
  });

  it("creates an EAS development build selection from the development menu", async () => {
    promptMocks.select
      .mockResolvedValueOnce("avihu")
      .mockResolvedValueOnce("develop")
      .mockImplementationOnce(optionValue("Build development client with EAS"))
      .mockResolvedValueOnce("ios");

    await expect(promptForSelection({ confirmed: false, dryRun: false })).resolves.toMatchObject({
      action: "build",
      tenantId: "avihu",
      environment: "development",
      profile: "development",
      platform: "ios",
      usePackageScript: true,
    });
  });

  it("creates a submission selection from the release menu", async () => {
    promptMocks.select
      .mockResolvedValueOnce("avihu")
      .mockResolvedValueOnce("release")
      .mockImplementationOnce(optionValue("Submit to app stores"))
      .mockResolvedValueOnce("ios");

    await expect(promptForSelection({ confirmed: false, dryRun: false })).resolves.toMatchObject({
      action: "submit",
      tenantId: "avihu",
      environment: "production",
      profile: "production",
      platform: "ios",
    });
  });

  it("asks for an update message before creating an update selection", async () => {
    promptMocks.select
      .mockResolvedValueOnce("avihu")
      .mockResolvedValueOnce("release")
      .mockImplementationOnce(optionValue("Publish an update"))
      .mockResolvedValueOnce("production");
    promptMocks.text.mockResolvedValueOnce("Fix diet plan units");

    await expect(promptForSelection({ confirmed: false, dryRun: false })).resolves.toMatchObject({
      action: "update",
      tenantId: "avihu",
      environment: "production",
      updateMessage: "Fix diet plan units",
    });
  });

  it("shows the update message in the confirmation summary and repeat command", () => {
    printSelectionSummary({
      action: "update",
      tenantId: "avihu",
      environment: "production",
      updateMessage: "Fix diet plan units",
    });

    expect(promptMocks.box).toHaveBeenCalledWith(
      expect.stringContaining("Update message: Fix diet plan units"),
      "App control summary"
    );
    expect(promptMocks.box).toHaveBeenCalledWith(
      expect.stringContaining('--message "Fix diet plan units" --yes'),
      "App control summary"
    );
  });

  it("prints a repeatable tenant-aware submission command", () => {
    printSelectionSummary({
      action: "submit",
      tenantId: "avihu",
      environment: "production",
      profile: "production",
      platform: "ios",
    });

    expect(promptMocks.box).toHaveBeenCalledWith(
      expect.stringContaining(
        "Repeat command: npm run app -- submit ios --tenant avihu --profile production --yes"
      ),
      "App control summary"
    );
  });

  it.each([
    ["development", "ios", "build:ios:dev"],
    ["production", "android", "build:android:prod"],
  ] as const)("prints the owned %s %s package script", (profile, platform, script) => {
    printSelectionSummary({
      action: "build",
      tenantId: "avihu",
      environment: profile,
      profile,
      platform,
      usePackageScript: true,
    });

    expect(promptMocks.box).toHaveBeenCalledWith(
      expect.stringContaining(`Repeat command: npm run ${script} -- --tenant avihu`),
      "App control summary"
    );
  });
});
