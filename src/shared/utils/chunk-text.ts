export function chunkText(
  content: string,
  targetChars = 1800,
): { pageContent: string; metadata: Record<string, unknown> }[] {
  const paragraphs = content.split(/\n\n+/);
  const chunks: string[] = [];
  let current = '';

  for (const para of paragraphs) {
    if (!para.trim()) continue;
    const candidate = current ? `${current}\n\n${para}` : para;
    if (candidate.length > targetChars && current) {
      chunks.push(current);
      current = para;
    } else {
      current = candidate;
    }
  }
  if (current) chunks.push(current);

  return chunks.map((c, idx) => ({
    pageContent: c,
    metadata: { chunk_index: idx },
  }));
}
