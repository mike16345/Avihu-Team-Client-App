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
  "native-modules/**/*.{js,jsx,ts,tsx,json,java,kt,kts,xml,gradle,properties,m,mm,swift,h,plist,pbxproj}",
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
const STATIC_TEMPLATE_ASSET_STRING = /`([^`$\n]+\.(?:png|jpe?g|svg|webp|gif|ttf|otf))`/gi;
const XML_ASSET_STRING = /<string>\s*([^<\s]+\.(?:png|jpe?g|svg|webp|gif|ttf|otf))\s*<\/string>/gi;
const TEMPLATE_STRING = /`([^`]*\$\{[^}]+\}[^`]*)`/g;
const STATIC_LOADER_LITERAL = /^\s*(?:"([^"]+)"|'([^']+)'|`([^`$]+)`)\s*$/;
const CONCATENATED_PREFIX = /^\s*(?:"([^"]*)"|'([^']*)'|`([^`$]*)`)\s*\+/;
const DIRECTORY_ASSET_DECLARATION = /\bassets\s*:\s*\[([\s\S]*?)\]/g;
const DIRECTORY_STRING = /"([^"]+)"|'([^']+)'|`([^`$]+)`/g;

interface LoaderCall {
  expression?: string;
}

interface BalancedExpression {
  expression: string;
  nextIndex: number;
}

export interface AssetReferenceCollection {
  staticPaths: Set<string>;
  staticDirectories: Set<string>;
  dynamicDirectories: Map<string, string[]>;
  opaqueLoaderSources: string[];
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
  const templateIndex = expression.indexOf("${");
  const templatePrefix = templateIndex >= 0 ? expression.slice(0, templateIndex) : undefined;
  const concatenatedPrefix = expression.match(CONCATENATED_PREFIX)?.slice(1).find(Boolean);
  const prefix = templatePrefix ?? concatenatedPrefix;
  if (!prefix) return undefined;

  const lastSlash = prefix.lastIndexOf("/");
  return lastSlash >= 0 ? prefix.slice(0, lastSlash + 1) : undefined;
};

const isIdentifierCharacter = (character: string | undefined) =>
  character !== undefined && /[A-Za-z0-9_$]/.test(character);

const skipTrivia = (contents: string, startIndex: number) => {
  let index = startIndex;
  while (index < contents.length) {
    if (/\s/.test(contents[index])) {
      index += 1;
      continue;
    }
    if (contents.startsWith("/*", index)) {
      const closingComment = contents.indexOf("*/", index + 2);
      if (closingComment === -1) return undefined;
      index = closingComment + 2;
      continue;
    }
    if (contents.startsWith("//", index)) {
      const lineEnd = contents.indexOf("\n", index + 2);
      index = lineEnd === -1 ? contents.length : lineEnd + 1;
      continue;
    }
    break;
  }
  return index;
};

const readBalancedExpression = (
  contents: string,
  openingParenthesis: number
): BalancedExpression | undefined => {
  let depth = 1;
  let quote: '"' | "'" | "`" | undefined;
  let escaped = false;

  for (let index = openingParenthesis + 1; index < contents.length; index += 1) {
    const character = contents[index];
    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === quote) {
        quote = undefined;
      }
      continue;
    }
    if (character === '"' || character === "'" || character === "`") {
      quote = character;
      continue;
    }
    if (contents.startsWith("/*", index)) {
      const closingComment = contents.indexOf("*/", index + 2);
      if (closingComment === -1) return undefined;
      index = closingComment + 1;
      continue;
    }
    if (contents.startsWith("//", index)) {
      const lineEnd = contents.indexOf("\n", index + 2);
      if (lineEnd === -1) return undefined;
      index = lineEnd;
      continue;
    }
    if (character === "(") {
      depth += 1;
    } else if (character === ")") {
      depth -= 1;
      if (depth === 0) {
        return {
          expression: contents.slice(openingParenthesis + 1, index),
          nextIndex: index + 1,
        };
      }
    }
  }

  return undefined;
};

