import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import sharp from "sharp";
import { getTenantAssetPaths, toManifestPath } from "./paths";
import {
  ADAPTIVE_MINIMUM_SAFE_ZONE_UTILIZATION,
  ADAPTIVE_SAFE_ZONE_RATIO,
  ASSET_OUTPUT_FILES,
  GENERATOR_VERSION,
  type AssetManifest,
  type AssetOutputName,
  type CheckResult,
  type ImageMetadata,
} from "./types";

const EXPECTED_OUTPUTS: Record<AssetOutputName, ImageMetadata> = {
  appleIcon: { width: 1024, height: 1024, hasAlpha: false, colorSpace: "srgb" },
  androidLegacyIcon: { width: 512, height: 512, hasAlpha: false, colorSpace: "srgb" },
  androidAdaptiveForeground: {
    width: 1024,
    height: 1024,
    hasAlpha: true,
    colorSpace: "srgb",
  },
  androidAdaptiveBackground: {
    width: 1024,
    height: 1024,
    hasAlpha: false,
    colorSpace: "srgb",
  },
  notificationIcon: { width: 96, height: 96, hasAlpha: true, colorSpace: "srgb" },
  splash: { width: 1284, height: 2778, hasAlpha: false, colorSpace: "srgb" },
  runtimeLogo: { width: 1024, height: 1024, hasAlpha: true, colorSpace: "srgb" },
  applePreview: { width: 512, height: 512, hasAlpha: true, colorSpace: "srgb" },
  androidCirclePreview: { width: 512, height: 512, hasAlpha: true, colorSpace: "srgb" },
  androidSquirclePreview: { width: 512, height: 512, hasAlpha: true, colorSpace: "srgb" },
  notificationPreview: { width: 512, height: 512, hasAlpha: false, colorSpace: "srgb" },
};

const sha256 = async (filePath: string) =>
  createHash("sha256")
    .update(await readFile(filePath))
    .digest("hex");

const getImageMetadata = async (filePath: string): Promise<ImageMetadata> => {
  const metadata = await sharp(filePath).metadata();
  if (!metadata.width || !metadata.height) {
    throw new Error(`Image dimensions are unavailable for ${filePath}`);
  }

  return {
    width: metadata.width,
    height: metadata.height,
    hasAlpha: metadata.hasAlpha,
    colorSpace: metadata.space,
  };
};

const addCheck = (
  checks: CheckResult[],
  name: string,
  ok: boolean,
  passMessage: string,
  failMessage: string
) => {
  checks.push({ name, ok, message: ok ? passMessage : failMessage });
};

const metadataMatches = (actual: ImageMetadata, expected: ImageMetadata) =>
  actual.width === expected.width &&
  actual.height === expected.height &&
  actual.hasAlpha === expected.hasAlpha &&
  actual.colorSpace === expected.colorSpace;

