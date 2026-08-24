import { describe, expect, it } from "vitest";

import {
  createBadgePreferenceRepository,
  getBadgePreferenceKey,
  type StringStorage,
} from "../badgePreference";

const createMemoryStorage = (initial: Record<string, string> = {}): StringStorage => {
  const values = new Map(Object.entries(initial));

  return {
    getItem: async (key) => values.get(key) ?? null,
    setItem: async (key, value) => {
      values.set(key, value);
    },
  };
};

describe("badge preference repository", () => {
  it("defaults an absent or malformed tenant preference to visible", async () => {
    const storage = createMemoryStorage({
      "@developer-tools/avihu/show-badge": "malformed",
    });
    const repository = createBadgePreferenceRepository(storage);

    await expect(repository.load("missing")).resolves.toBe(true);
    await expect(repository.load("avihu")).resolves.toBe(true);
  });

  it("persists badge visibility independently for each tenant", async () => {
    const storage = createMemoryStorage();
    const repository = createBadgePreferenceRepository(storage);

    await repository.save("avihu", false);
    await repository.save("future-coach", true);

    await expect(repository.load("avihu")).resolves.toBe(false);
    await expect(repository.load("future-coach")).resolves.toBe(true);
  });

  it("constructs a tenant-scoped stable preference key", () => {
    expect(getBadgePreferenceKey("future-coach")).toBe(
      "@developer-tools/future-coach/show-badge"
    );
  });
});
