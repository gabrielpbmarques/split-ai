import { readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { join, relative } from 'path';

import ts from 'typescript';

interface CommentRange {
  readonly pos: number;
  readonly end: number;
  readonly text: string;
}

const ROOT = process.cwd();
const TARGET = join(ROOT, 'src');
const FIX = process.argv.includes('--fix');

const DIRECTIVE_RE = /^\/\/\/\s*<reference|^\/\/\s*eslint-|^\/\*\s*eslint-|^\/\/\s*@ts-|^\/\/\s*prettier-|^\/\*\s*prettier-/;

function listFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...listFiles(full));
    else if (full.endsWith('.ts') && !full.endsWith('.d.ts')) out.push(full);
  }
  return out;
}

function collectComments(file: string, text: string): CommentRange[] {
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const seen = new Map<number, CommentRange>();

  const add = (ranges: ts.CommentRange[] | undefined): void => {
    for (const range of ranges ?? []) {
      const comment = text.slice(range.pos, range.end);
      if (DIRECTIVE_RE.test(comment)) continue;
      seen.set(range.pos, { pos: range.pos, end: range.end, text: comment });
    }
  };

  const visit = (node: ts.Node): void => {
    add(ts.getLeadingCommentRanges(text, node.getFullStart()));
    add(ts.getTrailingCommentRanges(text, node.getEnd()));
    for (const child of node.getChildren(source)) visit(child);
  };

  visit(source);
  add(ts.getLeadingCommentRanges(text, source.endOfFileToken.getFullStart()));

  return [...seen.values()].sort((a, b) => a.pos - b.pos);
}

function strip(text: string, comments: readonly CommentRange[]): string {
  let out = '';
  let cursor = 0;
  for (const comment of comments) {
    out += text.slice(cursor, comment.pos);
    cursor = comment.end;
  }
  out += text.slice(cursor);

  return out
    .split('\n')
    .filter((line, index, lines) => {
      if (line.trim() !== '') return true;
      const original = text.split('\n');
      return index < original.length && original[index]?.trim() === ''
        ? true
        : lines[index - 1]?.trim() !== '' && lines[index + 1]?.trim() !== '';
    })
    .join('\n')
    .replace(/[ \t]+$/gm, '');
}

let total = 0;
const offenders: string[] = [];

for (const file of listFiles(TARGET)) {
  const text = readFileSync(file, 'utf8');
  const comments = collectComments(file, text);
  if (!comments.length) continue;

  total += comments.length;
  const rel = relative(ROOT, file);

  if (FIX) {
    writeFileSync(file, strip(text, comments));
    continue;
  }

  for (const comment of comments) {
    const line = text.slice(0, comment.pos).split('\n').length;
    offenders.push(`${rel}:${line}  ${comment.text.split('\n')[0].slice(0, 80)}`);
  }
}

if (FIX) {
  process.stdout.write(`no-comments: removed ${total} comment(s) under src/\n`);
} else if (total > 0) {
  process.stdout.write(`${offenders.join('\n')}\n`);
  process.stderr.write(
    `\nno-comments: ${total} comentário(s) em src/. O código não leva comentários (regra 02); mova a intenção para nomes, tipos ou it(...).\n`,
  );
  process.exit(1);
} else {
  process.stdout.write('no-comments: ok\n');
}
