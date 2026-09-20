import { describe, expect, it, vi } from "vitest";
import { avihuTenant } from "../../../config/tenants/avihu";
import {
  collectTenantAnswers,
  collectTenantDraftSelection,
  collectTenantEasSelection,
  type TenantPromptApi,
} from "../prompts";

describe("tenant:add prompts", () => {
  it("offers resume, start-over, and delete for an existing draft", async () => {
    const draft = {
      schemaVersion: 1 as const,
      tenantId: "new-tenant",
      updatedAt: "2026-08-26T00:00:00.000Z",
      answers: { mode: "repository" as const, id: "new-tenant", displayName: "New Tenant" },
    };
    const promptApi = {
      select: vi.fn().mockResolvedValueOnce("new-tenant").mockResolvedValueOnce("resume"),
      isCancel: vi.fn().mockReturnValue(false),
    } as unknown as TenantPromptApi;

    await expect(collectTenantDraftSelection([draft], promptApi)).resolves.toEqual({
      kind: "resume",
      draft,
    });
    expect(promptApi.select).toHaveBeenLastCalledWith(
      expect.objectContaining({
        options: [
          expect.objectContaining({ value: "resume" }),
          expect.objectContaining({ value: "start-over" }),
          expect.objectContaining({ value: "delete" }),
        ],
      })
    );
  });

  it("automatically skips EAS for a local tenant", async () => {
    const promptApi = { select: vi.fn() } as unknown as TenantPromptApi;
    await expect(
      collectTenantEasSelection("local", "new-tenant", promptApi, async () => "unused")
    ).resolves.toEqual({ kind: "skip" });
    expect(promptApi.select).not.toHaveBeenCalled();
  });

  it("requires explicit confirmation of an existing project UUID and tenant slug", async () => {
    const promptApi = {
      select: vi.fn().mockResolvedValue("link"),
      text: vi.fn().mockResolvedValue("11111111-1111-4111-8111-111111111111"),
      confirm: vi.fn().mockResolvedValue(false),
      box: vi.fn(),
      isCancel: vi.fn().mockReturnValue(false),
    } as unknown as TenantPromptApi;

    await expect(
      collectTenantEasSelection("repository", "new-tenant", promptApi)
    ).resolves.toBeNull();
    expect(promptApi.box).toHaveBeenCalledWith(
      expect.stringContaining("new-tenant"),
      "Confirm EAS link"
    );
    expect(promptApi.confirm).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("new-tenant") })
    );
  });

  it("carries the selected Expo owner into an existing-project link", async () => {
    const projectId = "11111111-1111-4111-8111-111111111111";
    const promptApi = {
      select: vi.fn().mockResolvedValue("link"),
      text: vi.fn().mockResolvedValue(projectId),
      confirm: vi.fn().mockResolvedValue(true),
      box: vi.fn(),
      isCancel: vi.fn().mockReturnValue(false),
    } as unknown as TenantPromptApi;

    await expect(
      collectTenantEasSelection(
        "repository",
        "new-tenant",
        promptApi,
        async () => "unused",
        "avihuteam"
      )
    ).resolves.toEqual({ kind: "link", owner: "avihuteam", projectId });
  });

  it("reuses the selected Expo owner when confirming project creation", async () => {
    const promptApi = {
      select: vi.fn().mockResolvedValue("create"),
      text: vi.fn(),
      confirm: vi.fn().mockResolvedValue(true),
      box: vi.fn(),
      isCancel: vi.fn().mockReturnValue(false),
    } as unknown as TenantPromptApi;

    await expect(
      collectTenantEasSelection(
        "repository",
        "new-tenant",
        promptApi,
        async () => "mikeg-studios",
        "avihuteam"
      )
    ).resolves.toEqual({ kind: "create", owner: "avihuteam" });
    expect(promptApi.text).not.toHaveBeenCalled();
  });

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

  it("selects an Expo account before suggesting an editable identifier base", async () => {
    const text = vi
      .fn()
      .mockResolvedValueOnce("new-tenant")
      .mockResolvedValueOnce("New Tenant")
      .mockResolvedValueOnce("")
      .mockResolvedValueOnce("com.avihuteam");
    const select = vi
      .fn()
      .mockResolvedValueOnce("repository")
      .mockResolvedValueOnce("avihuteam")
      .mockResolvedValueOnce("avihu");
    const promptApi = {
      select,
      text,
      multiselect: vi
        .fn()
        .mockResolvedValueOnce(Object.keys(avihuTenant.featureDefaults))
        .mockResolvedValueOnce(Object.keys(avihuTenant.nativeCapabilities)),
      confirm: vi.fn().mockResolvedValue(true),
      box: vi.fn(),
      cancel: vi.fn(),
      isCancel: vi.fn().mockReturnValue(false),
    } as unknown as TenantPromptApi;

    await expect(
      collectTenantAnswers(promptApi, {
        getExpoAccounts: async () => ({
          username: "mikeg-studios",
          accounts: ["mikeg-studios", "avihuteam"],
        }),
      })
    ).resolves.toMatchObject({ expoOwner: "avihuteam", identifierBase: "com.avihuteam" });
    expect(select).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Expo owner",
        options: expect.arrayContaining([{ value: "avihuteam", label: "avihuteam" }]),
      })
    );
    expect(text).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("Bundle/package base"),
        initialValue: "com.avihuteam",
      })
    );
  });

  it("resumes complete saved answers without asking for them again", async () => {
    const promptApi = {
      select: vi.fn(),
      text: vi.fn(),
      multiselect: vi.fn(),
      confirm: vi.fn().mockResolvedValue(true),
      box: vi.fn(),
      cancel: vi.fn(),
      isCancel: vi.fn().mockReturnValue(false),
    } as unknown as TenantPromptApi;

    await expect(
      collectTenantAnswers(promptApi, {
        initialAnswers: {
          mode: "repository",
          id: "new-tenant",
          displayName: "New Tenant",
          logoPath: "",
          expoOwner: "avihuteam",
          identifierBase: "com.avihuteam",
          themeSelection: { kind: "preset", presetId: "avihu" },
          supportsRtl: true,
          forcesRtl: true,
          featureDefaults: avihuTenant.featureDefaults,
          nativeCapabilities: avihuTenant.nativeCapabilities,
        },
      })
    ).resolves.toMatchObject({ id: "new-tenant", expoOwner: "avihuteam" });
    expect(promptApi.select).not.toHaveBeenCalled();
    expect(promptApi.text).not.toHaveBeenCalled();
    expect(promptApi.multiselect).not.toHaveBeenCalled();
  });
});
