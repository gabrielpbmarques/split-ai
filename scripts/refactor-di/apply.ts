/**
 * Applies the DI refactor computed by `plan.ts`.
 *
 *   bun run scripts/refactor-di/apply.ts --dry     # print what would change
 *   bun run scripts/refactor-di/apply.ts           # write the files
 *   bun run scripts/refactor-di/apply.ts --only AIChat,Source
 *
 * Work is ordered component by component; inside a component, one module at a
 * time, so the progress log reads like the refactor itself.
 */
import * as fs from 'fs';
import * as path from 'path';

import * as ts from 'typescript';

import { ModuleInfo, SRC, buildGraph, parse, relative } from './di-graph';
import { ImportSpec, ModulePlan, RETIRED_MODULES, buildPlan } from './plan';

const argv = process.argv.slice(2);
const DRY = argv.includes('--dry');
const onlyIdx = argv.indexOf('--only');
const ONLY =
  onlyIdx >= 0
    ? new Set(argv[onlyIdx + 1].split(',').map((s) => s.trim()))
    : null;

const EXTERNAL_SPECIFIER: Record<string, string> = {
  ConfigModule: '@nestjs/config',
  ScheduleModule: '@nestjs/schedule',
  ThrottlerModule: '@nestjs/throttler',
  TypeOrmModule: '@nestjs/typeorm',
  JwtModule: '@nestjs/jwt',
  HttpModule: '@nestjs/axios',
};

