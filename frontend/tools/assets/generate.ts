import { createHash, randomUUID } from "node:crypto";
import { access, mkdir, mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp, { type Sharp } from "sharp";
import { getTenant } from "../../config/tenants/registry";
import { getTenantAssetPaths, toManifestPath } from "./paths";
import {
  ADAPTIVE_SAFE_ZONE_RATIO,
  ASSET_OUTPUT_FILES,
  GENERATOR_VERSION,
  NOTIFICATION_ALPHA_THRESHOLD,
  NOTIFICATION_LUMINANCE_THRESHOLD,
  type AssetManifest,
  type AssetOutputName,
  type ImageMetadata,
  type ManifestImage,
} from "./types";
import { validateGeneratedDirectory } from "./validate";

const PNG_OPTIONS = {
  compressionLevel: 9,
  adaptiveFiltering: false,
  palette: false,
  progressive: false,
} as const;
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 } as const;
const APPLE_ICON_SIZE = 1024;
const ANDROID_LEGACY_SIZE = 512;
const ADAPTIVE_ICON_SIZE = 1024;
const ADAPTIVE_ARTWORK_SIZE = Math.floor(ADAPTIVE_ICON_SIZE * ADAPTIVE_SAFE_ZONE_RATIO);
const NOTIFICATION_ICON_SIZE = 96;
const SPLASH_WIDTH = 1284;
const SPLASH_HEIGHT = 2778;
const SPLASH_ARTWORK_SIZE = 900;
const RUNTIME_LOGO_SIZE = 1024;
const PREVIEW_SIZE = 512;

const sha256Buffer = (contents: Buffer) => createHash("sha256").update(contents).digest("hex");

const fileExists = async (filePath: string) => {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
};

const writePng = async (pipeline: Sharp, outputPath: string) => {
  await mkdir(path.dirname(outputPath), { recursive: true });
  await pipeline.toColourspace("srgb").png(PNG_OPTIONS).toFile(outputPath);
};

const createMask = (shape: "circle" | "squircle" | "apple") => {
  if (shape === "circle") {
    return Buffer.from(
      `<svg width="${PREVIEW_SIZE}" height="${PREVIEW_SIZE}"><circle cx="256" cy="256" r="256" fill="#fff"/></svg>`
    );
  }

  const radius = shape === "apple" ? 116 : 128;
  return Buffer.from(
    `<svg width="${PREVIEW_SIZE}" height="${PREVIEW_SIZE}"><rect width="512" height="512" rx="${radius}" fill="#fff"/></svg>`
  );
};

const createMaskedPreview = async (
  image: Buffer,
  shape: "circle" | "squircle" | "apple",
  outputPath: string
) => {
  await writePng(
    sharp(image)
      .resize(PREVIEW_SIZE, PREVIEW_SIZE, { fit: "fill", kernel: sharp.kernel.lanczos3 })
      .ensureAlpha()
      .composite([{ input: createMask(shape), blend: "dest-in" }]),
    outputPath
  );
};

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

const createManifestImage = async (
  filePath: string,
  relativePath: string
): Promise<ManifestImage> => {
  const contents = await readFile(filePath);
  return {
    relativePath,
    sha256: sha256Buffer(contents),
    ...(await getImageMetadata(filePath)),
  };
};

const generateNotificationMask = async (sourceIcon: string, outputPath: string) => {
  const resizedSource = await sharp(sourceIcon)
    .rotate()
    .resize(NOTIFICATION_ICON_SIZE, NOTIFICATION_ICON_SIZE, {
      fit: "contain",
      background: TRANSPARENT,
      kernel: sharp.kernel.lanczos3,
    })
    .ensureAlpha()
    .toColourspace("srgb")
    .png(PNG_OPTIONS)
    .toBuffer();
  const opaqueArtwork = await sharp(resizedSource)
    .extractChannel("alpha")
    .threshold(NOTIFICATION_ALPHA_THRESHOLD)
    .raw()
    .toBuffer();
  const darkArtwork = await sharp(resizedSource)
    .removeAlpha()
    .greyscale()
    .extractChannel(0)
    .threshold(NOTIFICATION_LUMINANCE_THRESHOLD)
    .negate()
    .raw()
    .toBuffer();
  const mask = await sharp(darkArtwork, {
    raw: { width: NOTIFICATION_ICON_SIZE, height: NOTIFICATION_ICON_SIZE, channels: 1 },
  })
    .boolean(opaqueArtwork, "and", {
      raw: { width: NOTIFICATION_ICON_SIZE, height: NOTIFICATION_ICON_SIZE, channels: 1 },
    })
    .extractChannel(0)
    .raw()
    .toBuffer();

  await writePng(
    sharp({
      create: {
        width: NOTIFICATION_ICON_SIZE,
        height: NOTIFICATION_ICON_SIZE,
        channels: 3,
        background: "#ffffff",
      },
    }).joinChannel(mask, {
      raw: { width: NOTIFICATION_ICON_SIZE, height: NOTIFICATION_ICON_SIZE, channels: 1 },
    }),
    outputPath
  );
};

