export function isHtmlEmpty(html?: string | null): boolean {
  if (!html) return true;

  const strippedTags = html.replace(/<[^>]+>/g, "");
  const strippedSpaces = strippedTags.replace(/&nbsp;/g, "");
  const textOnly = strippedSpaces.replace(/\s+/g, "");

  return textOnly.length === 0;
}
