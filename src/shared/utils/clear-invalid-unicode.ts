export function cleanInvalidUnicode(content: string): string {
  return content.replace(/\u0000/g, ' ');
}
