import { chunkText } from './chunkText';

describe('chunkText', () => {
  it('returns a single indexed chunk for short content', () => {
    const chunks = chunkText('hello world');

    expect(chunks).toHaveLength(1);
    expect(chunks[0].pageContent).toBe('hello world');
    expect(chunks[0].metadata).toEqual({ chunk_index: 0 });
  });

  it('splits long content into paragraph-aligned chunks with ordered indexes', () => {
    const para = 'a'.repeat(1000);
    const chunks = chunkText([para, para, para].join('\n\n'), 1800);

    expect(chunks.length).toBeGreaterThan(1);
    chunks.forEach((chunk, idx) => {
      expect(chunk.metadata).toEqual({ chunk_index: idx });
    });
  });

  it('ignores empty paragraphs', () => {
    const chunks = chunkText('first\n\n\n\nsecond');

    expect(chunks).toHaveLength(1);
    expect(chunks[0].pageContent).toBe('first\n\nsecond');
  });
});
