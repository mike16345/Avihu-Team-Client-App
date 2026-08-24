import { lstat, readFile, realpath, rm } from "node:fs/promises";
import path from "node:path";
import { glob } from "fast-glob";
import { getTenant } from "../../config/tenants/registry";
import { collectAssetReferences } from "./references";
import { ASSET_OUTPUT_FILES, type AssetOutputName } from "./types";

const ASSET_FILE_PATTERN = "**/*.{png,jpg,jpeg,svg,webp,gif,ttf,otf}";
const EXCLUDED_DIRECTORIES = [
  "**/node_modules/**",
  "**/.expo/**",
  "**/dist/**",
  "**/Pods/**",
  "**/.gradle/**",
  "**/build/**",
];

export type AssetClassification = "used" | "stale-generated" | "proven-unused" | "ambiguous";

export interface AssetAuditEntry {
  absolutePath: string;
  relativePath: string;
  classification: AssetClassification;
  reason: string;
}

export interface AssetAuditReport {
  tenantId: string;
  entries: AssetAuditEntry[];
  summary: Record<AssetClassification, number>;
  deleted: string[];
}

export interface AuditAssetsOptions {
  tenantId: string;
  projectRoot?: string;
  clean?: boolean;
  yes?: boolean;
  confirmCleanup?: (entries: AssetAuditEntry[]) => Promise<boolean>;
}

interface GeneratedManifest {
  source?: { relativePath?: unknown };
  outputs?: Record<string, { relativePath?: unknown }>;
}

const toPosix = (filePath: string) => filePath.split(path.sep).join("/");

const isWithin = (candidate: string, root: string) => {
  const relative = path.relative(root, candidate);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== "..");
};

const assertWithinApprovedRoots = async (candidate: string, approvedRoots: string[]) => {
  const resolvedCandidate = await realpath(candidate);
  const resolvedRoots = await Promise.all(approvedRoots.map((root) => realpath(root)));
  if (!resolvedRoots.some((root) => isWithin(resolvedCandidate, root))) {
    throw new Error(`Asset path resolves outside approved asset roots: ${candidate}`);
  }
  return resolvedCandidate;
};

const matchesAllowlist = (relativePath: string, patterns: readonly string[]) =>
  patterns.some((pattern) => {
    const expression = pattern
      .split("**")
      .map((segment) => segment.replace(/[|\\{}()[\]^$+?.]/g, "\\$&").replaceAll("*", "[^/]*"))
      .join(".*");
    return new RegExp(`^${expression}$`).test(relativePath);
  });

const readManifestPaths = async (manifestPath: string, tenantDirectory: string) => {
  let manifest: GeneratedManifest;
  try {
    manifest = JSON.parse(await readFile(manifestPath, "utf8")) as GeneratedManifest;
  } catch {
    return { valid: false, paths: new Set<string>() };
  }

  const outputNames = Object.keys(ASSET_OUTPUT_FILES) as AssetOutputName[];
  const manifestOutputs = manifest.outputs ?? {};
  const outputPaths = outputNames.map((name) => manifestOutputs[name]?.relativePath);
  if (
    typeof manifest.source?.relativePath !== "string" ||
    Object.keys(manifestOutputs).length !== outputNames.length ||
    outputPaths.some(
      (outputPath, index) =>
        typeof outputPath !== "string" ||
        outputPath !== `generated/${ASSET_OUTPUT_FILES[outputNames[index]]}`
    )
  ) {
    return { valid: false, paths: new Set<string>() };
  }

  const relativePaths = [manifest.source.relativePath, ...outputPaths];
  const paths = new Set<string>();

  for (const relativePath of relativePaths) {
    if (typeof relativePath !== "string") continue;
    const resolvedPath = path.resolve(tenantDirectory, relativePath);
    if (!isWithin(resolvedPath, tenantDirectory)) {
      throw new Error(`Generated asset manifest escapes the tenant asset root: ${relativePath}`);
    }
    paths.add(resolvedPath);
  }

  return { valid: true, paths };
};

const isInDynamicDirectory = (candidate: string, directories: Map<string, string[]>) => {
  for (const [directory, sources] of directories) {
    if (isWithin(candidate, directory)) return sources;
  }
  return undefined;
};

const getAssetFiles = async (roots: string[]) => {
  const files = await Promise.all(
    roots.map((root) =>
      glob(ASSET_FILE_PATTERN, {
        cwd: root,
        absolute: true,
        onlyFiles: false,
        followSymbolicLinks: false,
        ignore: EXCLUDED_DIRECTORIES,
      })
    )
  );
  const candidates = files.flat().map((filePath) => path.resolve(filePath));
  const fileFlags = await Promise.all(
    candidates.map(async (candidate) => {
      const stats = await lstat(candidate);
      return stats.isFile() || stats.isSymbolicLink();
    })
  );
  return candidates.filter((_, index) => fileFlags[index]);
};

