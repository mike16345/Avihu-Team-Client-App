import { spawn } from "node:child_process";
import type { CommandSpec } from "./types";

export const runCommand = (spec: CommandSpec): Promise<number> =>
  new Promise((resolve) => {
    const child = spawn(spec.command, spec.args, {
      stdio: "inherit",
      env: { ...process.env, ...spec.env },
    });
    const forwardSignal = (signal: NodeJS.Signals) => {
      child.kill(signal);
    };
    const removeSignalHandlers = () => {
      process.off("SIGINT", forwardSignal);
      process.off("SIGTERM", forwardSignal);
    };

    process.once("SIGINT", forwardSignal);
    process.once("SIGTERM", forwardSignal);

    child.once("error", (error) => {
      removeSignalHandlers();
      console.error(`${spec.label} could not start: ${error.message}`);
      resolve(1);
    });

    child.once("close", (code, signal) => {
      removeSignalHandlers();

      if (signal) {
        process.kill(process.pid, signal);
        return;
      }

      resolve(code ?? 1);
    });
  });
