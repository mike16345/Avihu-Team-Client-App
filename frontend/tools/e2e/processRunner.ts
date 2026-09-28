import { spawn } from "node:child_process";

export interface ProcessSpec {
  command: string;
  args: string[];
  env?: Readonly<Record<string, string | undefined>>;
  stdio?: "pipe" | "inherit";
}

export interface ProcessResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

export type ProcessRunner = (spec: ProcessSpec) => Promise<ProcessResult>;

export const runProcess: ProcessRunner = ({ command, args, env, stdio = "pipe" }) =>
  new Promise((resolve) => {
    const child = spawn(command, args, {
      env: env as NodeJS.ProcessEnv | undefined,
      shell: false,
      stdio,
    });
    let stdout = "";
    let stderr = "";
    let settled = false;

    child.stdout?.setEncoding("utf8");
    child.stderr?.setEncoding("utf8");
    child.stdout?.on("data", (chunk: string) => {
      stdout += chunk;
    });
    child.stderr?.on("data", (chunk: string) => {
      stderr += chunk;
    });
    child.on("error", (error) => {
      if (settled) return;
      settled = true;
      resolve({ exitCode: 127, stdout, stderr: error.message });
    });
    child.on("close", (exitCode) => {
      if (settled) return;
      settled = true;
      resolve({ exitCode: exitCode ?? 1, stdout, stderr });
    });
  });
