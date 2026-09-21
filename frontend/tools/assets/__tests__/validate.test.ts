import { mkdtemp, mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import sharp from "sharp";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { generateTenantAssets } from "../generate";
import { validateTenantAssets } from "../validate";

const TENANT_ID = "avihu";

describe.sequential("validateTenantAssets", () => {
  let assetsRoot: string;
  let sourcePath: string;
  let previousAssetsRoot: string | undefined;

  beforeEach(async () => {
    previousAssetsRoot = process.env.TENANT_ASSETS_ROOT;
    assetsRoot = await mkdtemp(path.join(tmpdir(), "tenant-assets-validate-"));
    process.env.TENANT_ASSETS_ROOT = assetsRoot;
    sourcePath = path.join(assetsRoot, TENANT_ID, "source", "app-icon.png");
    await mkdir(path.dirname(sourcePath), { recursive: true });
    await sharp({
      create: {
        width: 1000,
        height: 1000,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([
        {
          input: Buffer.from(
            '<svg width="600" height="600"><circle cx="300" cy="300" r="280" fill="#111111"/></svg>'
          ),
          left: 200,
          top: 200,
        },
      ])
      .png()
      .toFile(sourcePath);
  });

  afterEach(async () => {
    if (previousAssetsRoot === undefined) {
      delete process.env.TENANT_ASSETS_ROOT;
    } else {
      process.env.TENANT_ASSETS_ROOT = previousAssetsRoot;
    }
    await rm(assetsRoot, { recursive: true, force: true });
  });

  it("passes every check for freshly generated assets", async () => {
    await generateTenantAssets(TENANT_ID);

    const results = await validateTenantAssets(TENANT_ID);

    expect(results.length).toBeGreaterThan(0);
    expect(results.every(({ ok }) => ok)).toBe(true);
  });

  it("reports a modified generated asset", async () => {
    await generateTenantAssets(TENANT_ID);
    const applePath = path.join(assetsRoot, TENANT_ID, "generated", "apple-icon.png");
    await sharp({
      create: {
        width: 8,
        height: 8,
        channels: 3,
        background: "#ffffff",
      },
    })
      .png()
      .toFile(applePath);

    const results = await validateTenantAssets(TENANT_ID);

    expect(results).toContainEqual(expect.objectContaining({ name: "appleIcon hash", ok: false }));
    expect(results).toContainEqual(
      expect.objectContaining({ name: "appleIcon metadata", ok: false })
    );
  });

  it("reports source drift after generation", async () => {
    await generateTenantAssets(TENANT_ID);
    await sharp({
      create: {
        width: 1000,
        height: 1000,
        channels: 4,
        background: "#ff5a36",
      },
    })
      .png()
      .toFile(sourcePath);

    const results = await validateTenantAssets(TENANT_ID);

    expect(results).toContainEqual(expect.objectContaining({ name: "source hash", ok: false }));
  });
});
