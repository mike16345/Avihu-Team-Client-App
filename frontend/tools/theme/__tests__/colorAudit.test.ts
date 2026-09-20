import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { auditApplicationColors, renderColorAudit } from "../colorAudit";

const temporaryRoots: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryRoots.splice(0).map((root) => rm(root, { force: true, recursive: true }))
  );
});

describe("application color audit", () => {
  it("reports literal application colors without treating semantic variant names as colors", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "tenant-theme-audit-"));
    temporaryRoots.push(root);
    const sourceRoot = path.join(root, "src");
    await mkdir(sourceRoot);
    await writeFile(
      path.join(sourceRoot, "Card.tsx"),
      [
        'const variant = "gray";',
        'const clear = { backgroundColor: "transparent" };',
        'const styles = { backgroundColor: "#FFFFFF", borderColor: "rgba(0, 0, 0, 0.1)" };',
        'const icon = <Icon color="red" />;',
      ].join("\n")
    );

    expect(await auditApplicationColors([sourceRoot])).toEqual([
      { relativePath: "src/Card.tsx", line: 3, literal: "#FFFFFF" },
      { relativePath: "src/Card.tsx", line: 3, literal: "rgba(0, 0, 0, 0.1)" },
      { relativePath: "src/Card.tsx", line: 4, literal: "red" },
    ]);
  });

  it("renders a clean success or expanded findings report", () => {
    expect(renderColorAudit([], false)).toContain("└  No hardcoded application colors · ready");

    const output = renderColorAudit(
      [{ relativePath: "src/Card.tsx", line: 3, literal: "#FFFFFF" }],
      false
    );
    expect(output).toContain("■  src/Card.tsx:3  failed");
    expect(output).toContain("│  #FFFFFF");
    expect(output).toContain("└  1 hardcoded color found");
  });
});
