/**
 * Independent post-refactor check: simulates Nest's own resolution rules over
 * the CURRENT source and reports any dependency a module can no longer see.
 *
 *   bun run scripts/refactor-di/verify.ts
 *
 * For every module it computes the visible symbol set — local providers, plus
 * everything its imported modules export, expanded transitively through module
 * re-exports — and checks each provider/controller/enhancer constructor
 * dependency against it. Exits non-zero when something is unreachable.
 */
import {
  GLOBAL_SYMBOLS,
  ModuleInfo,
  REPOSITORY_TOKEN_PREFIX,
  buildGraph,
  relative,
} from './di-graph';

const EXTERNALLY_PROVIDED = new Set([
  'ConfigService', // ConfigModule
  'JwtService', // registered per-module where used
  'ThrottlerGuard', // ThrottlerModule is global
]);

const graph = buildGraph();

/** Symbols a module exposes to whoever imports it, following re-exports. */
const exposedCache = new Map<string, Set<string>>();
function exposedBy(name: string, seen = new Set<string>()): Set<string> {
  if (exposedCache.has(name)) return exposedCache.get(name)!;
  if (seen.has(name)) return new Set();
  seen.add(name);

  const mod = graph.modules.get(name);
  const out = new Set<string>();
  if (!mod) return out;

  for (const exp of mod.exports) {
    if (!exp.name) continue;
    if (graph.modules.has(exp.name)) {
      for (const sym of exposedBy(exp.name, seen)) out.add(sym);
    } else {
      out.add(exp.name);
    }
  }
  exposedCache.set(name, out);
  return out;
}

/** Entities the module registers via `TypeOrmModule.forFeature([...])`. */
function forFeatureEntities(mod: ModuleInfo): Set<string> {
  const entities = new Set<string>();
  for (const imp of mod.imports) {
    const match = /TypeOrmModule\.forFeature\(\s*\[([^\]]*)\]/.exec(imp.text);
    if (!match) continue;
    for (const name of match[1].split(',')) {
      const trimmed = name.trim();
      if (trimmed) entities.add(trimmed);
    }
  }
  return entities;
}

function visibleTo(mod: ModuleInfo): Set<string> {
  const visible = new Set<string>();
  for (const p of [...mod.providers, ...mod.controllers]) {
    if (p.name) visible.add(p.name);
    if (p.provide) visible.add(p.provide);
    // `providers: [...SomeProvider]` — spread of a provider array
    const spread = /^\.\.\.(\w+)$/.exec(p.text);
    if (spread) {
      for (const exp of mod.exports) if (exp.name) visible.add(exp.name);
    }
  }
  for (const imp of mod.imports) {
    if (!imp.name) continue;
    for (const sym of exposedBy(imp.name)) visible.add(sym);
  }
  return visible;
}

/**
 * Inline `{ provide, useFactory, inject: [...] }` providers are opaque here —
 * their `inject:` tokens are not constructor parameters, so nothing above
 * checks them. Surface them so a green run is not mistaken for full coverage.
 */
const unchecked: { module: string; text: string }[] = [];

interface Problem {
  module: string;
  file: string;
  consumer: string;
  symbol: string;
}

const problems: Problem[] = [];
let checkedModules = 0;
let checkedDeps = 0;

for (const mod of graph.modules.values()) {
  if (mod.providers.length === 0 && mod.controllers.length === 0) continue;
  checkedModules++;
  const visible = visibleTo(mod);
  const entities = forFeatureEntities(mod);

  for (const p of mod.providers) {
    if (p.dynamic && /\binject\s*:/.test(p.text)) {
      unchecked.push({ module: mod.name, text: p.text.replace(/\s+/g, ' ').slice(0, 90) });
    }
  }

  const queue = [...mod.providers, ...mod.controllers]
    .map((e) => e.name)
    .filter((n): n is string => Boolean(n));
  const seen = new Set<string>();

  while (queue.length) {
    const consumer = queue.shift()!;
    if (seen.has(consumer)) continue;
    seen.add(consumer);
    const info = graph.classes.get(consumer);
    if (!info) continue;
    for (const enhancer of info.enhancers) {
      if (graph.classes.has(enhancer)) queue.push(enhancer);
    }
    for (const dep of info.deps) {
      checkedDeps++;
      if (dep.symbol.startsWith(REPOSITORY_TOKEN_PREFIX)) {
        // `@InjectRepository(X)` needs `TypeOrmModule.forFeature([X])` here —
        // the token is module-local, an imported module cannot supply it.
        if (!entities.has(dep.entity!)) {
          problems.push({
            module: mod.name,
            file: mod.file,
            consumer,
            symbol: `forFeature([${dep.entity}])`,
          });
        }
        continue;
      }
      if (visible.has(dep.symbol)) continue;
      if (GLOBAL_SYMBOLS.has(dep.symbol)) continue;
      if (EXTERNALLY_PROVIDED.has(dep.symbol)) continue;
      if (dep.optional) continue;
      problems.push({
        module: mod.name,
        file: mod.file,
        consumer,
        symbol: dep.symbol,
      });
    }
  }
}

/* Modules that are declared but never reached from AppModule would never be
 * instantiated by Nest — their controllers would silently 404. */
const reachable = new Set<string>();
(function reach(name: string) {
  if (reachable.has(name)) return;
  reachable.add(name);
  const mod = graph.modules.get(name);
  if (!mod) return;
  for (const imp of mod.imports) if (imp.name) reach(imp.name);
})('AppModule');

const orphaned = [...graph.modules.values()].filter(
  (m) => !reachable.has(m.name) && m.controllers.length > 0,
);

console.log('');
console.log('DI verify');
console.log('─'.repeat(72));
console.log(`modules checked       : ${checkedModules}`);
console.log(`dependencies checked  : ${checkedDeps}`);
console.log(`unreachable deps      : ${problems.length}`);
console.log(`orphaned controllers  : ${orphaned.length}`);
console.log(`duplicate class names : ${graph.duplicates.length}`);
console.log(`unchecked inline deps : ${unchecked.length}`);
console.log('');

for (const u of unchecked) {
  console.log(`  ! ${u.module}: inline provider with inject: — verify by hand`);
  console.log(`      ${u.text}`);
}

for (const dup of graph.duplicates) {
  console.log(
    `  ✗ class ${dup.name} is declared in ${dup.files.length} files — the graph ` +
      `is keyed by class name, so this resolves ambiguously:`,
  );
  for (const file of dup.files) console.log(`      ${relative(file)}`);
}

for (const p of problems) {
  console.log(`  ✗ ${p.module} :: ${p.consumer} -> ${p.symbol}  (${relative(p.file)})`);
}
for (const m of orphaned) {
  console.log(`  ✗ ${m.name} has controllers but is not reachable from AppModule`);
}

if (problems.length || orphaned.length || graph.duplicates.length) {
  process.exit(1);
}
console.log('  ok — every injection is reachable from its module');
console.log('');
