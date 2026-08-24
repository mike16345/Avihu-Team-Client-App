import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import sharp from "sharp";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { generateTenantAssets } from "../generate";
import { trimFullyTransparentPadding } from "../trim";

const TENANT_ID = "avihu";
const SAFE_ZONE_RATIO = 0.66;
const MINIMUM_SAFE_ZONE_UTILIZATION = 0.9;

const hash = (contents: Buffer) => createHash("sha256").update(contents).digest("hex");

const listFiles = async (directory: string, prefix = ""): Promise<string[]> => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const relativePath = path.join(prefix, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(path.join(directory, entry.name), relativePath)));
    } else {
      files.push(relativePath);
    }
  }

  return files.sort();
};

const createFixture = async (sourcePath: string, accent = "#ff5a36") => {
  const artwork = Buffer.from(
    `<svg width="1000" height="1000" xmlns="http://www.w3.org/2000/svg">
      <rect x="180" y="180" width="640" height="640" rx="120" fill="#111111"/>
      <circle cx="500" cy="500" r="190" fill="${accent}"/>
    </svg>`
  );

  await sharp(artwork).png().toFile(sourcePath);
};

const createOpaqueBackgroundFixture = async (sourcePath: string) => {
  const artwork = Buffer.from(
    `<svg width="1000" height="1000" xmlns="http://www.w3.org/2000/svg">
      <rect width="1000" height="1000" fill="#f7f7f7"/>
      <path d="M300 250 H760 L650 390 H410 L360 500 H620 L510 640 H300 Z" fill="#111111"/>
    </svg>`
  );

  await sharp(artwork).png().toFile(sourcePath);
};

