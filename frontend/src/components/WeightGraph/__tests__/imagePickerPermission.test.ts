import { describe, expect, it, vi } from "vitest";

import { resolveCameraPermission } from "../imagePickerPermission";

const permission = (granted: boolean, canAskAgain: boolean) => ({ granted, canAskAgain });

describe("resolveCameraPermission", () => {
  it("continues immediately when camera access is already granted", async () => {
    const requestPermission = vi.fn();

    await expect(
      resolveCameraPermission({
        getPermission: async () => permission(true, true),
        requestPermission,
      })
    ).resolves.toBe("granted");
    expect(requestPermission).not.toHaveBeenCalled();
  });

  it("requests camera access when the operating system allows another prompt", async () => {
    await expect(
      resolveCameraPermission({
        getPermission: async () => permission(false, true),
        requestPermission: async () => permission(true, true),
      })
    ).resolves.toBe("granted");
  });

  it("reports a retryable denial when the user can still be asked later", async () => {
    await expect(
      resolveCameraPermission({
        getPermission: async () => permission(false, true),
        requestPermission: async () => permission(false, true),
      })
    ).resolves.toBe("denied");
  });

  it("requires settings when access was permanently denied", async () => {
    const requestPermission = vi.fn();

    await expect(
      resolveCameraPermission({
        getPermission: async () => permission(false, false),
        requestPermission,
      })
    ).resolves.toBe("settings-required");
    expect(requestPermission).not.toHaveBeenCalled();
  });

  it("requires settings when a new denial can no longer be requested", async () => {
    await expect(
      resolveCameraPermission({
        getPermission: async () => permission(false, true),
        requestPermission: async () => permission(false, false),
      })
    ).resolves.toBe("settings-required");
  });
});
