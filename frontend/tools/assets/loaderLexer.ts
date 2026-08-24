const JAVASCRIPT_SOURCE_FILE = /\.(?:[cm]?[jt]s|[jt]sx)$/i;
const JSX_SOURCE_FILE = /\.[jt]sx$/i;
const CLOSING_DELIMITER_BY_OPENING: Record<string, string> = {
  "(": ")",
  "[": "]",
  "{": "}",
};
const CLOSING_DELIMITERS = new Set(Object.values(CLOSING_DELIMITER_BY_OPENING));
const REGEX_PREFIX_CHARACTERS = new Set([
  "=",
  "+",
  "-",
  "*",
  "%",
  "&",
  "|",
  "^",
  "~",
  "?",
  ":",
  ",",
  ";",
]);
const REGEX_PREFIX_KEYWORDS = new Set([
  "await",
  "case",
  "delete",
  "do",
  "else",
  "in",
  "instanceof",
  "new",
  "of",
  "return",
  "throw",
  "typeof",
  "void",
  "yield",
]);
type SlashMode = "regex" | "division" | "ambiguous";

export interface LoaderCall {
  expression?: string;
}

interface LoaderScanState {
  calls: LoaderCall[];
  scanJsxSyntax: boolean;
  scanRegexLiterals: boolean;
}

const isIdentifierCharacter = (character: string | undefined) =>
  character !== undefined && /[A-Za-z0-9_$]/.test(character);

const isJsxNameCharacter = (character: string | undefined) =>
  character !== undefined && /[A-Za-z0-9_$:.-]/.test(character);

const isJsxElementStart = (contents: string, openingAngle: number) => {
  const nextCharacter = contents[openingAngle + 1];
  if (nextCharacter === ">") return true;
  if (!/[A-Za-z_$]/.test(nextCharacter ?? "")) return false;

  let index = openingAngle + 2;
  while (isJsxNameCharacter(contents[index])) index += 1;
  if (contents[index] === ",") return false;
  if (!/\s/.test(contents[index] ?? "")) {
    return contents[index] === ">" || contents[index] === "/";
  }

  while (/\s/.test(contents[index] ?? "")) index += 1;
  if (contents[index] === "=") return false;
  return !contents.startsWith("extends", index) || isIdentifierCharacter(contents[index + 7]);
};

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

const readQuotedString = (contents: string, openingQuote: number): number | undefined => {
  const quote = contents[openingQuote];
  let escaped = false;

  for (let index = openingQuote + 1; index < contents.length; index += 1) {
    const character = contents[index];
    if (escaped) escaped = false;
    else if (character === "\\") escaped = true;
    else if (character === quote) return index + 1;
  }

  return undefined;
};

const readRegularExpression = (contents: string, openingSlash: number): number | undefined => {
  let escaped = false;
  let inCharacterClass = false;

  for (let index = openingSlash + 1; index < contents.length; index += 1) {
    const character = contents[index];
    if (character === "\n" || character === "\r") return undefined;
    if (escaped) {
      escaped = false;
    } else if (character === "\\") {
      escaped = true;
    } else if (character === "[") {
      inCharacterClass = true;
    } else if (character === "]") {
      inCharacterClass = false;
    } else if (character === "/" && !inCharacterClass) {
      let nextIndex = index + 1;
      while (/[A-Za-z]/.test(contents[nextIndex] ?? "")) nextIndex += 1;
      return nextIndex;
    }
  }

  return undefined;
};

function readTemplateLiteral(
  contents: string,
  openingBacktick: number,
  state: LoaderScanState
): number | undefined {
  for (let index = openingBacktick + 1; index < contents.length; index += 1) {
    if (contents[index] === "\\") {
      index += 1;
      continue;
    }
    if (contents[index] === "`") return index + 1;
    if (!contents.startsWith("${", index)) continue;

    const interpolationEnd = scanExecutableCode(contents, index + 2, state, ["}"]);
    if (interpolationEnd === undefined) return undefined;
    index = interpolationEnd - 1;
  }

  return undefined;
}

function readJsxElement(
  contents: string,
  openingAngle: number,
  state: LoaderScanState
): number | undefined {
  let index = openingAngle + 1;
  let tagName: string | undefined;

  if (contents[index] === ">") {
    index += 1;
  } else {
    const nameStart = index;
    while (isJsxNameCharacter(contents[index])) index += 1;
    if (index === nameStart) return undefined;
    tagName = contents.slice(nameStart, index);

    let openingTagClosed = false;
    while (index < contents.length) {
      const character = contents[index];
      if (character === '"' || character === "'") {
        const stringEnd = readQuotedString(contents, index);
        if (stringEnd === undefined) return undefined;
        index = stringEnd;
        continue;
      }
      if (character === "{") {
        const expressionEnd = scanExecutableCode(contents, index + 1, state, ["}"]);
        if (expressionEnd === undefined) return undefined;
        index = expressionEnd;
        continue;
      }
      if (contents.startsWith("/>", index)) return index + 2;
      if (character === ">") {
        index += 1;
        openingTagClosed = true;
        break;
      }
      if (character === "<") return undefined;
      index += 1;
    }
    if (!openingTagClosed) return undefined;
  }

  while (index < contents.length) {
    if (contents.startsWith("</", index)) {
      let closingIndex = index + 2;
      if (tagName !== undefined) {
        const nameStart = closingIndex;
        while (isJsxNameCharacter(contents[closingIndex])) closingIndex += 1;
        if (contents.slice(nameStart, closingIndex) !== tagName) return undefined;
      }
      while (/\s/.test(contents[closingIndex] ?? "")) closingIndex += 1;
      return contents[closingIndex] === ">" ? closingIndex + 1 : undefined;
    }
    if (contents[index] === "<") {
      if (!isJsxElementStart(contents, index)) return undefined;
      const childEnd = readJsxElement(contents, index, state);
      if (childEnd === undefined) return undefined;
      index = childEnd;
      continue;
    }
    if (contents[index] === "{") {
      const expressionEnd = scanExecutableCode(contents, index + 1, state, ["}"]);
      if (expressionEnd === undefined) return undefined;
      index = expressionEnd;
      continue;
    }
    index += 1;
  }

  return undefined;
}

