import { describe, expect, it, vi } from "vitest";
import {
  createEasProject,
  getAuthenticatedExpoAccounts,
  getAuthenticatedExpoUser,
  verifyLinkedEasProject,
} from "../project";

const project = {
  owner: "acme",
  slug: "new-tenant",
  projectId: "11111111-1111-4111-8111-111111111111",
};

describe("EAS project adapter", () => {
  it("creates a project only in an isolated workspace with pinned arguments", async () => {
    const runner = vi.fn().mockResolvedValue({
      exitCode: 0,
      stdout: JSON.stringify(project),
      stderr: "",
    });
    expect(await createEasProject(runner, { displayName: "New Tenant", ...project })).toMatchObject(
      { ...project, updateUrl: `https://u.expo.dev/${project.projectId}` }
    );
    expect(runner).toHaveBeenCalledWith(
      expect.objectContaining({
        command: "npx",
        args: [
          "--yes",
          "eas-cli@22.4.0",
          "project:init",
          "--account",
          "acme",
          "--json",
          "--non-interactive",
          "--no-icon",
        ],
      })
    );
  });

  it("rejects unauthenticated and mismatched project responses", async () => {
    await expect(
      getAuthenticatedExpoUser(
        vi.fn().mockResolvedValue({ exitCode: 1, stdout: "", stderr: "not logged in" }),
        "/repo"
      )
    ).rejects.toThrow(/eas login/u);
    await expect(
      verifyLinkedEasProject(
        vi.fn().mockResolvedValue({
          exitCode: 0,
          stdout: JSON.stringify({ ...project, slug: "wrong" }),
          stderr: "",
        }),
        { displayName: "New Tenant", ...project }
      )
    ).rejects.toThrow(/slug/u);
  });

  it("parses the signed-in user and every available Expo account", async () => {
    const stdout = [
      "mikeg-studios",
      "michael@example.com",
      "",
      "Accounts:",
      "• mikeg-studios (Role: Owner)",
      "• mikeg-studios-team (Role: Owner)",
      "• avihuteam (Role: Admin)",
    ].join("\n");

    await expect(
      getAuthenticatedExpoAccounts(
        vi.fn().mockResolvedValue({ exitCode: 0, stdout, stderr: "" }),
        "/repo"
      )
    ).resolves.toEqual({
      username: "mikeg-studios",
      accounts: ["mikeg-studios", "mikeg-studios-team", "avihuteam"],
    });
  });
});
