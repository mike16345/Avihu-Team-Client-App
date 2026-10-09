import { createRequire } from "node:module";
import { join } from "node:path";
import { renderError } from "../cli-ui/render";
import { installDeviceHubCompatibility } from "./iosSimulatorCompatibility";

const run = async (): Promise<void> => {
  const args = process.argv.slice(2);
  const usesSimulator = args[0] === "start" || args[0] === "run:ios";
  const isHelp = args.includes("--help") || args.includes("-h");
  if (usesSimulator && !isHelp) {
    await installDeviceHubCompatibility();
  }

  createRequire(join(__dirname, "expoCli.ts"))("@expo/cli");
};

run().catch((error: unknown) => {
  console.error(renderError(error instanceof Error ? error.message : "Unable to launch Expo"));
  process.exitCode = 1;
});