const findLoaderCalls = (contents: string): LoaderCall[] => {
  const calls: LoaderCall[] = [];

  for (let index = 0; index < contents.length; index += 1) {
    const character = contents[index];
    if (character === '"' || character === "'" || character === "`") {
      let escaped = false;
      let closed = false;
      for (index += 1; index < contents.length; index += 1) {
        if (escaped) {
          escaped = false;
        } else if (contents[index] === "\\") {
          escaped = true;
        } else if (contents[index] === character) {
          closed = true;
          break;
        }
      }
      if (!closed) return [...calls, {}];
      continue;
    }
    if (contents.startsWith("/*", index)) {
      const closingComment = contents.indexOf("*/", index + 2);
      if (closingComment === -1) return [...calls, {}];
      index = closingComment + 1;
      continue;
    }
    if (contents.startsWith("//", index)) {
      const lineEnd = contents.indexOf("\n", index + 2);
      index = lineEnd === -1 ? contents.length : lineEnd;
      continue;
    }
    if (!isIdentifierCharacter(character)) continue;

    const identifierStart = index;
    while (isIdentifierCharacter(contents[index])) index += 1;
    const identifier = contents.slice(identifierStart, index);
    const previousCharacter = contents[identifierStart - 1];
    if (
      (identifier !== "require" && identifier !== "import") ||
      previousCharacter === "." ||
      isIdentifierCharacter(previousCharacter)
    ) {
      index -= 1;
      continue;
    }

    const openingParenthesis = skipTrivia(contents, index);
    if (openingParenthesis === undefined) return [...calls, {}];
    if (contents[openingParenthesis] !== "(") {
      index -= 1;
      continue;
    }

    const balancedExpression = readBalancedExpression(contents, openingParenthesis);
    if (!balancedExpression) return [...calls, {}];
    calls.push({ expression: balancedExpression.expression });
    index = balancedExpression.nextIndex - 1;
  }

  return calls;
};

const addStaticReferences = (
  collection: AssetReferenceCollection,
  value: string,
  sourceFile: string,
  projectRoot: string,
  tenantId: string
) => {
  for (const resolvedPath of resolveReference(value, sourceFile, projectRoot, tenantId)) {
    collection.staticPaths.add(path.resolve(resolvedPath));
  }
};

const addStaticDirectories = (
  collection: AssetReferenceCollection,
  value: string,
  sourceFile: string,
  projectRoot: string,
  tenantId: string
) => {
  for (const resolvedPath of resolveReference(value, sourceFile, projectRoot, tenantId)) {
    collection.staticDirectories.add(path.resolve(resolvedPath));
  }
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
    staticDirectories: new Set<string>(),
    dynamicDirectories: new Map<string, string[]>(),
    opaqueLoaderSources: [],
    allowlistPatterns: DYNAMIC_ASSET_ALLOWLIST,
  };

  for (const sourceFile of files) {
    const contents = await readFile(sourceFile, "utf8");
    const sourceName = path.basename(sourceFile);

    for (const match of contents.matchAll(STATIC_ASSET_STRING)) {
      addStaticReferences(collection, match[1], sourceFile, resolvedProjectRoot, tenantId);
    }

    for (const match of contents.matchAll(STATIC_TEMPLATE_ASSET_STRING)) {
      addStaticReferences(collection, match[1], sourceFile, resolvedProjectRoot, tenantId);
    }

    for (const match of contents.matchAll(XML_ASSET_STRING)) {
      addStaticReferences(collection, match[1], sourceFile, resolvedProjectRoot, tenantId);
    }

    for (const match of contents.matchAll(TEMPLATE_STRING)) {
      addDynamicDirectories(collection, match[1], sourceFile, resolvedProjectRoot, tenantId);
    }

    for (const { expression } of findLoaderCalls(contents)) {
      if (!expression) {
        collection.opaqueLoaderSources.push(toPosix(path.relative(projectRoot, sourceFile)));
        continue;
      }
      const staticLiteral = expression.match(STATIC_LOADER_LITERAL);
      if (staticLiteral) {
        const value = staticLiteral.slice(1).find(Boolean);
        if (value)
          addStaticReferences(collection, value, sourceFile, resolvedProjectRoot, tenantId);
        continue;
      }

      if (getDynamicPrefix(expression)) {
        addDynamicDirectories(collection, expression, sourceFile, resolvedProjectRoot, tenantId);
      } else {
        collection.opaqueLoaderSources.push(toPosix(path.relative(projectRoot, sourceFile)));
      }
    }

    if (sourceName === "react-native.config.js") {
      for (const declaration of contents.matchAll(DIRECTORY_ASSET_DECLARATION)) {
        for (const match of declaration[1].matchAll(DIRECTORY_STRING)) {
          const value = match.slice(1).find(Boolean);
          if (value)
            addStaticDirectories(collection, value, sourceFile, resolvedProjectRoot, tenantId);
        }
      }
    }
  }

  return collection;
};
