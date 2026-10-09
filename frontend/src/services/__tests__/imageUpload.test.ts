import { afterEach, describe, expect, it, vi } from "vitest";
import { uploadImageFile } from "../imageUpload";
afterEach(() => vi.unstubAllGlobals());
const input = { fileUri: "file:///image.jpg", signedUrlRequest: "https://api.example/signed", headers: new Headers() };
const signed = () => new Response(JSON.stringify({ data: "https://s3.example/file?X-Amz-Signature=PRIVATE" }), { status: 200 });
describe("image upload", () => {
  it("rejects signed URL HTTP failure with stage, status, and request ID", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("denied", { status: 403, headers: { "x-request-id": "req-1" } })));
    await expect(uploadImageFile(input)).rejects.toMatchObject({ stage: "requestSignedUrl", status: 403, requestId: "req-1" });
  });
  it("rejects malformed signed URL responses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: null }))));
    await expect(uploadImageFile(input)).rejects.toMatchObject({ stage: "requestSignedUrl" });
  });
  it("preserves local file failures as a cause", async () => {
    const original = new Error("file gone");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(signed()).mockRejectedValueOnce(original));
    await expect(uploadImageFile(input)).rejects.toMatchObject({ stage: "readFile", cause: original });
  });
  it("never treats S3 HTTP failure as upload success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(signed()).mockResolvedValueOnce(new Response(new Blob(["image"], { type: "image/jpeg" }))).mockResolvedValueOnce(new Response("S3 denied", { status: 500 })));
    await expect(uploadImageFile(input)).rejects.toMatchObject({ stage: "putToS3", status: 500, fileMetadata: { size: 5, mimeType: "image/jpeg" } });
  });
  it("returns metadata on successful upload and preserves network causes", async () => {
    const fetch = vi.fn().mockResolvedValueOnce(signed()).mockResolvedValueOnce(new Response(new Blob(["image"], { type: "image/jpeg" }))).mockResolvedValueOnce(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetch);
    expect(await uploadImageFile(input)).toMatchObject({ fileMetadata: { size: 5, mimeType: "image/jpeg" } });
    const original = new Error("network unavailable"); fetch.mockRejectedValueOnce(original);
    await expect(uploadImageFile(input)).rejects.toMatchObject({ stage: "requestSignedUrl", cause: original });
  });
});
