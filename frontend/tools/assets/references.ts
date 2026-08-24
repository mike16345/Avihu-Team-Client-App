import { readFile } from "node:fs/promises";
import path from "node:path";
import { glob } from "fast-glob";
import { DYNAMIC_ASSET_ALLOWLIST } from "./allowlist";

const TEXT_FILE_PATTERNS = [
  "*.{js,jsx,ts,tsx,json,cjs,mjs,cts,mts,xml,plist,pbxproj,gradle,properties}",
  "src/**/*.{js,jsx,ts,tsx,json}",
  "config/**/*.{js,jsx,ts,tsx,json}",
  "tools/**/*.{js,jsx,ts,tsx,json}",
  "plugins/**/*.{js,jsx,ts,tsx,json}",
  "android/**/*.{java,kt,kts,xml,gradle,properties,json}",
  "ios/**/*.{m,mm,swift,h,plist,pbxproj,json}",
];
const EXCLUDED_DIRECTORIES = [
  "**/node_modules/**",
  "**/.expo/**",
  "**/dist/**",
  "**/Pods/**",
  "**/.gradle/**",
  "**/build/**",
];
const STATIC_ASSET_STRING = /["']([^"'\n]+\.(?:png|jpe?g|svg|webp|gif|ttf|otf))["']/gi;
const TEMPLATE_STRING = /`([^`]*\$\{[^}]+\}[^`]*)`/g;
const DYNAMIC_REQUIRE = /(?:require|import)\(\s*([^)]*\$\{[^)]*)\)/g;

export interface AssetReferenceCollection {
  staticPaths: Set<string>;
  dynamicDirectories: Map<string, string[]>;
  allowlistPatterns: readonly string[];
}

export interface CollectAssetReferencesOptions {
  projectRoot: string;
  tenantId: string;
}

const toPosix = (filePath: string) => filePath.split(path.sep).join("/");

const resolveReference = (
  value: string,
  sourceFile: string,
  projectRoot: string,
  tenantId: string
): string[] => {
  if (value.startsWith("@assets/")) {
    return [path.resolve(projectRoot, "assets", value.slice("@assets/".length))];
  }

  if (value.startsWith("tenant-assets/")) {
    return [
      path.resolve(
        projectRoot,
        "config/tenants/assets",
        tenantId,
        "generated",
        value.slice("tenant-assets/".length)
      ),
    ];
  }

  if (value.startsWith("assets/") || value.startsWith("config/tenants/assets/")) {
    return [path.resolve(projectRoot, value)];
  }

  if (value.startsWith("./") || value.startsWith("../")) {
    return [path.resolve(path.dirname(sourceFile), value), path.resolve(projectRoot, value)];
  }

  return [];
};

const getDynamicPrefix = (expression: string) => {
  const prefix = expression.slice(0, expression.indexOf("${"));
  if (!prefix) return undefined;

  const lastSlash = prefix.lastIndexOf("/");
  return lastSlash >= 0 ? prefix.slice(0, lastSlash + 1) : undefined;
};

const addDynamicDirectories = (
  collection: AssetReferenceCollection,
  expression: string,
  sourceFile: string,
  projectRoot: string,
  tenantId: string
) => {
  const prefix = getDynamicPrefix(expression);
  if (!prefix) return;

  for (const candidate of resolveReference(prefix, sourceFile, projectRoot, tenantId)) {
    const directory = path.resolve(candidate);
    const sources = collection.dynamicDirectories.get(directory) ?? [];
    sources.push(toPosix(path.relative(projectRoot, sourceFile)));
    collection.dynamicDirectories.set(directory, sources);
  }
};

export const collectAssetReferences = async ({
  projectRoot,
  tenantId,
}: CollectAssetReferencesOptions): Promise<AssetReferenceCollection> => {
  const resolvedProjectRoot = path.resolve(projectRoot);
  const files = await glob(TEXT_FILE_PATTERNS, {
    cwd: resolvedProjectRoot,
    absolute: true,
    onlyFiles: true,
    ignore: EXCLUDED_DIRECTORIES,
  });
  const collection: AssetReferenceCollection = {
    staticPaths: new Set<string>(),
    dynamicDirectories: new Map<string, string[]>(),
    allowlistPatterns: DYNAMIC_ASSET_ALLOWLIST,
  };

  for (const sourceFile of files) {
    const contents = await readFile(sourceFile, "utf8");

    for (const match of contents.matchAll(STATIC_ASSET_STRING)) {
      for (const resolvedPath of resolveReference(
        match[1],
        sourceFile,
        resolvedProjectRoot,
        tenantId
      )) {
        collection.staticPaths.add(path.resolve(resolvedPath));
      }
    }

    for (const match of contents.matchAll(TEMPLATE_STRING)) {
      addDynamicDirectories(collection, match[1], sourceFile, resolvedProjectRoot, tenantId);
    }

    for (const match of contents.matchAll(DYNAMIC_REQUIRE)) {
      addDynamicDirectories(collection, match[1], sourceFile, resolvedProjectRoot, tenantId);
    }
  }

  return collection;
};