const generateOutputs = async (
  sourceIcon: string,
  backgroundColor: string,
  outputPaths: Record<AssetOutputName, string>
) => {
  await writePng(
    sharp(sourceIcon)
      .rotate()
      .resize(APPLE_ICON_SIZE, APPLE_ICON_SIZE, {
        fit: "contain",
        background: backgroundColor,
        kernel: sharp.kernel.lanczos3,
      })
      .flatten({ background: backgroundColor }),
    outputPaths.appleIcon
  );

  await writePng(
    sharp(sourceIcon)
      .rotate()
      .resize(ANDROID_LEGACY_SIZE, ANDROID_LEGACY_SIZE, {
        fit: "contain",
        background: backgroundColor,
        kernel: sharp.kernel.lanczos3,
      })
      .flatten({ background: backgroundColor }),
    outputPaths.androidLegacyIcon
  );

  const adaptiveArtwork = await sharp(sourceIcon)
    .rotate()
    .resize(ADAPTIVE_ARTWORK_SIZE, ADAPTIVE_ARTWORK_SIZE, {
      fit: "contain",
      background: TRANSPARENT,
      kernel: sharp.kernel.lanczos3,
    })
    .toColourspace("srgb")
    .png(PNG_OPTIONS)
    .toBuffer();
  await writePng(
    sharp({
      create: {
        width: ADAPTIVE_ICON_SIZE,
        height: ADAPTIVE_ICON_SIZE,
        channels: 4,
        background: TRANSPARENT,
      },
    }).composite([{ input: adaptiveArtwork, gravity: "center" }]),
    outputPaths.androidAdaptiveForeground
  );
  await writePng(
    sharp({
      create: {
        width: ADAPTIVE_ICON_SIZE,
        height: ADAPTIVE_ICON_SIZE,
        channels: 3,
        background: backgroundColor,
      },
    }),
    outputPaths.androidAdaptiveBackground
  );

  await generateNotificationMask(sourceIcon, outputPaths.notificationIcon);

  await writePng(
    sharp({
      create: {
        width: SPLASH_WIDTH,
        height: SPLASH_HEIGHT,
        channels: 3,
        background: backgroundColor,
      },
    })
      .composite([
        {
          input: await sharp(sourceIcon)
            .rotate()
            .resize(SPLASH_ARTWORK_SIZE, SPLASH_ARTWORK_SIZE, {
              fit: "contain",
              background: TRANSPARENT,
              kernel: sharp.kernel.lanczos3,
            })
            .toColourspace("srgb")
            .png(PNG_OPTIONS)
            .toBuffer(),
          gravity: "center",
        },
      ])
      .removeAlpha(),
    outputPaths.splash
  );

  await writePng(
    sharp(sourceIcon).rotate().resize(RUNTIME_LOGO_SIZE, RUNTIME_LOGO_SIZE, {
      fit: "contain",
      background: TRANSPARENT,
      kernel: sharp.kernel.lanczos3,
    }),
    outputPaths.runtimeLogo
  );

  const appleIcon = await readFile(outputPaths.appleIcon);
  await createMaskedPreview(appleIcon, "apple", outputPaths.applePreview);

  const adaptiveComposite = await sharp(outputPaths.androidAdaptiveBackground)
    .composite([{ input: outputPaths.androidAdaptiveForeground }])
    .toColourspace("srgb")
    .png(PNG_OPTIONS)
    .toBuffer();
  await createMaskedPreview(adaptiveComposite, "circle", outputPaths.androidCirclePreview);
  await createMaskedPreview(adaptiveComposite, "squircle", outputPaths.androidSquirclePreview);

  const notificationPreviewIcon = await sharp(outputPaths.notificationIcon)
    .resize(192, 192, { fit: "contain", kernel: sharp.kernel.nearest })
    .png(PNG_OPTIONS)
    .toBuffer();
  await writePng(
    sharp({
      create: {
        width: PREVIEW_SIZE,
        height: PREVIEW_SIZE,
        channels: 3,
        background: "#343434",
      },
    })
      .composite([{ input: notificationPreviewIcon, gravity: "center" }])
      .removeAlpha(),
    outputPaths.notificationPreview
  );
};

