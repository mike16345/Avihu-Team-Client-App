import { describe, expect, it, vi } from "vitest";
import { verifyNewTenant } from "../verification";

describe("new tenant verification", () => {
  it("clean-prebuilds the selected tenant before fast preflight", async () => {
    const runner = vi.fn().mockResolvedValue({ exitCode: 0, output: "completed" });
    const stages: string[] = [];

    await verifyNewTenant("/repo", "noam-mz", runner, (stage) => stages.push(stage));

    expect(runner.mock.calls.map(([spec]) => spec)).toEqual([
      {
        command: "npx",
        args: ["expo", "prebuild", "--clean", "--no-install"],
        cwd: "/repo",
        env: expect.objectContaining({
          APP_TENANT: "noam-mz",
          APP_ENV: "development",
          EXPO_NO_GIT_STATUS: "1",
        }),
      },
      {
        command: "npm",
        args: ["run", "preflight", "--", "--tenant", "noam-mz", "--environment", "development"],
        cwd: "/repo",
        env: expect.objectContaining({ APP_TENANT: "noam-mz", APP_ENV: "development" }),
      },
    ]);
    expect(stages).toEqual(["Generating native project", "Running tenant preflight"]);
  });

  it("does not run preflight after clean prebuild fails", async () => {
    const runner = vi
      .fn()
      .mockResolvedValueOnce({ exitCode: 1, output: "expo prebuild explained the failure" });

    await expect(verifyNewTenant("/repo", "noam-mz", runner)).rejects.toThrow(
      /Clean Expo prebuild failed \(exit 1\)\nexpo prebuild explained the failure/u
    );
    expect(runner).toHaveBeenCalledTimes(1);
  });
});
