/**
 * Emits the full dependency map of the CURRENT source as markdown.
 *
 *   bun run scripts/refactor-di/document.ts DI-REFACTOR.md
 *
 * For every module that owns providers or controllers it lists what each of its
 * classes injects and which module supplies it, so the wiring can be audited by
 * reading one table instead of 140 files.
 */
import * as fs from 'fs';
import * as path from 'path';

import {
  GLOBAL_SYMBOLS,
  REPOSITORY_TOKEN_PREFIX,
  buildGraph,
  relative,
} from './di-graph';

const out = process.argv[2] ?? 'DI-REFACTOR.md';
const graph = buildGraph();

const owners = new Map<string, string>();
for (const mod of graph.modules.values()) {
  for (const exp of mod.exports) {
    if (!exp.name || graph.modules.has(exp.name)) continue;
    owners.set(exp.name, mod.name);
  }
}

const scopes = new Map<
  string,
  typeof graph.modules extends Map<string, infer M> ? M[] : never
>();
for (const mod of graph.modules.values()) {
  const list = scopes.get(mod.scope) ?? [];
  list.push(mod as never);
  scopes.set(mod.scope, list as never);
}

const lines: string[] = [];
lines.push('# Mapa de injeção de dependências');
lines.push('');
lines.push(
  'Gerado por `bun run scripts/refactor-di/document.ts`. Documento de trabalho — apagar após a conclusão do refactor.',
);
lines.push('');

lines.push('## Padrão');
lines.push('');
lines.push(
  'Cada módulo de use case importa **apenas** os módulos que fornecem o que suas próprias classes (service, controller, guards) injetam. Não existem mais módulos guarda-chuva.',
);
lines.push('');
lines.push('| camada | módulo | fornece |');
lines.push('| --- | --- | --- |');
lines.push(
  '| repositório | `src/repositories/<x>.repository.module.ts` → `XRepositoryModule` | `TypeOrmModule.forFeature([XEntity])` + `XRepository` |',
);
lines.push(
  '| provider externo | `src/infrastructure/providers/<x>.provider.module.ts` → `XProviderModule` | os tokens declarados em `<x>.provider.ts` |',
);
lines.push(
  '| use case | `src/modules/<domain>/<use-case>/<x>.module.ts` | o service do use case |',
);
lines.push(
  '| agregador | `src/modules/<domain>/<domain>.module.ts` | nada — só importa os use cases para registrar rotas |',
);
lines.push('');

/* ---- generated layers ---- */
const repoModules = [...graph.modules.values()]
  .filter((m) => m.file.endsWith('.repository.module.ts'))
  .sort((a, b) => a.name.localeCompare(b.name));
const providerModules = [...graph.modules.values()]
  .filter((m) => m.file.endsWith('.provider.module.ts'))
  .sort((a, b) => a.name.localeCompare(b.name));

