export interface TenantVerificationSpec {
  command: "npx" | "npm";
  args: string[];
  cwd: string;
  env: NodeJS.ProcessEnv;
}

export type TenantVerificationRunner = (spec: TenantVerificationSpec) => Promise<number>;

export const verifyNewTenant = async (
  frontendRoot: string,
  tenantId: string,
  runner: TenantVerificationRunner
) => {
  const env = { ...process.env, APP_TENANT: tenantId, APP_ENV: "development" };
  const prebuildExit = await runner({
    command: "npx",
    args: ["expo", "prebuild", "--clean", "--no-install"],
    cwd: frontendRoot,
    env,
  });
  if (prebuildExit !== 0) throw new Error(`Clean Expo prebuild failed (exit ${prebuildExit})`);

  const preflightExit = await runner({
    command: "npm",
    args: ["run", "preflight", "--", "--tenant", tenantId, "--environment", "development"],
    cwd: frontendRoot,
    env,
  });
  if (preflightExit !== 0) throw new Error(`Fast preflight failed (exit ${preflightExit})`);
};
