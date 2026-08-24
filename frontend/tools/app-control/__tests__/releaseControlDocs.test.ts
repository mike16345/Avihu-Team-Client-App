import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const releaseControl = readFileSync(path.join(process.cwd(), "docs", "release-control.md"), "utf8");

describe("release-control operator commands", () => {
  it("documents the pinned CLI's supported idempotent environment creation command", () => {
    expect(releaseControl).toContain("eas-cli@16.27.0 env:create");
    expect(releaseControl).toContain("--force");
    expect(releaseControl).not.toContain("eas-cli@16.27.0 env:set");
  });

  it("warns that environment listing can display plaintext values", () => {
    expect(releaseControl).toContain("Plaintext `APP_TENANT` values can");
    expect(releaseControl).toContain("review the output");
  });
});