function scanExecutableCode(
  contents: string,
  startIndex: number,
  state: LoaderScanState,
  expectedClosings?: string[]
): number | undefined {
  const closingStack = expectedClosings ? [...expectedClosings] : undefined;
  let index = startIndex;
  let slashMode: SlashMode = "regex";

  while (index < contents.length) {
    const character = contents[index];
    if (character === '"' || character === "'") {
      const stringEnd = readQuotedString(contents, index);
      if (stringEnd === undefined) return undefined;
      index = stringEnd;
      slashMode = "division";
      continue;
    }
    if (character === "`") {
      const templateEnd = readTemplateLiteral(contents, index, state);
      if (templateEnd === undefined) return undefined;
      index = templateEnd;
      slashMode = "division";
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
    if (
      character === "<" &&
      state.scanJsxSyntax &&
      slashMode === "regex" &&
      isJsxElementStart(contents, index)
    ) {
      const jsxEnd = readJsxElement(contents, index, state);
      if (jsxEnd === undefined) return undefined;
      index = jsxEnd;
      slashMode = "division";
      continue;
    }
    if (character === "/" && state.scanRegexLiterals) {
      if (slashMode === "ambiguous") return undefined;
      if (slashMode === "regex") {
        const regexEnd = readRegularExpression(contents, index);
        if (regexEnd === undefined) return undefined;
        index = regexEnd;
        slashMode = "division";
      } else {
        index += contents[index + 1] === "=" ? 2 : 1;
        slashMode = "regex";
      }
      continue;
    }

    if (isIdentifierCharacter(character)) {
      const identifierStart = index;
      while (isIdentifierCharacter(contents[index])) index += 1;
      const identifier = contents.slice(identifierStart, index);
      const previousCharacter = contents[identifierStart - 1];
      if (
        (identifier !== "require" && identifier !== "import") ||
        previousCharacter === "." ||
        isIdentifierCharacter(previousCharacter)
      ) {
        slashMode = REGEX_PREFIX_KEYWORDS.has(identifier) ? "regex" : "division";
        continue;
      }

      const openingParenthesis = skipTrivia(contents, index);
      if (openingParenthesis === undefined) return undefined;
      if (contents[openingParenthesis] !== "(") {
        slashMode = "division";
        continue;
      }

      const callEnd = scanExecutableCode(contents, openingParenthesis + 1, state, [")"]);
      if (callEnd === undefined) return undefined;
      state.calls.push({
        expression: contents.slice(openingParenthesis + 1, callEnd - 1),
      });
      index = callEnd;
      slashMode = "division";
      continue;
    }

    const nestedClosing = CLOSING_DELIMITER_BY_OPENING[character];
    if (nestedClosing) {
      closingStack?.push(nestedClosing);
      index += 1;
      slashMode = "regex";
      continue;
    }
    if (CLOSING_DELIMITERS.has(character)) {
      if (closingStack) {
        if (closingStack.at(-1) !== character) return undefined;
        closingStack.pop();
        index += 1;
        if (closingStack.length === 0) return index;
      } else {
        index += 1;
      }
      slashMode = "division";
      continue;
    }
    if (/\s/.test(character)) {
      index += 1;
      continue;
    }
    if ((character === "+" || character === "-") && contents[index + 1] === character) {
      index += 2;
      continue;
    }

    if (contents.startsWith("=>", index)) {
      index += 2;
      slashMode = "regex";
      continue;
    }
    if (contents.startsWith("...", index)) {
      index += 3;
      slashMode = "regex";
      continue;
    }
    // Prefix logical-not and postfix non-null assertion both preserve the preceding slash mode.
    if (character === "!") {
      index += 1;
      continue;
    }
    if (REGEX_PREFIX_CHARACTERS.has(character)) {
      slashMode = "regex";
      index += 1;
      continue;
    }
    if (character === ".") {
      slashMode = "division";
      index += 1;
      continue;
    }

    // An unclassified token may be operand-like, so a following slash must fail closed.
    slashMode = "ambiguous";
    index += 1;
  }

  return closingStack ? undefined : index;
}

export const findLoaderCalls = (contents: string, sourceFile: string): LoaderCall[] => {
  const state: LoaderScanState = {
    calls: [],
    scanJsxSyntax: JSX_SOURCE_FILE.test(sourceFile),
    scanRegexLiterals: JAVASCRIPT_SOURCE_FILE.test(sourceFile),
  };
  if (scanExecutableCode(contents, 0, state) === undefined) {
    return [...state.calls, {}];
  }

  return state.calls;
};
