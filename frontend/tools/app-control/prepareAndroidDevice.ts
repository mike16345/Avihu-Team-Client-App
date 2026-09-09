import { normalizeAndroidWirelessDevices } from "./androidWireless";
import { renderDetailLines, renderError, renderHeader, renderStatusLine } from "../cli-ui/render";

try {
  const result = normalizeAndroidWirelessDevices();
  if (result.normalized) {
    console.log(
      [
        renderHeader("Android device"),
        renderStatusLine("pass", "Wireless connection prepared"),
        renderDetailLines(result.endpoints),
        "│",
        "└  Device ready",
      ].join("\n")
    );
  }
} catch (error) {
  const message = error instanceof Error ? error.message : "Unable to prepare Android device";
  console.error(renderError(message));
  process.exitCode = 1;
}
