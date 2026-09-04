import { parseProjectEnv } from "@expo/env";
import type { ProcessEnvironment } from "./contexts";

export const resolveExpoProjectEnvironment = (
  projectRoot: string,
  processEnv: ProcessEnvironment
): ProcessEnvironment => {
  const { env } = parseProjectEnv(projectRoot, {
    mode: processEnv.NODE_ENV ?? "",
    silent: true,
    systemEnv: processEnv as NodeJS.ProcessEnv,
  });
  return { ...env, ...processEnv };
};
