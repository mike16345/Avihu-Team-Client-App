import { describe, expect, it } from "vitest";

import { renderAssetAudit, renderAssetChecks, renderAssetGenerated } from "../presentation";

describe("asset CLI presentation", () => {
  it("renders generated assets as a compact completion", () => {
    expect(renderAssetGenerated("noam-mz", 11, "generated/manifest.json", false)).toContain(
      "└  11 assets generated · ready"
    );
  });

  it("keeps passing validation compact and expands failures", () => {
    const output = renderAssetChecks(
      "noam-mz",
      [
        { name: "Source logo", ok: true, message: "valid" },
        { name: "App icon", ok: false, message: "incorrect dimensions" },
      ],
      false
    );

    expect(output).toContain("◇  1 asset check  passed");
    expect(output).not.toContain("Source logo");
    expect(output).toContain("■  App icon  failed");
    expect(output).toContain("│  incorrect dimensions");
    expect(output).toContain("└  1 passed · 1 failed");
  });

  it("groups asset audit classifications and reports deletions", () => {
    const output = renderAssetAudit(
      {
        tenantId: "noam-mz",
        entries: [
          {
            absolutePath: "/tmp/logo.png",
            relativePath: "assets/logo.png",
            classification: "used",
            reason: "imported by App.tsx",
          },
          {
            absolutePath: "/tmp/old.png",
            relativePath: "assets/old.png",
            classification: "proven-unused",
            reason: "no references",
          },
        ],
        summary: { used: 1, "stale-generated": 0, "proven-unused": 1, ambiguous: 0 },
        deleted: ["assets/old.png"],
      },
      false
    );

    expect(output).toContain("◇  assets/logo.png  passed");
    expect(output).toContain("▲  assets/old.png  warning");
    expect(output).toContain("│  Removed: assets/old.png");
    expect(output).toContain("└  1 used · 1 proven unused · 1 removed");
  });
});
