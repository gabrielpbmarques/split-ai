import { detectFileKind } from './detectFileKind';

describe('detectFileKind', () => {
  it('detects by mime type', () => {
    expect(detectFileKind('application/pdf')).toBe('pdf');
    expect(
      detectFileKind(
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ),
    ).toBe('docx');
    expect(detectFileKind('text/markdown')).toBe('text');
    expect(detectFileKind('application/json')).toBe('text');
  });

  it('falls back to the file extension', () => {
    expect(detectFileKind(undefined, 'a.pdf')).toBe('pdf');
    expect(detectFileKind(undefined, 'a.docx')).toBe('docx');
    expect(detectFileKind(undefined, 'notes.md')).toBe('text');
    expect(detectFileKind(undefined, 'data.csv')).toBe('text');
  });

  it('returns unknown when nothing matches', () => {
    expect(detectFileKind(undefined, undefined)).toBe('unknown');
    expect(detectFileKind('image/png', 'photo.png')).toBe('unknown');
  });
});
