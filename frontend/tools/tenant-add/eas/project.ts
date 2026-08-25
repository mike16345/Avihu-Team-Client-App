import { z } from "zod";
import { EAS_CLI_ARGS } from "../../eas/constants";
import { withIsolatedEasWorkspace } from "./workspace";
import type {
  EasLinkedProjectRequest,
  EasProjectIdentity,
  EasProjectRequest,
  EasProjectRunner,
} from "./types";

const responseSchema = z
  .object({
    owner: z.string().min(1),
    slug: z.string().min(1),
    projectId: z.string().uuid(),
  })
  .passthrough();

const parseIdentity = (
  stdout: string,
  expected: { owner?: string; slug: string }
): EasProjectIdentity => {
  let json: unknown;
  try {
    json = JSON.parse(stdout);
  } catch {
    throw new Error("EAS returned malformed project JSON");
  }
  const parsed = responseSchema.parse(json);
  if (expected.owner && parsed.owner !== expected.owner) {
    throw new Error(
      `EAS project owner mismatch: expected ${expected.owner}, received ${parsed.owner}`
    );
  }
  if (parsed.slug !== expected.slug) {
    throw new Error(
      `EAS project slug mismatch: expected ${expected.slug}, received ${parsed.slug}`
    );
  }
  return {
    ...parsed,
    updateUrl: `https://u.expo.dev/${parsed.projectId}`,
  };
};

const runProjectInit = async (
  runner: EasProjectRunner,
  request: EasProjectRequest,
  initArgs: string[]
) =>
  withIsolatedEasWorkspace(request, async (cwd) => {
    const result = await runner({
      command: "npx",
      args: [
        ...EAS_CLI_ARGS,
        "project:init",
        ...initArgs,
        "--json",
        "--non-interactive",
        "--no-icon",
      ],
      cwd,
      env: process.env,
    });
    if (result.exitCode !== 0) {
      throw new Error(
        `EAS project initialization failed: ${result.stderr.trim() || `exit ${result.exitCode}`}`
      );
    }
    return parseIdentity(result.stdout, { owner: request.owner, slug: request.slug });
  });

export const getAuthenticatedExpoUser = async (runner: EasProjectRunner, cwd: string) => {
  const result = await runner({
    command: "npx",
    args: [...EAS_CLI_ARGS, "whoami"],
    cwd,
    env: process.env,
  });
  if (result.exitCode !== 0 || !result.stdout.trim()) {
    throw new Error("Expo authentication is required. Run: eas login");
  }
  return result.stdout.trim();
};

export const createEasProject = (runner: EasProjectRunner, request: EasProjectRequest) =>
  runProjectInit(runner, request, ["--account", request.owner]);

export const verifyLinkedEasProject = (
  runner: EasProjectRunner,
  request: EasLinkedProjectRequest
) => runProjectInit(runner, request, ["--id", request.projectId]);
