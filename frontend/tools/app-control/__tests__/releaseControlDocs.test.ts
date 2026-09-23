import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const releaseControl = readFileSync(path.join(process.cwd(), "docs", "release-control.md"), "utf8");

describe("release-control operator commands", () => {
  it("documents Avihu's production EAS names without requiring remote APP_TENANT", () => {
    expect(releaseControl).toContain("`API_KEY`, `API_URL`, `CLOUDFRONT_URL`");
    expect(releaseControl).toContain("do not depend on a remote `APP_TENANT` value");
  });

  it("warns that environment listing can display plaintext values", () => {
    expect(releaseControl).toContain("`env:list` can display plaintext");
    expect(releaseControl).toContain("review its output");
  });
});
