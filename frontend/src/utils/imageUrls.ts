type SignedImageUploadParams = {
  userId: string;
  date: string;
  imageName: string;
};

const encodePathSegment = (segment: string) => {
  let decodedSegment = segment;

  try {
    decodedSegment = decodeURIComponent(segment);
  } catch {
    // Treat malformed percent escapes as literal characters.
  }

  return encodeURIComponent(decodedSegment.normalize("NFC"));
};

export const encodeCloudFrontPath = (path: string) => {
  return path.split("/").map(encodePathSegment).join("/");
};

export const buildSignedImageUploadUrl = (apiUrl: string, params: SignedImageUploadParams) => {
  return `${apiUrl.replace(/\/$/, "")}/signedUrl?${new URLSearchParams(params).toString()}`;
};

export const createImageObjectName = (timestamp = Date.now(), randomValue = Math.random()) => {
  const timePart = timestamp.toString(36);
  const randomPart = Math.floor(randomValue * 0x100000000)
    .toString(36)
    .padStart(7, "0");

  return `image-${timePart}-${randomPart}`;
};
