import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import sharp from "sharp";

export interface LogoInput {
  tenantId: string;
  primaryColor: string;
  onPrimaryColor: string;
  logoPath?: string;
}

export interface LogoResult {
  contents: Buffer;
  source: "provided" | "fallback";
}

const assertVisible = async (contents: Buffer) => {
  const stats = await sharp(contents).ensureAlpha().stats();
  if (stats.channels[3]?.max === 0) throw new Error("Logo artwork cannot be fully transparent");
};

export const normalizeOrCreateLogo = async (input: LogoInput): Promise<LogoResult> => {
  if (input.logoPath) {
    const source = await readFile(input.logoPath);
    await assertVisible(source);
    return {
      contents: await sharp(source)
        .rotate()
        .resize(1024, 1024, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toColourspace("srgb")
        .png()
        .toBuffer(),
      source: "provided",
    };
  }

  const rotation = createHash("sha256").update(input.tenantId).digest()[0] % 4;
  const svg =
    Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
    <rect x="112" y="112" width="800" height="800" rx="208" fill="${input.primaryColor}"/>
    <g transform="rotate(${rotation * 45} 512 512)" fill="${input.onPrimaryColor}">
      <circle cx="512" cy="400" r="144"/><path d="M300 700 512 474 724 700Z"/>
    </g>
  </svg>`);
  return { contents: await sharp(svg).png().toBuffer(), source: "fallback" };
};
