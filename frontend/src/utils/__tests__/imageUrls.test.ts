import { describe, expect, it } from "vitest";
import {
  buildSignedImageUploadUrl,
  createImageObjectName,
  encodeCloudFrontPath,
} from "../imageUrls";

describe("image URL helpers", () => {
  it("encodes Unicode CloudFront path segments without changing folder separators", () => {
    expect(
      encodeCloudFrontPath(
        "25580aec-55c3-4c8f-9161-cee99d487595/2026-09-02/איך בכלל יודעים אם יש לי שחלות פוליציסטיות?-image"
      )
    ).toBe(
      "25580aec-55c3-4c8f-9161-cee99d487595/2026-09-02/%D7%90%D7%99%D7%9A%20%D7%91%D7%9B%D7%9C%D7%9C%20%D7%99%D7%95%D7%93%D7%A2%D7%99%D7%9D%20%D7%90%D7%9D%20%D7%99%D7%A9%20%D7%9C%D7%99%20%D7%A9%D7%97%D7%9C%D7%95%D7%AA%20%D7%A4%D7%95%D7%9C%D7%99%D7%A6%D7%99%D7%A1%D7%98%D7%99%D7%95%D7%AA%3F-image"
    );
  });

  it("does not double-encode an already encoded CloudFront path", () => {
    expect(encodeCloudFrontPath("user/date/%D7%AA%D7%9E%D7%95%D7%A0%D7%94-image")).toBe(
      "user/date/%D7%AA%D7%9E%D7%95%D7%A0%D7%94-image"
    );
  });

  it("encodes every signed-upload query parameter", () => {
    const url = buildSignedImageUploadUrl("https://api.example.com", {
      userId: "user/א",
      date: "2026-09-02",
      imageName: "תמונה & cover",
    });

    expect(url).toBe(
      "https://api.example.com/signedUrl?userId=user%2F%D7%90&date=2026-09-02&imageName=%D7%AA%D7%9E%D7%95%D7%A0%D7%94+%26+cover"
    );
  });

  it("creates an ASCII-only object name", () => {
    expect(createImageObjectName(1_788_396_123_456, 0.5)).toBe("image-mtksvkg0-0zik0zk");
  });
});
