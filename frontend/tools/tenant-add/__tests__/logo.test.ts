import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { normalizeOrCreateLogo } from "../logo";

const digest = (value: Buffer) => createHash("sha256").update(value).digest("hex");

describe("tenant:add logo", () => {
  it("creates a deterministic 1024px fallback without relying on fonts", async () => {
    const input = {
      tenantId: "test-tenant",
      primaryColor: "#5B21B6",
      onPrimaryColor: "#FFFFFF",
    };
    const first = await normalizeOrCreateLogo(input);
    const second = await normalizeOrCreateLogo(input);
    expect(digest(first.contents)).toBe(digest(second.contents));
    expect(await sharp(first.contents).metadata()).toMatchObject({
      format: "png",
      width: 1024,
      height: 1024,
    });
    expect(first.source).toBe("fallback");
  });
});