describe.sequential("generateTenantAssets", () => {
  let assetsRoot: string;
  let sourcePath: string;
  let previousAssetsRoot: string | undefined;

  beforeEach(async () => {
    previousAssetsRoot = process.env.TENANT_ASSETS_ROOT;
    assetsRoot = await mkdtemp(path.join(tmpdir(), "tenant-assets-generate-"));
    process.env.TENANT_ASSETS_ROOT = assetsRoot;
    sourcePath = path.join(assetsRoot, TENANT_ID, "source", "app-icon.png");
    await mkdir(path.dirname(sourcePath), { recursive: true });
    await createFixture(sourcePath);
  });

  afterEach(async () => {
    if (previousAssetsRoot === undefined) {
      delete process.env.TENANT_ASSETS_ROOT;
    } else {
      process.env.TENANT_ASSETS_ROOT = previousAssetsRoot;
    }
    await rm(assetsRoot, { recursive: true, force: true });
  });

  it("creates valid Apple, adaptive, and notification platform inputs", async () => {
    await generateTenantAssets(TENANT_ID);
    const generatedDirectory = path.join(assetsRoot, TENANT_ID, "generated");
    const apple = await sharp(path.join(generatedDirectory, "apple-icon.png")).metadata();
    const adaptivePath = path.join(generatedDirectory, "android-adaptive-foreground.png");
    const adaptive = await sharp(adaptivePath).metadata();
    const adaptivePixels = await sharp(adaptivePath).ensureAlpha().raw().toBuffer();
    const notificationPath = path.join(generatedDirectory, "notification-icon.png");
    const notification = await sharp(notificationPath).metadata();
    const notificationPixels = await sharp(notificationPath).ensureAlpha().raw().toBuffer();

    expect(apple).toMatchObject({
      width: 1024,
      height: 1024,
      space: "srgb",
      hasAlpha: false,
    });
    expect(adaptive).toMatchObject({ width: 1024, height: 1024, hasAlpha: true });

    let left = 1024;
    let top = 1024;
    let right = -1;
    let bottom = -1;
    for (let pixel = 0; pixel < adaptivePixels.length / 4; pixel += 1) {
      if (adaptivePixels[pixel * 4 + 3] === 0) continue;
      const x = pixel % 1024;
      const y = Math.floor(pixel / 1024);
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
    }
    const visibleWidth = right - left + 1;
    const visibleHeight = bottom - top + 1;
    const safeZoneSize = Math.ceil(1024 * SAFE_ZONE_RATIO);
    expect(visibleWidth).toBeLessThanOrEqual(safeZoneSize);
    expect(visibleHeight).toBeLessThanOrEqual(safeZoneSize);
    expect(Math.max(visibleWidth, visibleHeight)).toBeGreaterThanOrEqual(
      Math.floor(safeZoneSize * MINIMUM_SAFE_ZONE_UTILIZATION)
    );
    expect(Math.abs(left - (1023 - right))).toBeLessThanOrEqual(1);
    expect(Math.abs(top - (1023 - bottom))).toBeLessThanOrEqual(1);

    expect(notification.hasAlpha).toBe(true);
    let visibleNotificationPixels = 0;
    for (let offset = 0; offset < notificationPixels.length; offset += 4) {
      const red = notificationPixels[offset];
      const green = notificationPixels[offset + 1];
      const blue = notificationPixels[offset + 2];
      const alpha = notificationPixels[offset + 3];
      expect([0, 255]).toContain(alpha);
      if (alpha === 255) {
        visibleNotificationPixels += 1;
        expect([red, green, blue]).toEqual([255, 255, 255]);
      }
    }
    expect(visibleNotificationPixels).toBeGreaterThan(0);
  });

  it("changes the source and output hashes when the source bytes change", async () => {
    const firstManifest = await generateTenantAssets(TENANT_ID);
    await createFixture(sourcePath, "#36a7ff");
    const changedSource = await readFile(sourcePath);
    const secondManifest = await generateTenantAssets(TENANT_ID);

    expect(firstManifest.source.sha256).not.toBe(secondManifest.source.sha256);
    expect(secondManifest.source.sha256).toBe(hash(changedSource));
    expect(firstManifest.outputs.appleIcon.sha256).not.toBe(
      secondManifest.outputs.appleIcon.sha256
    );
  });

  it("excludes an opaque pale background from the notification mask", async () => {
    await createOpaqueBackgroundFixture(sourcePath);
    await generateTenantAssets(TENANT_ID);
    const notificationPath = path.join(assetsRoot, TENANT_ID, "generated", "notification-icon.png");
    const { data, info } = await sharp(notificationPath)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const alphaAt = (x: number, y: number) => data[(y * info.width + x) * 4 + 3];

    expect(alphaAt(4, 4)).toBe(0);
    expect(alphaAt(48, 30)).toBe(255);
  });

  it("reproduces identical output bytes and metadata from identical input", async () => {
    const firstManifest = await generateTenantAssets(TENANT_ID);
    const generatedDirectory = path.join(assetsRoot, TENANT_ID, "generated");
    const firstFiles = await listFiles(generatedDirectory);
    const firstContents = new Map(
      await Promise.all(
        firstFiles.map(
          async (file) => [file, await readFile(path.join(generatedDirectory, file))] as const
        )
      )
    );

    const secondManifest = await generateTenantAssets(TENANT_ID);
    const secondFiles = await listFiles(generatedDirectory);

    expect(secondManifest).toEqual(firstManifest);
    expect(secondFiles).toEqual(firstFiles);
    for (const file of secondFiles) {
      expect(await readFile(path.join(generatedDirectory, file))).toEqual(firstContents.get(file));
    }
  });
});

describe("trimFullyTransparentPadding", () => {
  it("preserves every nonzero-alpha pixel while removing only transparent outer rows", async () => {
    const pixels = Buffer.alloc(6 * 6 * 4);
    for (let offset = 0; offset < pixels.length; offset += 4) {
      pixels[offset] = 255;
    }
    for (let y = 2; y <= 3; y += 1) {
      for (let x = 2; x <= 3; x += 1) {
        pixels[(y * 6 + x) * 4 + 3] = 255;
      }
    }
    pixels[(3 * 6 + 1) * 4 + 3] = 1;
    const source = await sharp(pixels, {
      raw: { width: 6, height: 6, channels: 4 },
    })
      .png()
      .toBuffer();

    const trimmed = await trimFullyTransparentPadding(source);
    const metadata = await sharp(trimmed).metadata();
    const trimmedPixels = await sharp(trimmed).ensureAlpha().raw().toBuffer();

    expect(metadata).toMatchObject({ width: 3, height: 2, hasAlpha: true });
    expect(trimmedPixels[(1 * 3 + 0) * 4 + 3]).toBe(1);
  });
});
