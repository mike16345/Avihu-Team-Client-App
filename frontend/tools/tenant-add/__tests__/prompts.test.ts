import { describe, expect, it, vi } from "vitest";
import { collectTenantAnswers, type TenantPromptApi } from "../prompts";

describe("tenant:add prompts", () => {
  it("selects a theme preset without asking for individual colors", async () => {
    const text = vi
      .fn()
      .mockResolvedValueOnce("test-tenant")
      .mockResolvedValueOnce("Test Tenant")
      .mockResolvedValueOnce("");
    const select = vi.fn().mockResolvedValueOnce("local").mockResolvedValueOnce("violet-amber");
    const promptApi = {
      select,
      text,
      multiselect: vi
        .fn()
        .mockResolvedValueOnce([
          "articles",
          "chat",
          "dietPlan",
          "smartFoodCatalog",
          "workoutPlan",
          "stepTracking",
          "progressTracking",
          "formsAndAgreements",
          "mediaCapture",
          "notifications",
        ])
        .mockResolvedValueOnce([
          "camera",
          "photoLibrary",
          "notifications",
          "backgroundTasks",
          "appleHealth",
          "healthConnect",
          "liveActivities",
        ]),
      confirm: vi.fn().mockResolvedValue(true),
      box: vi.fn(),
      cancel: vi.fn(),
      isCancel: vi.fn().mockReturnValue(false),
    } as unknown as TenantPromptApi;

    expect(await collectTenantAnswers(promptApi)).toMatchObject({
      themeSelection: { kind: "preset", presetId: "violet-amber" },
    });
    expect(text.mock.calls.flat().join(" ")).not.toMatch(/primary color|accent color/u);
  });
});
