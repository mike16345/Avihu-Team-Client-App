import { beforeEach, describe, expect, it, vi } from "vitest";

const promptMocks = vi.hoisted(() => ({
  select: vi.fn(),
}));

vi.mock("@clack/prompts", () => ({
  box: vi.fn(),
  cancel: vi.fn(),
  confirm: vi.fn(),
  isCancel: (value: unknown) => typeof value === "symbol",
  path: vi.fn(),
  select: promptMocks.select,
}));

import { promptForSelection } from "../prompts";

const backValue = (prompt: { options: Array<{ value: unknown; label?: string }> }) =>
  prompt.options.find((option) => option.label === "← Back")?.value;

describe("interactive app-control navigation", () => {
  beforeEach(() => {
    promptMocks.select.mockReset();
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
});
