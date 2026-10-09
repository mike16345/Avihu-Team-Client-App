import { createRequire } from "node:module";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const requireConfig = createRequire(__filename);
const previousTenant = process.env.APP_TENANT;
process.env.APP_TENANT = "avihu";
const config = requireConfig("../../../metro.config.js");
if (previousTenant === undefined) {
  delete process.env.APP_TENANT;
} else {
  process.env.APP_TENANT = previousTenant;
}

const isBlocked = (filename: string): boolean => {
  const blockList: RegExp | RegExp[] = config.resolver.blockList;
  const patterns = Array.isArray(blockList) ? blockList : [blockList];
  return patterns.some((pattern) => pattern?.test(resolve(filename)));
};

describe("Metro environment file boundary", () => {
  it.each([".env.e2e.local", ".env.e2e", ".env.example", ".env.preview", ".env.backup"])(
    "excludes %s from Expo's development environment context",
    (filename) => {
      expect(isBlocked(filename)).toBe(true);
    }
  );

  it.each([
    ".env",
    ".env.local",
    ".env.development",
    ".env.development.local",
    ".env.production",
    ".env.production.local",
    "src/constants/e2e.ts",
  ])("keeps %s available to Metro", (filename) => {
    expect(isBlocked(filename)).toBe(false);
  });
});