const createManifest = async (
  tenantId: string,
  sourceIcon: string,
  temporaryOutputPaths: Record<AssetOutputName, string>
): Promise<AssetManifest> => {
  const canonicalPaths = getTenantAssetPaths(tenantId);
  const outputs = {} as Record<AssetOutputName, ManifestImage>;

  for (const name of Object.keys(ASSET_OUTPUT_FILES) as AssetOutputName[]) {
    outputs[name] = await createManifestImage(
      temporaryOutputPaths[name],
      toManifestPath(canonicalPaths.tenantDirectory, canonicalPaths.outputs[name])
    );
  }

  return {
    generatorVersion: GENERATOR_VERSION,
    tenantId,
    rules: {
      adaptiveSafeZoneRatio: ADAPTIVE_SAFE_ZONE_RATIO,
      notificationMask:
        `Source alpha >= ${NOTIFICATION_ALPHA_THRESHOLD} and grayscale luminance ` +
        `< ${NOTIFICATION_LUMINANCE_THRESHOLD} becomes opaque white; all other pixels ` +
        "become transparent.",
    },
    source: await createManifestImage(sourceIcon, "source/app-icon.png"),
    outputs,
  };
};

const replaceGeneratedDirectory = async (temporaryDirectory: string, targetDirectory: string) => {
  const backupDirectory = `${targetDirectory}.backup-${randomUUID()}`;
  const targetExists = await fileExists(targetDirectory);

  if (targetExists) await rename(targetDirectory, backupDirectory);

  try {
    await rename(temporaryDirectory, targetDirectory);
    if (targetExists) await rm(backupDirectory, { recursive: true, force: true });
  } catch (error) {
    if (targetExists && !(await fileExists(targetDirectory))) {
      await rename(backupDirectory, targetDirectory);
    }
    throw error;
  }
};

export const generateTenantAssets = async (tenantId: string): Promise<AssetManifest> => {
  const tenant = getTenant(tenantId);
  const canonicalPaths = getTenantAssetPaths(tenantId);
  if (!(await fileExists(canonicalPaths.sourceIcon))) {
    throw new Error(`Tenant source artwork does not exist: ${canonicalPaths.sourceIcon}`);
  }

  await mkdir(canonicalPaths.tenantDirectory, { recursive: true });
  const temporaryDirectory = await mkdtemp(
    path.join(canonicalPaths.tenantDirectory, ".generated-")
  );
  const temporaryPaths = getTenantAssetPaths(tenantId, temporaryDirectory);

  try {
    await generateOutputs(
      canonicalPaths.sourceIcon,
      tenant.brand.backgroundColor,
      temporaryPaths.outputs
    );
    const manifest = await createManifest(
      tenantId,
      canonicalPaths.sourceIcon,
      temporaryPaths.outputs
    );
    const temporaryManifest = `${temporaryPaths.manifest}.tmp`;
    await writeFile(temporaryManifest, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
    await rename(temporaryManifest, temporaryPaths.manifest);

    const checks = await validateGeneratedDirectory(tenantId, temporaryDirectory);
    const failures = checks.filter(({ ok }) => !ok);
    if (failures.length > 0) {
      throw new Error(
        `Generated assets failed validation:\n${failures
          .map(({ name, message }) => `- ${name}: ${message}`)
          .join("\n")}`
      );
    }

    await replaceGeneratedDirectory(temporaryDirectory, canonicalPaths.generatedDirectory);
    return manifest;
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
};
