import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import fg from "fast-glob";
import {
  renderDetailLines,
  renderError,
  renderHeader,
  renderStatusLine,
  supportsDecoratedOutput,
} from "../cli-ui/render";

export interface ApplicationColorFinding {
  relativePath: string;
  line: number;
  literal: string;
}

const HEX_COLOR = /#[0-9A-Fa-f]{3,8}\b/gu;
const FUNCTION_COLOR = /\b(?:rgb|hsl)a?\([^)]*\)/gu;
const NAMED_COLOR =
  /(?:\b(?:color|backgroundColor|borderColor|borderTopColor|borderBottomColor|borderLeftColor|borderRightColor|shadowColor|textDecorationColor)\b\s*[:=]|\bcolor\s*=)\s*["'](white|black|red|green|blue|gray|grey|orange|yellow|purple|pink)["']/giu;

const getCommonRoot = (targets: string[]) => {
  const [first, ...rest] = targets.map((target) => path.resolve(target));
  let common = first;

  for (const target of rest) {
    while (target !== common && !target.startsWith(`${common}${path.sep}`)) {
      const parent = path.dirname(common);
      if (parent === common) break;
      common = parent;
    }
  }

  return common;
};

const resolveSourceFiles = async (targets: string[]) => {
  const files = await Promise.all(
    targets.map(async (target) => {
      const absoluteTarget = path.resolve(target);
      const metadata = await stat(absoluteTarget);
      if (metadata.isFile()) return [absoluteTarget];
      return fg("**/*.{ts,tsx}", {
        absolute: true,
        cwd: absoluteTarget,
        ignore: ["**/__tests__/**"],
      });
    })
  );

  return [...new Set(files.flat())].sort();
};

const lineNumberAt = (source: string, index: number) =>
  source.slice(0, index).split(/\r?\n/u).length;

const collectMatches = (source: string, pattern: RegExp, captureIndex = 0) =>
  [...source.matchAll(pattern)].map((match) => ({
    index: match.index,
    literal: match[captureIndex],
  }));

export const auditApplicationColors = async (
  targets: string[]
): Promise<ApplicationColorFinding[]> => {
  if (targets.length === 0) throw new Error("At least one color-audit path is required");

  const files = await resolveSourceFiles(targets);
  const commonRoot = path.dirname(getCommonRoot(targets));
  const findings = await Promise.all(
    files.map(async (file) => {
      const source = await readFile(file, "utf8");
      const matches = [
        ...collectMatches(source, HEX_COLOR),
        ...collectMatches(source, FUNCTION_COLOR),
        ...collectMatches(source, NAMED_COLOR, 1),
      ];

      return matches
        .filter(({ literal }) => literal !== "transparent" && !literal.includes("${"))
        .map(({ index, literal }) => ({
          relativePath: path.relative(commonRoot, file).split(path.sep).join("/"),
          line: lineNumberAt(source, index),
          literal,
        }));
    })
  );

  return findings.flat().sort((left, right) => {
    const pathOrder = left.relativePath.localeCompare(right.relativePath);
    return pathOrder !== 0
      ? pathOrder
      : left.line - right.line || left.literal.localeCompare(right.literal);
  });
};

export const renderColorAudit = (
  findings: readonly ApplicationColorFinding[],
  decorated = supportsDecoratedOutput()
) => {
  const lines = [renderHeader("Semantic theme audit", undefined, decorated)];
  if (findings.length === 0) {
    lines.push(renderStatusLine("pass", "Application colors use tenant theme tokens", decorated));
    lines.push("│", "└  No hardcoded application colors · ready");
    return lines.join("\n");
  }

  for (const finding of findings) {
    lines.push(
      renderStatusLine("fail", `${finding.relativePath}:${finding.line}`, decorated),
      renderDetailLines([finding.literal])
    );
  }
  lines.push("│", `└  ${findings.length} hardcoded color${findings.length === 1 ? "" : "s"} found`);
  return lines.join("\n");
};

const parsePaths = (argv: string[]) => {
  const paths: string[] = [];
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] !== "--paths" || !argv[index + 1]) {
      throw new Error("Usage: tsx tools/theme/colorAudit.ts --paths <path> [--paths <path>]");
    }
    paths.push(argv[index + 1]);
    index += 1;
  }
  return paths;
};

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  void auditApplicationColors(parsePaths(process.argv.slice(2)))
    .then((findings) => {
      console.log(renderColorAudit(findings));
      if (findings.length > 0) {
        process.exitCode = 1;
      }
    })
    .catch((error: unknown) => {
      console.error(renderError(error instanceof Error ? error.message : String(error)));
      process.exitCode = 1;
    });
}