lines.push('## Módulos de repositório');
lines.push('');
lines.push('| módulo | entidade (`forFeature`) | exporta | imports extras |');
lines.push('| --- | --- | --- | --- |');
for (const mod of repoModules) {
  const feature = mod.imports.find((i) => i.text.includes('forFeature'));
  const entity = feature
    ? (/\[([^\]]*)\]/.exec(feature.text)?.[1] ?? '—')
    : '—';
  const extra = mod.imports
    .filter((i) => i.name)
    .map((i) => `\`${i.name}\``)
    .join(', ');
  lines.push(
    `| \`${mod.name}\` | \`${entity}\` | ${mod.exports.map((e) => `\`${e.name}\``).join(', ')} | ${extra || '—'} |`,
  );
}
lines.push('');

lines.push('## Módulos de provider');
lines.push('');
lines.push('| módulo | tokens exportados | imports |');
lines.push('| --- | --- | --- |');
for (const mod of providerModules) {
  const imports = mod.imports.map((i) => `\`${i.name ?? i.text}\``).join(', ');
  lines.push(
    `| \`${mod.name}\` | ${mod.exports.map((e) => `\`${e.name}\``).join(', ')} | ${imports || '—'} |`,
  );
}
lines.push('');

/* ---- component-by-component dependency map ---- */
lines.push('## Componentes');
lines.push('');

const componentScopes = [...scopes.entries()]
  .filter(([scope]) => !scope.startsWith('__'))
  .sort(([a], [b]) => a.localeCompare(b));

for (const [scope, mods] of componentScopes) {
  lines.push(`### ${scope}`);
  lines.push('');

  const aggregators = (mods as any[]).filter(
    (m) => m.providers.length === 0 && m.controllers.length === 0,
  );
  const useCases = (mods as any[])
    .filter((m) => m.providers.length > 0 || m.controllers.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name));

  for (const agg of aggregators) {
    lines.push(
      `Agregador \`${agg.name}\` (\`${relative(agg.file)}\`) importa: ${agg.imports
        .map((i: any) => `\`${i.name ?? i.text}\``)
        .join(', ')}. Sem \`exports\`.`,
    );
    lines.push('');
  }

  for (const mod of useCases) {
    lines.push(`#### \`${mod.name}\``);
    lines.push('');
    lines.push(`\`${relative(mod.file)}\``);
    lines.push('');
    lines.push('| classe | injeta | fornecido por |');
    lines.push('| --- | --- | --- |');

    const local = new Set<string>();
    for (const p of [...mod.providers, ...mod.controllers]) {
      if (p.name) local.add(p.name);
      if (p.provide) local.add(p.provide);
    }

    const queue = [...mod.providers, ...mod.controllers]
      .map((e: any) => e.name)
      .filter(Boolean);
    const seen = new Set<string>();
    let rows = 0;

    while (queue.length) {
      const name = queue.shift()!;
      if (seen.has(name)) continue;
      seen.add(name);
      const info = graph.classes.get(name);
      if (!info) continue;
      for (const enhancer of info.enhancers) {
        if (graph.classes.has(enhancer)) queue.push(enhancer);
      }
      for (const dep of info.deps) {
        let supplier: string;
        if (dep.symbol.startsWith(REPOSITORY_TOKEN_PREFIX)) {
          supplier = `\`TypeOrmModule.forFeature([${dep.entity}])\``;
        } else if (local.has(dep.symbol)) {
          supplier = 'próprio módulo';
        } else if (GLOBAL_SYMBOLS.has(dep.symbol)) {
          supplier = 'global (Nest/TypeORM)';
        } else if (owners.has(dep.symbol)) {
          supplier = `\`${owners.get(dep.symbol)}\``;
        } else {
          supplier = '**não resolvido**';
        }
        const symbol = dep.symbol.startsWith(REPOSITORY_TOKEN_PREFIX)
          ? `Repository<${dep.entity}>`
          : dep.symbol;
        lines.push(`| \`${name}\` | \`${symbol}\` | ${supplier} |`);
        rows++;
      }
    }
    if (!rows) lines.push('| — | nenhuma dependência externa | — |');
    lines.push('');
    lines.push(
      `**imports:** ${
        mod.imports.length
          ? mod.imports.map((i: any) => `\`${i.name ?? i.text}\``).join(', ')
          : '—'
      }`,
    );
    lines.push('');
  }
}

lines.push('## Verificação');
lines.push('');
lines.push('```bash');
lines.push(
  'bun run scripts/refactor-di/analyze.ts     # 0 modules to rewrite = convergido',
);
lines.push(
  'bun run scripts/refactor-di/verify.ts      # alcançabilidade estática do grafo',
);
lines.push(
  'TS_NODE_TRANSPILE_ONLY=1 TS_NODE_COMPILER_OPTIONS=\'{"module":"commonjs","moduleResolution":"node","esModuleInterop":true}\' \\',
);
lines.push(
  '  node -r ts-node/register -r tsconfig-paths/register scripts/refactor-di/boot-check.ts   # container Nest completo, sem banco',
);
lines.push('bun run lint && bun run build');
lines.push('```');
lines.push('');

fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
fs.writeFileSync(path.resolve(out), lines.join('\n'), 'utf8');
console.log(`escrito: ${out} (${lines.length} linhas)`);
