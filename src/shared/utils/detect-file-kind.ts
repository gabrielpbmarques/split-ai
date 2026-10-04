export type FileKind = 'pdf' | 'text' | 'docx' | 'unknown';

export function detectFileKind(mimeType?: string, fileName?: string): FileKind {
  const mt = (mimeType ?? '').toLowerCase();
  if (mt === 'application/pdf') return 'pdf';
  if (
    mt ===
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  )
    return 'docx';
  if (
    mt.startsWith('text/') ||
    mt === 'application/json' ||
    mt === 'application/x-yaml'
  )
    return 'text';

  const ext = (fileName ?? '').toLowerCase().split('.').pop();
  if (ext === 'pdf') return 'pdf';
  if (ext === 'docx') return 'docx';
  if (
    ext === 'md' ||
    ext === 'markdown' ||
    ext === 'txt' ||
    ext === 'json' ||
    ext === 'yaml' ||
    ext === 'yml' ||
    ext === 'csv'
  )
    return 'text';

  return 'unknown';
}
