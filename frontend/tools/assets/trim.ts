import sharp from "sharp";

const PNG_OPTIONS = {
  compressionLevel: 9,
  adaptiveFiltering: false,
  palette: false,
  progressive: false,
} as const;

export const trimFullyTransparentPadding = async (source: string | Buffer): Promise<Buffer> => {
  const { data, info } = await sharp(source)
    .rotate()
    .ensureAlpha()
    .toColourspace("srgb")
    .raw()
    .toBuffer({ resolveWithObject: true });
  let left = info.width;
  let top = info.height;
  let right = -1;
  let bottom = -1;

  for (let pixel = 0; pixel < info.width * info.height; pixel += 1) {
    const alpha = data[pixel * info.channels + info.channels - 1];
    if (alpha === 0) continue;

    const x = pixel % info.width;
    const y = Math.floor(pixel / info.width);
    left = Math.min(left, x);
    top = Math.min(top, y);
    right = Math.max(right, x);
    bottom = Math.max(bottom, y);
  }

  if (right < left || bottom < top) {
    throw new Error("Source artwork contains no visible pixels");
  }

  return sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: info.channels,
    },
  })
    .extract({
      left,
      top,
      width: right - left + 1,
      height: bottom - top + 1,
    })
    .toColourspace("srgb")
    .png(PNG_OPTIONS)
    .toBuffer();
};
