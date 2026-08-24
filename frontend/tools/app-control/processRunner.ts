import { spawn } from "node:child_process";
import type { CommandSpec, CommandStep } from "./types";

export interface CommandRunnerDependencies {
  spawnProcess?: typeof spawn;
}

const runStep = (
  step: CommandStep,
  { spawnProcess = spawn }: CommandRunnerDependencies
): Promise<number> =>
  new Promise((resolve) => {
    const child = spawnProcess(step.command, step.args, {
      stdio: "inherit",
      env: { ...process.env, ...step.env },
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
      console.error(`${step.label} could not start: ${error.message}`);
      resolve(1);
    });

    child.once("close", (code, signal) => {
      removeSignalHandlers();

      if (signal) {
        console.error(`${step.label} stopped by ${signal}`);
        resolve(1);
        return;
      }

      resolve(code ?? 1);
    });
  });

export const createCommandRunner =
  (dependencies: CommandRunnerDependencies = {}) =>
  async (spec: CommandSpec): Promise<number> => {
    if (spec.prerequisite) {
      const prerequisiteExitCode = await runStep(spec.prerequisite, dependencies);
      if (prerequisiteExitCode !== 0) {
        return prerequisiteExitCode;
      }
    }

    return runStep(spec, dependencies);
  };

export const runCommand = (spec: CommandSpec): Promise<number> => createCommandRunner()(spec);