export const auditAssets = async ({
  tenantId,
  projectRoot = process.cwd(),
  clean = false,
  yes = false,
  confirmCleanup,
}: AuditAssetsOptions): Promise<AssetAuditReport> => {
  getTenant(tenantId);
  const resolvedProjectRoot = path.resolve(projectRoot);
  const realProjectRoot = await realpath(resolvedProjectRoot);
  const appAssetsRoot = path.join(resolvedProjectRoot, "assets");
  const tenantDirectory = path.join(resolvedProjectRoot, "config/tenants/assets", tenantId);
  const approvedRoots = await Promise.all(
    [appAssetsRoot, tenantDirectory].map((root) => realpath(root))
  );
  if (!approvedRoots.every((root) => isWithin(root, realProjectRoot))) {
    throw new Error("Approved asset root escapes the real project root");
  }
  const generatedDirectory = path.join(approvedRoots[1], "generated");
  const manifestPath = path.join(generatedDirectory, "manifest.json");
  const references = await collectAssetReferences({ projectRoot: resolvedProjectRoot, tenantId });
  const staticPaths = new Set(
    await Promise.all(
      [...references.staticPaths].map(async (reference) => {
        try {
          return await realpath(reference);
        } catch {
          return path.resolve(reference);
        }
      })
    )
  );
  const dynamicDirectories = new Map<string, string[]>();
  for (const [directory, sources] of references.dynamicDirectories) {
    try {
      dynamicDirectories.set(await realpath(directory), sources);
    } catch {
      dynamicDirectories.set(path.resolve(directory), sources);
    }
  }
  const staticDirectories = new Set(
    await Promise.all(
      [...references.staticDirectories].map(async (directory) => {
        try {
          return await realpath(directory);
        } catch {
          return path.resolve(directory);
        }
      })
    )
  );
  const manifest = await readManifestPaths(manifestPath, approvedRoots[1]);
  const files = await getAssetFiles(approvedRoots);
  const entries: AssetAuditEntry[] = [];

  for (const absolutePath of files) {
    const candidate = await assertWithinApprovedRoots(absolutePath, approvedRoots);
    const stats = await lstat(absolutePath);
    if (stats.isSymbolicLink()) {
      throw new Error(`Asset path resolves outside approved asset roots: ${absolutePath}`);
    }

    const relativePath = toPosix(path.relative(realProjectRoot, absolutePath));
    const dynamicSources = isInDynamicDirectory(candidate, dynamicDirectories);
    const isGenerated = isWithin(candidate, generatedDirectory);
    let classification: AssetClassification;
    let reason: string;

    if (staticPaths.has(candidate)) {
      classification = "used";
      reason =
        "Referenced statically by source, configuration, plugin, native template, or font loader";
    } else if ([...staticDirectories].some((directory) => isWithin(candidate, directory))) {
      classification = "used";
      reason = "Included by a static asset-directory declaration";
    } else if (matchesAllowlist(relativePath, references.allowlistPatterns)) {
      classification = "used";
      reason = "Covered by an explicit dynamic asset allowlist entry";
    } else if (dynamicSources) {
      classification = "ambiguous";
      reason = `Dynamic asset expression in ${dynamicSources.join(", ")}`;
    } else if (references.opaqueLoaderSources.length > 0) {
      classification = "ambiguous";
      reason = `Opaque asset loader in ${references.opaqueLoaderSources.join(", ")}`;
    } else if (isWithin(candidate, path.join(approvedRoots[1], "source"))) {
      classification = "used";
      reason = "Tenant source artwork is immutable input";
    } else if (manifest.paths.has(candidate)) {
      classification = "used";
      reason = "Active generated asset manifest output";
    } else if (isGenerated && manifest.valid) {
      classification = "stale-generated";
      reason = "Generated asset is not listed by the active manifest";
    } else if (isGenerated) {
      classification = "ambiguous";
      reason = "Generated manifest is missing or unreadable";
    } else {
      classification = "proven-unused";
      reason = "No static, dynamic, configuration, manifest, or allowlist reference was found";
    }

    entries.push({ absolutePath, relativePath, classification, reason });
  }

  entries.sort((left, right) => left.relativePath.localeCompare(right.relativePath));
  const summary: Record<AssetClassification, number> = {
    used: 0,
    "stale-generated": 0,
    "proven-unused": 0,
    ambiguous: 0,
  };
  for (const entry of entries) summary[entry.classification] += 1;

  const report: AssetAuditReport = { tenantId, entries, summary, deleted: [] };
  if (!clean) return report;

  const deletionCandidates = entries.filter(
    ({ classification }) =>
      classification === "stale-generated" || classification === "proven-unused"
  );
  if (deletionCandidates.length === 0) return report;

  if (!yes) {
    if (!confirmCleanup) {
      throw new Error("Cleanup requires interactive confirmation or --yes");
    }
    if (!(await confirmCleanup(deletionCandidates))) return report;
  }

  for (const entry of deletionCandidates) {
    await assertWithinApprovedRoots(entry.absolutePath, approvedRoots);
    await rm(entry.absolutePath);
    report.deleted.push(entry.relativePath);
  }

  return report;
};
