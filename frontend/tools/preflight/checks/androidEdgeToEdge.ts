import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

const APPLICATION_SOURCE_EXTENSIONS = new Set([".cjs", ".js", ".jsx", ".mjs", ".ts", ".tsx"]);

const findRegularFiles = async (root: string): Promise<string[]> => {
  try {
    const entries = await readdir(root, { withFileTypes: true });
    const nested = await Promise.all(
      entries.map(async (entry) => {
        const target = path.join(root, entry.name);
        if (entry.isDirectory()) {
          return findRegularFiles(target);
        }
        return entry.isFile() ? [target] : [];
      })
    );
    return nested.flat().sort();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }
};

const readOptionalFile = async (target: string) => {
  try {
    return await readFile(target, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }
    throw error;
  }
};

const getProperty = (contents: string, name: string) => {
  const properties = new Map<string, string>();
  for (const rawLine of contents.split(/\r?\n/u)) {
    const line = rawLine.trim();
    if (line.length === 0 || line.startsWith("#")) {
      continue;
    }
    const separator = line.indexOf("=");
    if (separator >= 0) {
      properties.set(line.slice(0, separator).trim(), line.slice(separator + 1).trim());
    }
  }
  return properties.get(name);
};

interface XmlItem {
  name: string;
  value: string;
}

const parseXmlItems = (contents: string): XmlItem[] => {
  const activeXml = contents.replace(/<!--[\s\S]*?-->/gu, "");
  const items: XmlItem[] = [];

  for (const match of activeXml.matchAll(/<item\b([^>]*)>([\s\S]*?)<\/item>/gu)) {
    const name = match[1].match(/\bname\s*=\s*(["'])(.*?)\1/u)?.[2];
    if (name) {
      items.push({ name, value: match[2].trim() });
    }
  }

  return items;
};

const getScriptKind = (target: string) => {
  switch (path.extname(target)) {
    case ".tsx":
      return ts.ScriptKind.TSX;
    case ".ts":
      return ts.ScriptKind.TS;
    case ".jsx":
      return ts.ScriptKind.JSX;
    default:
      return ts.ScriptKind.JS;
  }
};

const isStatusBarExpression = (node: ts.Expression) =>
  (ts.isIdentifier(node) && node.text === "StatusBar") ||
  (ts.isPropertyAccessExpression(node) && node.name.text === "StatusBar");

const usesManualStatusBarHeight = (target: string, contents: string) => {
  const sourceFile = ts.createSourceFile(
    target,
    contents,
    ts.ScriptTarget.Latest,
    true,
    getScriptKind(target)
  );
  let found = false;

  const visit = (node: ts.Node) => {
    if (
      ts.isPropertyAccessExpression(node) &&
      node.name.text === "currentHeight" &&
      isStatusBarExpression(node.expression)
    ) {
      found = true;
      return;
    }
    if (
      ts.isElementAccessExpression(node) &&
      ts.isStringLiteral(node.argumentExpression) &&
      node.argumentExpression.text === "currentHeight" &&
      isStatusBarExpression(node.expression)
    ) {
      found = true;
      return;
    }
    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return found;
};

const toProjectPath = (projectRoot: string, target: string) =>
  path.relative(projectRoot, target).split(path.sep).join("/");

const findApplicationSourceFiles = async (projectRoot: string) => {
  const nestedSourceFiles = await findRegularFiles(path.join(projectRoot, "src"));
  const rootEntries = await readdir(projectRoot, { withFileTypes: true });
  const rootSourceFiles = rootEntries
    .filter(
      (entry) => entry.isFile() && APPLICATION_SOURCE_EXTENSIONS.has(path.extname(entry.name))
    )
    .map((entry) => path.join(projectRoot, entry.name));

  return [...new Set([...nestedSourceFiles, ...rootSourceFiles])]
    .filter((target) => APPLICATION_SOURCE_EXTENSIONS.has(path.extname(target)))
    .sort();
};

export interface AndroidEdgeToEdgeAudit {
  drift: string[];
  evidence: string[];
}

export const auditAndroidEdgeToEdge = async (
  projectRoot: string,
  generatedAndroidExists: boolean
): Promise<AndroidEdgeToEdgeAudit> => {
  const drift: string[] = [];
  const evidence: string[] = [];

  if (generatedAndroidExists) {
    const properties = await readOptionalFile(
      path.join(projectRoot, "android", "gradle.properties")
    );
    const edgeToEdgeProperty = properties
      ? getProperty(properties, "expo.edgeToEdgeEnabled")
      : undefined;
    if (edgeToEdgeProperty !== "true") {
      drift.push(
        `Generated Android property: expected expo.edgeToEdgeEnabled=true, generated ${edgeToEdgeProperty ?? "missing"}`
      );
    }

    const resourcesRoot = path.join(projectRoot, "android", "app", "src", "main", "res");
    const resourceFiles = (await findRegularFiles(resourcesRoot)).filter((target) => {
      const [resourceDirectory] = path.relative(resourcesRoot, target).split(path.sep);
      return resourceDirectory.startsWith("values") && path.extname(target) === ".xml";
    });
    const resourceItems = (
      await Promise.all(
        resourceFiles.map(async (target) => parseXmlItems(await readFile(target, "utf8")))
      )
    ).flat();

    if (
      resourceItems.some(
        ({ name }) =>
          name === "windowOptOutEdgeToEdgeEnforcement" ||
          name === "android:windowOptOutEdgeToEdgeEnforcement"
      )
    ) {
      drift.push("Generated Android styles must not declare windowOptOutEdgeToEdgeEnforcement");
    }

    const fixedStatusBarColor = resourceItems.some(({ name, value }) => {
      if (name !== "statusBarColor" && name !== "android:statusBarColor") {
        return false;
      }
      const normalizedValue = value.toLowerCase();
      return normalizedValue !== "#00000000" && normalizedValue !== "@android:color/transparent";
    });
    if (fixedStatusBarColor) {
      drift.push("Generated Android styles must not declare a fixed statusBarColor");
    }

    evidence.push(
      `Android edge-to-edge native property: ${edgeToEdgeProperty ?? "missing"}; resource files audited: ${resourceFiles.length}`
    );
  }

  const sourceFiles = await findApplicationSourceFiles(projectRoot);
  for (const sourceFile of sourceFiles) {
    const contents = await readFile(sourceFile, "utf8");
    if (usesManualStatusBarHeight(sourceFile, contents)) {
      drift.push(
        `Application source must not use StatusBar.currentHeight: ${toProjectPath(projectRoot, sourceFile)}`
      );
    }
  }
  evidence.push(
    `Application source files audited for manual status-bar height: ${sourceFiles.length}`
  );

  return { drift, evidence };
};
