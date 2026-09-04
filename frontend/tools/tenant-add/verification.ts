export interface TenantVerificationSpec {
  command: "npx" | "npm";
  args: string[];
  cwd: string;
  env: NodeJS.ProcessEnv;
}

export interface TenantVerificationResult {
  exitCode: number;
  output: string;
}

export type TenantVerificationRunner = (
  spec: TenantVerificationSpec
) => Promise<TenantVerificationResult>;

const formatFailure = (summary: string, result: TenantVerificationResult) => {
  const output = result.output.trim().split("\n").slice(-40).join("\n");
  return `${summary} (exit ${result.exitCode})${output ? `\n${output}` : ""}`;
};

export const verifyNewTenant = async (
  frontendRoot: string,
  tenantId: string,
  runner: TenantVerificationRunner,
  onStage: (stage: string) => void = () => undefined
) => {
  const env = { ...process.env, APP_TENANT: tenantId, APP_ENV: "development" };
  onStage("Generating native project");
  const prebuild = await runner({
    command: "npx",
    args: ["expo", "prebuild", "--clean", "--no-install"],
    cwd: frontendRoot,
    env: { ...env, EXPO_NO_GIT_STATUS: "1" },
  });
  if (prebuild.exitCode !== 0)
    throw new Error(formatFailure("Clean Expo prebuild failed", prebuild));

  onStage("Running tenant preflight");
  const preflight = await runner({
    command: "npm",
    args: ["run", "preflight", "--", "--tenant", tenantId, "--environment", "development"],
    cwd: frontendRoot,
    env,
  });
  if (preflight.exitCode !== 0) throw new Error(formatFailure("Fast preflight failed", preflight));
};
