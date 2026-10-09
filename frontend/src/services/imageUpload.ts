export type ImageUploadStage = "requestSignedUrl" | "readFile" | "putToS3";
export interface UploadFileMetadata { mimeType: string; size: number; }

export class ImageUploadError extends Error {
  constructor(
    message: string,
    public readonly stage: ImageUploadStage,
    public readonly cause?: unknown,
    public readonly status?: number,
    public readonly requestId?: string | null,
    public readonly fileMetadata?: UploadFileMetadata,
    public readonly responseBody?: string
  ) {
    super(message);
    this.name = "ImageUploadError";
  }
}

const assertResponse = async (
  response: Response,
  stage: ImageUploadStage,
  fileMetadata?: UploadFileMetadata
): Promise<void> => {
  if (response.ok) return;
  let body: string | undefined;
  try { body = (await response.text()).slice(0, 2000); } catch { /* HTTP status still identifies the failure. */ }
  throw new ImageUploadError(`Image ${stage} failed: HTTP ${response.status}`, stage, undefined,
    response.status, response.headers.get("x-request-id") ?? response.headers.get("x-amz-request-id"), fileMetadata, body);
};

export const uploadImageFile = async (input: {
  fileUri: string;
  signedUrlRequest: string;
  headers: Headers;
}): Promise<{ fileMetadata: UploadFileMetadata; presignedUrl: string }> => {
  let stage: ImageUploadStage = "requestSignedUrl";
  let fileMetadata: UploadFileMetadata | undefined;
  try {
    const signedResponse = await fetch(input.signedUrlRequest, { method: "POST", headers: input.headers });
    await assertResponse(signedResponse, stage);
    const envelope: unknown = await signedResponse.json();
    const presignedUrl = (envelope as { data?: unknown } | null)?.data;
    if (typeof presignedUrl !== "string" || !/^https:\/\//i.test(presignedUrl)) {
      throw new ImageUploadError("Invalid signed image upload URL response", stage);
    }
    stage = "readFile";
    const fileResponse = await fetch(input.fileUri);
    await assertResponse(fileResponse, stage);
    const blob = await fileResponse.blob();
    fileMetadata = { mimeType: blob.type || "image/jpeg", size: blob.size };
    stage = "putToS3";
    const uploadResponse = await fetch(presignedUrl, {
      method: "PUT", headers: { "Content-Type": fileMetadata.mimeType }, body: blob,
    });
    await assertResponse(uploadResponse, stage, fileMetadata);
    return { presignedUrl, fileMetadata };
  } catch (error) {
    if (error instanceof ImageUploadError) throw error;
    const message = error instanceof Error ? error.message : "Unknown upload failure";
    throw new ImageUploadError(message, stage, error, undefined, undefined, fileMetadata);
  }
};
