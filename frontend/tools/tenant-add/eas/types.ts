export interface EasProjectRunnerInput {
  command: "npx";
  args: string[];
  cwd: string;
  env: Readonly<Record<string, string | undefined>>;
}

export type EasProjectRunner = (
  input: EasProjectRunnerInput
) => Promise<{ exitCode: number; stdout: string; stderr: string }>;

export interface EasProjectIdentity {
  owner: string;
  slug: string;
  projectId: string;
  updateUrl: string;
}

export interface EasProjectRequest {
  displayName: string;
  slug: string;
  owner: string;
  sourceIcon?: string;
}

export interface EasLinkedProjectRequest {
  displayName: string;
  slug: string;
  owner?: string;
  sourceIcon?: string;
  projectId: string;
}

export type TenantEasSelection =
  { kind: "create"; owner: string } | { kind: "link"; projectId: string } | { kind: "skip" };
