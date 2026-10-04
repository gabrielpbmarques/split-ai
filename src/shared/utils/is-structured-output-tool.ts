export function isStructuredOutputTool(name?: string): boolean {
  return !!name && /^extract(-\d+)?$/.test(name);
}
