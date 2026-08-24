import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { auditAssets } from "../audit";

const TENANT_ID = "avihu";

const writeFixtureFile = async (root: string, relativePath: string, contents = "asset") => {
  const filePath = path.join(root, relativePath);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, contents, "utf8");
  return filePath;
};

describe("auditAssets", () => {
  let projectRoot: string;

  beforeEach(async () => {
    projectRoot = await mkdtemp(path.join(tmpdir(), "tenant-assets-audit-"));

    await Promise.all([
      writeFixtureFile(projectRoot, "assets/alias.png"),
      writeFixtureFile(projectRoot, "assets/relative.png"),
      writeFixtureFile(projectRoot, "assets/required.png"),
      writeFixtureFile(projectRoot, "assets/dynamic/a.png"),
      writeFixtureFile(projectRoot, "assets/dynamic/b.png"),
      writeFixtureFile(projectRoot, "assets/proven-unused.png"),
      writeFixtureFile(projectRoot, "dist/ignored-build-output.png"),
      writeFixtureFile(projectRoot, "src/alias.ts", 'import image from "@assets/alias.png";\n'),
      writeFixtureFile(
        projectRoot,
        "src/screens/relative.ts",
        'import image from "../../assets/relative.png";\n'
      ),
      writeFixtureFile(
        projectRoot,
        "src/required.ts",
        'const image = require("@assets/required.png");\n'
      ),
      writeFixtureFile(
        projectRoot,
        "src/dynamic.ts",
        "const image = `../assets/dynamic/${variant}.png`;\n"
      ),
      writeFixtureFile(
        projectRoot,
        "config/tenants/avihu.ts",
        'export const icon = "./config/tenants/assets/avihu/generated/configured.png";\n'
      ),
      writeFixtureFile(projectRoot, "config/tenants/assets/avihu/source/app-icon.png"),
      writeFixtureFile(projectRoot, "config/tenants/assets/avihu/generated/configured.png"),
      writeFixtureFile(projectRoot, "config/tenants/assets/avihu/generated/active.png"),
      writeFixtureFile(projectRoot, "config/tenants/assets/avihu/generated/stale.png"),
      writeFixtureFile(
        projectRoot,
        "config/tenants/assets/avihu/generated/manifest.json",
        JSON.stringify({
          tenantId: TENANT_ID,
          source: { relativePath: "source/app-icon.png" },
          outputs: {
            active: { relativePath: "generated/active.png" },
          },
        })
      ),
    ]);
  });

  afterEach(async () => {
    await rm(projectRoot, { recursive: true, force: true });
  });

  it("keeps statically referenced, tenant, and manifest assets while reporting dynamic paths", async () => {
    const report = await auditAssets({ projectRoot, tenantId: TENANT_ID });
    const byPath = new Map(
      report.entries.map((entry) => [entry.relativePath, entry.classification])
    );

    expect(byPath.get("assets/alias.png")).toBe("used");
    expect(byPath.get("assets/relative.png")).toBe("used");
    expect(byPath.get("assets/required.png")).toBe("used");
    expect(byPath.get("assets/dynamic/a.png")).toBe("ambiguous");
    expect(byPath.get("assets/dynamic/b.png")).toBe("ambiguous");
    expect(byPath.get("assets/proven-unused.png")).toBe("proven-unused");
    expect(byPath.get("config/tenants/assets/avihu/source/app-icon.png")).toBe("used");
    expect(byPath.get("config/tenants/assets/avihu/generated/configured.png")).toBe("used");
    expect(byPath.get("config/tenants/assets/avihu/generated/active.png")).toBe("used");
    expect(byPath.get("config/tenants/assets/avihu/generated/stale.png")).toBe("stale-generated");
    expect(byPath.has("dist/ignored-build-output.png")).toBe(false);
  });

  it("removes only stale generated and proven-unused files after explicit confirmation", async () => {
    const report = await auditAssets({ projectRoot, tenantId: TENANT_ID, clean: true, yes: true });

    expect(report.deleted).toEqual(
      expect.arrayContaining([
        "assets/proven-unused.png",
        "config/tenants/assets/avihu/generated/stale.png",
      ])
    );
    await expect(readFile(path.join(projectRoot, "assets/dynamic/a.png"), "utf8")).resolves.toBe(
      "asset"
    );
    await expect(
      readFile(path.join(projectRoot, "config/tenants/assets/avihu/generated/active.png"), "utf8")
    ).resolves.toBe("asset");
  });

  it("rejects a symlinked candidate that resolves outside approved asset roots", async () => {
    const outsideAsset = await writeFixtureFile(projectRoot, "outside.png");
    const linkPath = path.join(projectRoot, "assets/escaped.png");
    await symlink(outsideAsset, linkPath);

    await expect(auditAssets({ projectRoot, tenantId: TENANT_ID })).rejects.toThrow(
      "outside approved asset roots"
    );
  });

  it("rejects a tenant path that attempts to escape approved asset roots", async () => {
    await expect(auditAssets({ projectRoot, tenantId: "../../assets" })).rejects.toThrow(
      'Unknown tenant "../../assets"'
    );
  });

  it("keeps generated files ambiguous when their manifest is incomplete", async () => {
    await writeFixtureFile(
      projectRoot,
      "config/tenants/assets/avihu/generated/manifest.json",
      JSON.stringify({ source: { relativePath: "source/app-icon.png" }, outputs: {} })
    );

    const report = await auditAssets({ projectRoot, tenantId: TENANT_ID });

    expect(
      report.entries.find(
        (entry) => entry.relativePath === "config/tenants/assets/avihu/generated/stale.png"
      )?.classification
    ).toBe("ambiguous");
  });
});
