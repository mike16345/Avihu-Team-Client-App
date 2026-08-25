import { normalizeAndroidWirelessDevices } from "./androidWireless";

try {
  const result = normalizeAndroidWirelessDevices();
  if (result.normalized) {
    console.log(`Prepared wireless Android device: ${result.endpoints.join(", ")}`);
  }
} catch (error) {
  const message = error instanceof Error ? error.message : "Unable to prepare Android device";
  console.error(message);
  process.exitCode = 1;
}
