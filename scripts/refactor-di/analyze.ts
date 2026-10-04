/**
 * Dry-run reporter for the DI refactor.
 *
 *   bun run scripts/refactor-di/analyze.ts            # summary to stdout
 *   bun run scripts/refactor-di/analyze.ts --md <out> # + markdown report
 */
import * as fs from 'fs';
import * as path from 'path';

import { buildGraph, relative } from './di-graph';
import { buildPlan, ModulePlan } from './plan';

const args = process.argv.slice(2);
const mdIndex = args.indexOf('--md');
const mdOut = mdIndex >= 0 ? args[mdIndex + 1] : undefined;

const graph = buildGraph();
const plan = buildPlan(graph);

const byScope = new Map<string, ModulePlan[]>();
for (const p of plan.modules) {
  if (!byScope.has(p.scope)) byScope.set(p.scope, []);
  byScope.get(p.scope)!.push(p);
}

const changed = plan.modules.filter((p) => p.changed);
const unresolved = plan.modules.filter((p) => p.unresolved.length > 0);

/**
 * A module that re-exports a symbol it does not provide relies on a transitive
 * export chain. Ownership would then point at the wrong module, so flag it.
 */
const reExports: { module: string; symbol: string }[] = [];
for (const mod of graph.modules.values()) {
  const provided = new Set<string>();
  for (const p of mod.providers) {
    if (p.name) provided.add(p.name);
    if (p.provide) provided.add(p.provide);
    if (p.text.startsWith('...')) provided.add('*');
  }
  if (provided.has('*')) continue;
  for (const exp of mod.exports) {
    if (!exp.name) continue;
    if (graph.modules.has(exp.name)) continue;
    if (!provided.has(exp.name)) {
      reExports.push({ module: mod.name, symbol: exp.name });
    }
  }
}

console.log('');
console.log('DI refactor — analysis');
console.log('─'.repeat(72));
console.log(`modules parsed        : ${graph.modules.size}`);
console.log(`classes parsed        : ${graph.classes.size}`);
console.log(`modules to generate   : ${plan.generated.length}`);
console.log(`modules to rewrite    : ${changed.length}`);
console.log(
  `modules to retire     : ${plan.retired.map((r) => r.module).join(', ')}`,
);
console.log(`symbol collisions     : ${plan.collisions.length}`);
console.log(`unresolved injections : ${unresolved.length} module(s)`);
console.log(`re-exported symbols   : ${reExports.length}`);
console.log(`duplicate class names : ${graph.duplicates.length}`);
console.log('');

for (const dup of graph.duplicates) {
  console.log(`DUPLICATE CLASS ${dup.name}: ${dup.files.join(' | ')}`);
}

if (reExports.length) {
  console.log('RE-EXPORTS (module exports a symbol it does not provide)');
  for (const r of reExports) console.log(`  ${r.module} -> ${r.symbol}`);
  console.log('');
}

if (plan.collisions.length) {
  console.log('COLLISIONS (symbol exported by more than one module)');
  for (const c of plan.collisions) {
    console.log(`  ${c.symbol}: ${c.modules.join(' | ')}`);
  }
  console.log('');
}

if (unresolved.length) {
  console.log('UNRESOLVED INJECTIONS (no module exports these)');
  for (const p of unresolved) {
    for (const u of p.unresolved) {
      console.log(`  ${p.module} :: ${u.consumer} -> ${u.symbol}`);
    }
  }
  console.log('');
}

for (const [scope, plans] of [...byScope.entries()].sort()) {
  const scopeChanged = plans.filter((p) => p.changed);
  if (!scopeChanged.length) continue;
  console.log(`▸ ${scope}`);
  for (const p of scopeChanged) {
    const bits: string[] = [];
    if (p.removed.length) bits.push(`- ${p.removed.join(', ')}`);
    if (p.added.length) bits.push(`+ ${p.added.join(', ')}`);
    if (p.dropExports) bits.push('drop exports');
    console.log(`   ${p.module.padEnd(38)} ${bits.join('  |  ')}`);
  }
  console.log('');
}

if (mdOut) {
  const lines: string[] = [];
  lines.push('# Refatoração de injeção de dependências — mapa completo');
  lines.push('');
  lines.push(
    'Gerado por `scripts/refactor-di/analyze.ts`. Documento temporário — apagar após a conclusão.',
  );
  lines.push('');
  lines.push('## Resumo');
  lines.push('');
  lines.push('| métrica | valor |');
  lines.push('| --- | --- |');
  lines.push(`| modules existentes | ${graph.modules.size} |`);
  lines.push(
    `| modules novos (repository) | ${plan.generated.filter((g) => g.kind === 'repository').length} |`,
  );
  lines.push(
    `| modules novos (provider) | ${plan.generated.filter((g) => g.kind === 'provider').length} |`,
  );
  lines.push(`| modules reescritos | ${changed.length} |`);
  lines.push(
    `| modules aposentados | ${plan.retired.map((r) => r.module).join(', ') || '—'} |`,
  );
  lines.push('');

  lines.push('## Modules gerados');
  lines.push('');
  lines.push('| module | arquivo | exporta |');
  lines.push('| --- | --- | --- |');
  for (const g of plan.generated) {
    lines.push(
      `| \`${g.name}\` | \`${relative(g.file)}\` | ${g.exportsSymbols.map((s) => `\`${s}\``).join(', ')} |`,
    );
  }
  lines.push('');

  lines.push('## Mudanças por componente');
  lines.push('');
  for (const [scope, plans] of [...byScope.entries()].sort()) {
    const scopeChanged = plans.filter((p) => p.changed);
    if (!scopeChanged.length) continue;
    lines.push(`### ${scope}`);
    lines.push('');
    for (const p of scopeChanged) {
      lines.push(`#### \`${p.module}\` — \`${relative(p.file)}\``);
      lines.push('');
      if (p.kind === 'aggregator') {
        lines.push('Aggregator (só wiring): remove o array `exports`.');
        lines.push('');
        continue;
      }
      lines.push('```diff');
      lines.push('  imports: [');
      const afterSet = new Set(p.after);
      for (const b of p.before) if (!afterSet.has(b)) lines.push(`-   ${b},`);
      for (const a of p.after) lines.push(`+   ${a},`);
      lines.push('  ]');
      lines.push('```');
      lines.push('');
    }
  }

  if (plan.collisions.length) {
    lines.push('## Colisões de símbolo');
    lines.push('');
    for (const c of plan.collisions) {
      lines.push(
        `- \`${c.symbol}\`: ${c.modules.map((m) => `\`${m}\``).join(', ')}`,
      );
    }
    lines.push('');
  }

  if (unresolved.length) {
    lines.push('## Injeções não resolvidas');
    lines.push('');
    for (const p of unresolved) {
      for (const u of p.unresolved) {
        lines.push(`- \`${p.module}\` :: \`${u.consumer}\` → \`${u.symbol}\``);
      }
    }
    lines.push('');
  }

  fs.mkdirSync(path.dirname(mdOut), { recursive: true });
  fs.writeFileSync(mdOut, lines.join('\n'), 'utf8');
  console.log(`markdown escrito em ${mdOut}`);
}
