import { createHash, randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { getTenant } from "../../config/tenants/registry";
import { assertTenantEasActionAllowed, parseTenantEnvironment } from "../../config/tenants/schema";
import { EAS_CLI_ARGS } from "../eas/constants";
import { renderError, renderStatusLine } from "../cli-ui/render";
import { runCommand } from "./processRunner";
import type { AppSelection, CommandSpec, CommandStep } from "./types";

type Selection = Pick<AppSelection, "tenantId" | "environment">;
const manifestName = "sentry-publication.json";
const destination = (selection: Selection) => getTenant(selection.tenantId).monitoring?.sentry;
const assertAllowed = (selection: Selection): void => {
  const tenant = getTenant(selection.tenantId);
  assertTenantEasActionAllowed(tenant, "Sentry artifact publication and retry");
  if (tenant.kind === "local" || selection.environment === "development")
    throw new Error(
      "Sentry artifact publication requires a repository tenant and release environment"
    );
};
export const assertSentryUploadCredentials = (
  selection: Selection,
  env: Readonly<Record<string, string | undefined>>
): void => {
  if (!destination(selection)) return;
  if (!env.SENTRY_AUTH_TOKEN?.trim())
    throw new Error("Set SENTRY_AUTH_TOKEN before publishing or retrying Sentry artifact upload");
};
export const createArtifactDirectory = (selection: Selection): string =>
  join(".sentry-artifacts", selection.tenantId, selection.environment, randomUUID());
const validateDirectory = (directory: string): string => {
  const path = resolve(directory);
  const root = resolve(".sentry-artifacts");
  // The installed SDK uploader interpolates paths into a shell command.
  if (!path.startsWith(root + "/") || !/^[a-zA-Z0-9_./-]+$/.test(path))
    throw new Error(
      "Use an invocation directory under .sentry-artifacts in a workspace path without spaces or shell characters"
    );
  return path;
};
const collectFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const path = join(directory, entry.name);
      if (entry.isSymbolicLink()) throw new Error("Artifact symlinks are not supported");
      return entry.isDirectory()
        ? collectFiles(path)
        : entry.isFile() && /\.(js|hbc|map)$/.test(path)
          ? [path]
          : [];
    })
    .sort();
const hashes = (directory: string) =>
  Object.fromEntries(
    collectFiles(directory).map((path) => [
      path.slice(directory.length + 1),
      createHash("sha256").update(readFileSync(path)).digest("hex"),
    ])
  );
const identity = (selection: Selection) => ({
  tenantId: selection.tenantId,
  environment: selection.environment,
  runtimeVersion: getTenant(selection.tenantId).version,
  destination: destination(selection),
});
export const recordPublishedArtifacts = (selection: Selection, directory: string): void => {
  const files = collectFiles(directory);
  const bundles = files.filter((path) => /\.(js|hbc)$/.test(path));
  if (!bundles.length || bundles.some((path) => !files.includes(path + ".map")))
    throw new Error(
      "Published artifacts are missing matching bundles/source maps; preserve this directory for recovery"
    );
  // Normalize once before hashing: the installed uploader also writes this representation.
  for (const file of files.filter((path) => path.endsWith(".map"))) {
    const map = JSON.parse(readFileSync(file, "utf8"));
    if (map.debugId) map.debug_id = map.debugId;
    writeFileSync(file, JSON.stringify(map, null, 2));
  }
  writeFileSync(
    join(directory, manifestName),
    JSON.stringify(
      { ...identity(selection), state: "published", files: hashes(directory) },
      null,
      2
    )
  );
};
export const validatePublishedArtifacts = (selection: Selection, directory: string): void => {
  assertAllowed(selection);
  const manifest = JSON.parse(readFileSync(join(directory, manifestName), "utf8"));
  if (
    manifest.state !== "published" ||
    JSON.stringify(identity(selection)) !==
      JSON.stringify({
        tenantId: manifest.tenantId,
        environment: manifest.environment,
        runtimeVersion: manifest.runtimeVersion,
        destination: manifest.destination,
      })
  )
    throw new Error(
      "Artifacts do not match the selected tenant, environment, destination or runtime"
    );
  if (JSON.stringify(manifest.files) !== JSON.stringify(hashes(directory)))
    throw new Error("Published artifacts changed; upload retry refused");
};
export const createSentryArtifactUploadStep = (
  selection: Selection,
  directory: string
): CommandStep | undefined => {
  const config = destination(selection);
  if (!config) return undefined;
  return {
    command: "npx",
    args: ["tsx", "tools/app-control/sentryArtifacts.ts", "upload", directory],
    env: { APP_TENANT: selection.tenantId, APP_ENV: selection.environment },
    label: `Upload Sentry artifacts (${directory}); update already published if this fails`,
  };
};
export const createSentryUploadRetryCommand = (
  selection: Selection,
  directory: string
): CommandSpec => {
  assertAllowed(selection);
  const step = createSentryArtifactUploadStep(selection, directory);
  if (!step) throw new Error("Selected tenant has no Sentry destination");
  return step;
};
const main = async (): Promise<number> => {
  const tenantId = process.env.APP_TENANT;
  if (!tenantId) throw new Error("APP_TENANT is required");
  const selection = { tenantId, environment: parseTenantEnvironment(process.env.APP_ENV) };
  assertAllowed(selection);
  assertSentryUploadCredentials(selection, process.env);
  const [mode, rawDirectory, ...args] = process.argv.slice(2);
  if (!rawDirectory) throw new Error("Artifact directory is required");
  const directory = validateDirectory(rawDirectory);
  const config = destination(selection);
  if (!config) throw new Error("Selected tenant has no Sentry destination");
  if (mode === "publish") {
    mkdirSync(dirname(directory), { recursive: true });
    mkdirSync(directory, { recursive: false });
    const code = await runCommand({
      command: "npx",
      args: [...EAS_CLI_ARGS, "update", ...args, "--input-dir", directory, "--emit-metadata"],
      env: { APP_TENANT: tenantId, APP_ENV: selection.environment },
      label: "Publish EAS update",
    });
    if (code !== 0) return code;
    try {
      recordPublishedArtifacts(selection, directory);
    } catch {
      throw new Error(
        `Update published but artifact preparation failed. Preserve ${directory}; do not republish to retry an upload.`
      );
    }
    return 0;
  }
  if (mode !== "upload") throw new Error("Unknown artifact action");
  validatePublishedArtifacts(selection, directory);
  const code = await runCommand({
    command: "npx",
    args: ["--no-install", "sentry-expo-upload-sourcemaps", directory],
    env: {
      APP_TENANT: tenantId,
      APP_ENV: selection.environment,
      SENTRY_ORG: config.organization,
      SENTRY_PROJECT: config.project,
      SENTRY_URL: "https://sentry.io/",
      EXPO_NO_DOTENV: "1",
    },
    label: "Upload matching Sentry bundles and source maps",
  });
  if (code !== 0)
    console.error(
      renderStatusLine(
        "warn",
        `Update already published; retry upload only with npm run app -- sentry-upload --tenant ${tenantId} --environment ${selection.environment} --artifacts ${rawDirectory} --yes`
      )
    );
  return code;
};
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main()
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error) => {
      console.error(
        renderError(error instanceof Error ? error.message : "Sentry artifact action failed")
      );
      process.exitCode = 1;
    });
}
