interface CameraPermissionLike {
  granted: boolean;
  canAskAgain: boolean;
}

interface ResolveCameraPermissionInput {
  getPermission(): Promise<CameraPermissionLike>;
  requestPermission(): Promise<CameraPermissionLike>;
}

export type CameraPermissionResolution = "granted" | "denied" | "settings-required";

export const resolveCameraPermission = async (
  input: ResolveCameraPermissionInput
): Promise<CameraPermissionResolution> => {
  const currentPermission = await input.getPermission();

  if (currentPermission.granted) return "granted";
  if (!currentPermission.canAskAgain) return "settings-required";

  const requestedPermission = await input.requestPermission();
  if (requestedPermission.granted) return "granted";

  return requestedPermission.canAskAgain ? "denied" : "settings-required";
};
