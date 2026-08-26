import { describe, expect, it, vi } from "vitest";
import { verifyNewTenant } from "../verification";

describe("new tenant verification", () => {
  it("clean-prebuilds the selected tenant before fast preflight", async () => {
    const runner = vi.fn().mockResolvedValue(0);

    await verifyNewTenant("/repo", "noam-mz", runner);

    expect(runner.mock.calls.map(([spec]) => spec)).toEqual([
      {
        command: "npx",
        args: ["expo", "prebuild", "--clean", "--no-install"],
        cwd: "/repo",
        env: expect.objectContaining({ APP_TENANT: "noam-mz", APP_ENV: "development" }),
      },
      {
        command: "npm",
        args: ["run", "preflight", "--", "--tenant", "noam-mz", "--environment", "development"],
        cwd: "/repo",
        env: expect.objectContaining({ APP_TENANT: "noam-mz", APP_ENV: "development" }),
      },
    ]);
  });

  it("does not run preflight after clean prebuild fails", async () => {
    const runner = vi.fn().mockResolvedValueOnce(1);

    await expect(verifyNewTenant("/repo", "noam-mz", runner)).rejects.toThrow(
      /Clean Expo prebuild failed/u
    );
    expect(runner).toHaveBeenCalledTimes(1);
  });
});