const validateAdaptiveForeground = async (filePath: string): Promise<CheckResult> => {
  const { data, info } = await sharp(filePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let left = info.width;
  let top = info.height;
  let right = -1;
  let bottom = -1;
  let transparentPixels = 0;

  for (let pixel = 0; pixel < data.length / 4; pixel += 1) {
    const alpha = data[pixel * 4 + 3];
    if (alpha === 0) {
      transparentPixels += 1;
      continue;
    }

    const x = pixel % info.width;
    const y = Math.floor(pixel / info.width);
    left = Math.min(left, x);
    top = Math.min(top, y);
    right = Math.max(right, x);
    bottom = Math.max(bottom, y);
  }

  const visibleWidth = right >= left ? right - left + 1 : 0;
  const visibleHeight = bottom >= top ? bottom - top + 1 : 0;
  const maximumVisibleSize = Math.ceil(info.width * ADAPTIVE_SAFE_ZONE_RATIO);
  const minimumVisibleSize = Math.floor(
    maximumVisibleSize * ADAPTIVE_MINIMUM_SAFE_ZONE_UTILIZATION
  );
  const safeZoneInset = Math.floor((info.width - maximumVisibleSize) / 2);
  const fitsCenteredSafeZone =
    left >= safeZoneInset &&
    top >= safeZoneInset &&
    right < info.width - safeZoneInset &&
    bottom < info.height - safeZoneInset;
  const ok =
    visibleWidth > 0 &&
    visibleHeight > 0 &&
    visibleWidth <= maximumVisibleSize &&
    visibleHeight <= maximumVisibleSize &&
    Math.max(visibleWidth, visibleHeight) >= minimumVisibleSize &&
    transparentPixels > 0 &&
    fitsCenteredSafeZone;

  return {
    name: "androidAdaptiveForeground constraints",
    ok,
    message: ok
      ? `Visible artwork fits inside the centered ${ADAPTIVE_SAFE_ZONE_RATIO} safe-zone ratio`
      : `Visible artwork must use at least ${minimumVisibleSize}px, fit the centered safe zone, and be transparent outside it`,
  };
};

const validateNotificationIcon = async (filePath: string): Promise<CheckResult> => {
  const { data } = await sharp(filePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let visiblePixels = 0;
  let validPixels = true;

  for (let offset = 0; offset < data.length; offset += 4) {
    const red = data[offset];
    const green = data[offset + 1];
    const blue = data[offset + 2];
    const alpha = data[offset + 3];
    if (alpha !== 0 && alpha !== 255) validPixels = false;
    if (alpha === 255) {
      visiblePixels += 1;
      if (red !== 255 || green !== 255 || blue !== 255) validPixels = false;
    }
  }

  const ok = validPixels && visiblePixels > 0;
  return {
    name: "notificationIcon constraints",
    ok,
    message: ok
      ? `Mask contains ${visiblePixels} opaque white pixels and only binary alpha`
      : "Mask must contain opaque white pixels and use only transparent or opaque alpha",
  };
};

export const validateGeneratedDirectory = async (
  tenantId: string,
  generatedDirectory: string
): Promise<CheckResult[]> => {
  const paths = getTenantAssetPaths(tenantId, generatedDirectory);
  const canonicalPaths = getTenantAssetPaths(tenantId);
  const checks: CheckResult[] = [];
  let manifest: AssetManifest;

  try {
    manifest = JSON.parse(await readFile(paths.manifest, "utf8")) as AssetManifest;
  } catch (error) {
    return [
      {
        name: "manifest",
        ok: false,
        message: `Unable to read manifest: ${error instanceof Error ? error.message : String(error)}`,
      },
    ];
  }

  addCheck(
    checks,
    "manifest identity",
    manifest.generatorVersion === GENERATOR_VERSION && manifest.tenantId === tenantId,
    `Manifest identifies tenant ${tenantId} and generator version ${GENERATOR_VERSION}`,
    `Manifest must identify tenant ${tenantId} and generator version ${GENERATOR_VERSION}`
  );

  try {
    const sourceHash = await sha256(canonicalPaths.sourceIcon);
    addCheck(
      checks,
      "source hash",
      manifest.source.sha256 === sourceHash,
      "Source hash matches the manifest",
      "Source artwork changed after generation"
    );
    const sourceMetadata = await getImageMetadata(canonicalPaths.sourceIcon);
    addCheck(
      checks,
      "source metadata",
      metadataMatches(sourceMetadata, manifest.source),
      "Source metadata matches the manifest",
      "Source metadata differs from the manifest"
    );
    addCheck(
      checks,
      "source path",
      manifest.source.relativePath === "source/app-icon.png",
      "Source uses the canonical tenant-relative path",
      "Source manifest path is not canonical"
    );
  } catch (error) {
    checks.push({
      name: "source",
      ok: false,
      message: `Unable to inspect source: ${error instanceof Error ? error.message : String(error)}`,
    });
  }

  for (const name of Object.keys(ASSET_OUTPUT_FILES) as AssetOutputName[]) {
    const outputPath = paths.outputs[name];
    const manifestOutput = manifest.outputs?.[name];
    if (!manifestOutput) {
      checks.push({ name: `${name} manifest`, ok: false, message: "Manifest entry is missing" });
      continue;
    }

    try {
      const actualHash = await sha256(outputPath);
      addCheck(
        checks,
        `${name} hash`,
        actualHash === manifestOutput.sha256,
        "Output hash matches the manifest",
        "Output hash differs from the manifest"
      );
      const actualMetadata = await getImageMetadata(outputPath);
      addCheck(
        checks,
        `${name} metadata`,
        metadataMatches(actualMetadata, EXPECTED_OUTPUTS[name]) &&
          metadataMatches(actualMetadata, manifestOutput),
        "Output dimensions, alpha state, and color space are valid",
        "Output dimensions, alpha state, or color space are invalid"
      );
      const canonicalRelativePath = toManifestPath(
        canonicalPaths.tenantDirectory,
        canonicalPaths.outputs[name]
      );
      addCheck(
        checks,
        `${name} path`,
        manifestOutput.relativePath === canonicalRelativePath,
        "Output uses the canonical tenant-relative path",
        `Output path must be ${canonicalRelativePath}`
      );
    } catch (error) {
      checks.push({
        name: `${name} file`,
        ok: false,
        message: `Unable to inspect output: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  }

  try {
    checks.push(await validateAdaptiveForeground(paths.outputs.androidAdaptiveForeground));
  } catch (error) {
    checks.push({
      name: "androidAdaptiveForeground constraints",
      ok: false,
      message: error instanceof Error ? error.message : String(error),
    });
  }

  try {
    checks.push(await validateNotificationIcon(paths.outputs.notificationIcon));
  } catch (error) {
    checks.push({
      name: "notificationIcon constraints",
      ok: false,
      message: error instanceof Error ? error.message : String(error),
    });
  }

  return checks;
};

export const validateTenantAssets = async (tenantId: string): Promise<CheckResult[]> => {
  const { generatedDirectory } = getTenantAssetPaths(tenantId);
  return validateGeneratedDirectory(tenantId, generatedDirectory);
};