const c = {
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  cyan: (s: string) => `\x1b[36m${s}\x1b[0m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
};

let written = 0;
let created = 0;
let deleted = 0;

function write(file: string, source: string, label: string): void {
  if (DRY) {
    console.log(`      ${c.dim('would write')} ${relative(file)} ${label}`);
    return;
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, source, 'utf8');
}

/* ------------------------------------------------------------------ *
 * Import-block generation                                             *
 * ------------------------------------------------------------------ */

/** `src/...` for anything outside the file's own folder, `./x` inside it. */
function specifierFor(target: string, current: string): string {
  if (path.dirname(target) === path.dirname(current)) {
    return './' + path.basename(target).replace(/\.ts$/, '');
  }
  return (
    'src/' +
    path.relative(SRC, target).replace(/\.ts$/, '').split(path.sep).join('/')
  );
}

function groupOf(specifier: string): number {
  if (specifier.startsWith('./')) return 2;
  if (specifier.startsWith('../')) return 1;
  return 0;
}

function renderImportBlock(entries: Map<string, Set<string>>): string {
  const groups: string[][] = [[], [], []];
  const sorted = [...entries.entries()].sort(([a], [b]) =>
    a.toLowerCase() < b.toLowerCase()
      ? -1
      : a.toLowerCase() > b.toLowerCase()
        ? 1
        : 0,
  );
  for (const [specifier, names] of sorted) {
    const list = [...names].sort((a, b) => {
      // Keep the repo's habit of listing the type/class before helpers.
      const ua = /^[A-Z]/.test(a);
      const ub = /^[A-Z]/.test(b);
      if (ua !== ub) return ua ? -1 : 1;
      return a.localeCompare(b);
    });
    groups[groupOf(specifier)].push(
      `import { ${list.join(', ')} } from '${specifier}';`,
    );
  }
  return groups
    .filter((g) => g.length)
    .map((g) => g.join('\n'))
    .join('\n\n');
}

/** Every capitalised identifier the rebuilt decorator body references. */
function referencedIdentifiers(metaText: string): Set<string> {
  const found = new Set<string>();
  for (const match of metaText.matchAll(/\b[A-Z][A-Za-z0-9_]*\b/g)) {
    found.add(match[0]);
  }
  return found;
}

/* ------------------------------------------------------------------ *
 * Module rewriting                                                    *
 * ------------------------------------------------------------------ */

function renderEntry(spec: ImportSpec): string {
  if (spec.raw) return spec.raw;
  return spec.forwardRef ? `forwardRef(() => ${spec.name})` : spec.name;
}

function rewriteModule(
  mod: ModuleInfo,
  plan: ModulePlan,
  ownerFiles: Map<string, string>,
): string | null {
  const source = fs.readFileSync(mod.file, 'utf8');
  const sf = parse(mod.file);

  let meta: ts.ObjectLiteralExpression | undefined;
  for (const stmt of sf.statements) {
    if (!ts.isClassDeclaration(stmt)) continue;
    const decs = ts.getDecorators(stmt) ?? [];
    for (const dec of decs) {
      if (!ts.isCallExpression(dec.expression)) continue;
      if (dec.expression.expression.getText() !== 'Module') continue;
      const arg = dec.expression.arguments[0];
      if (arg && ts.isObjectLiteralExpression(arg)) meta = arg;
    }
  }
  if (!meta) return null;

  /*
   * The import block is regenerated from scratch, so anything else living in
   * the file's head would be lost. Refuse rather than silently drop it.
   */
  const imports = sf.statements.filter(ts.isImportDeclaration);
  if (imports.length) {
    const first = imports[0];
    const last = imports[imports.length - 1];
    if (source.slice(0, first.getStart(sf)).trim().length) {
      throw new Error(
        `${mod.name}: content above the first import would be lost — rewrite by hand (${relative(mod.file)})`,
      );
    }
    for (const stmt of sf.statements) {
      if (stmt.getEnd() > last.getEnd()) break;
      if (!ts.isImportDeclaration(stmt)) {
        throw new Error(
          `${mod.name}: a non-import statement sits between imports — rewrite by hand (${relative(mod.file)})`,
        );
      }
      const clause = stmt.importClause;
      const bindings = clause?.namedBindings;
      if (
        !clause ||
        clause.name ||
        (bindings && !ts.isNamedImports(bindings))
      ) {
        throw new Error(
          `${mod.name}: side-effect, default or namespace import '${(stmt.moduleSpecifier as ts.StringLiteral).text}' cannot be regenerated — rewrite by hand (${relative(mod.file)})`,
        );
      }
    }
  }

  /* ---- rebuild the decorator body ---- */
  const props: string[] = [];
  let sawImports = false;
  const importsText =
    plan.kind === 'aggregator'
      ? null
      : plan.imports.length
        ? `imports: [${plan.imports.map(renderEntry).join(', ')}]`
        : '';

  for (const prop of meta.properties) {
    const key = prop.name?.getText();
    if (key === 'imports' && importsText !== null) {
      sawImports = true;
      if (importsText) props.push(importsText);
      continue;
    }
    if (key === 'exports' && plan.dropExports) continue;
    props.push(prop.getText());
  }
  if (!sawImports && importsText) props.unshift(importsText);

  const newMeta = `{\n  ${props.join(',\n  ')},\n}`;

  /* ---- splice the new body in ---- */
  let out =
    source.slice(0, meta.getStart(sf)) + newMeta + source.slice(meta.getEnd());

  /* ---- rebuild the import block ---- */
  const needed = referencedIdentifiers(newMeta);
  needed.add('Module');
  const usesForwardRef = newMeta.includes('forwardRef(');

  const entries = new Map<string, Set<string>>();
  const add = (specifier: string, name: string) => {
    if (!entries.has(specifier)) entries.set(specifier, new Set());
    entries.get(specifier)!.add(name);
  };

  add('@nestjs/common', 'Module');
  if (usesForwardRef) add('@nestjs/common', 'forwardRef');

  for (const name of needed) {
    if (name === 'Module') continue;
    const original = mod.importedSpecifier.get(name);
    if (original) {
      add(original, name);
      continue;
    }
    const ownerFile = ownerFiles.get(name);
    if (ownerFile) {
      add(specifierFor(ownerFile, mod.file), name);
      continue;
    }
    if (EXTERNAL_SPECIFIER[name]) {
      add(EXTERNAL_SPECIFIER[name], name);
      continue;
    }
    throw new Error(
      `${mod.name}: cannot resolve an import for '${name}' (${relative(mod.file)})`,
    );
  }

  const importBlock = renderImportBlock(entries);

  // Everything from the first non-import statement onward is preserved as-is.
  const lastImport = [...sf.statements].filter(ts.isImportDeclaration).pop();
  const headEnd = lastImport ? lastImport.getEnd() : 0;
  out = importBlock + '\n\n' + out.slice(headEnd).replace(/^[\s\n]*/, '');

  return out.endsWith('\n') ? out : out + '\n';
}

/* ------------------------------------------------------------------ *
 * Main                                                                *
 * ------------------------------------------------------------------ */

const graph = buildGraph();
const plan = buildPlan(graph);

console.log('');
console.log(c.bold('DI refactor — apply') + (DRY ? c.dim('  (dry run)') : ''));
console.log('─'.repeat(72));

/* Refuse to touch the tree while the graph is ambiguous or incomplete. */
const blockers: string[] = [];
for (const dup of graph.duplicates) {
  blockers.push(
    `class ${dup.name} declared in ${dup.files.map(relative).join(' and ')} — the graph is keyed by class name`,
  );
}
for (const collision of plan.collisions) {
  blockers.push(
    `symbol ${collision.symbol} exported by ${collision.modules.join(' and ')}`,
  );
}
for (const p of plan.modules) {
  for (const u of p.unresolved) {
    blockers.push(
      `${p.module}: ${u.consumer} injects ${u.symbol}, no module exports it`,
    );
  }
}
if (blockers.length) {
  console.error(c.red('\nrefusing to apply — resolve these first:'));
  for (const blocker of blockers) console.error(`  ✗ ${blocker}`);
  console.error('');
  process.exit(1);
}

/* 1 ── generated repository + provider modules ---------------------- */
console.log(c.bold('\n[1/4] modules de repository e provider'));
if (ONLY) {
  console.log(
    `   ${c.dim('nota: esta etapa ignora --only — os modules gerados são pré-requisito de qualquer escopo')}`,
  );
}
for (const gen of plan.generated) {
  const exists = fs.existsSync(gen.file);
  console.log(
    `   ${exists ? c.dim('=') : c.green('+')} ${gen.name.padEnd(40)} ${c.dim(relative(gen.file))}`,
  );
  write(gen.file, gen.source, '');
  if (!exists) created++;
}

/* 2 ── use-case + aggregator modules, component by component -------- */
console.log(c.bold('\n[2/4] modules de use case'));
const byScope = new Map<string, ModulePlan[]>();
for (const p of plan.modules) {
  if (!p.changed) continue;
  if (ONLY && !ONLY.has(p.scope)) continue;
  if (!byScope.has(p.scope)) byScope.set(p.scope, []);
  byScope.get(p.scope)!.push(p);
}

const scopes = [...byScope.entries()].sort(([a], [b]) => a.localeCompare(b));
let scopeIndex = 0;
for (const [scope, plans] of scopes) {
  scopeIndex++;
  console.log(
    `\n   ${c.cyan(`▸ ${scope}`)} ${c.dim(`(${scopeIndex}/${scopes.length}) — ${plans.length} module(s)`)}`,
  );
  for (const p of plans.sort((a, b) => a.module.localeCompare(b.module))) {
    const mod = graph.modules.get(p.module)!;
    const next = rewriteModule(mod, p, plan.ownerFiles);
    if (next === null) {
      console.log(`      ${c.red('!')} ${p.module} — @Module não encontrado`);
      continue;
    }
    const detail: string[] = [];
    if (p.removed.length) detail.push(c.red(`-${p.removed.length}`));
    if (p.added.length) detail.push(c.green(`+${p.added.length}`));
    if (p.dropExports) detail.push(c.dim('exports'));
    console.log(
      `      ${c.green('✓')} ${p.module.padEnd(40)} ${detail.join(' ')}`,
    );
    write(mod.file, next, '');
    written++;
  }
}

/* 3 ── AppModule: drop the retired InfrastructureModule ------------- */
console.log(c.bold('\n[3/4] app.module.ts'));
if (ONLY) {
  console.log(
    `   ${c.dim('= pulado (--only): rode sem --only para finalizar a árvore')}`,
  );
}
const appFile = path.join(SRC, 'app.module.ts');
let appSource = ONLY ? '' : fs.readFileSync(appFile, 'utf8');
const beforeApp = appSource;
appSource = appSource
  .replace(
    /^import \{ InfrastructureModule \} from 'src\/infrastructure\/infrastructure\.module';\n/m,
    '',
  )
  .replace(/^\s*InfrastructureModule,\n/m, '');
if (!ONLY && appSource !== beforeApp) {
  console.log(`   ${c.green('✓')} InfrastructureModule removido do AppModule`);
  write(appFile, appSource, '');
  written++;
} else if (!ONLY) {
  console.log(`   ${c.dim('=')} nada a fazer`);
}

/* 4 ── retire the two catch-all modules ----------------------------- */
console.log(c.bold('\n[4/4] modules aposentados'));
if (ONLY) {
  console.log(`   ${c.dim('= pulado (--only)')}`);
}
for (const retired of ONLY ? [] : plan.retired) {
  if (!RETIRED_MODULES.has(retired.module)) continue;
  console.log(
    `   ${c.red('-')} ${retired.module.padEnd(40)} ${c.dim(relative(retired.file))}`,
  );
  if (!DRY) {
    fs.rmSync(retired.file, { force: true });
    deleted++;
  }
}

console.log('');
console.log('─'.repeat(72));
console.log(
  `${DRY ? 'seriam ' : ''}gerados: ${created}  reescritos: ${written}  removidos: ${deleted}`,
);
console.log(
  DRY
    ? c.dim(
        'rode sem --dry para aplicar, depois `bun run lint` e `bun run build`',
      )
    : c.dim('próximo: bun run lint && bun run build'),
);
console.log('');
