/**
 * Turns the raw DI graph into an actionable refactor plan:
 *
 *  1. one module per repository   (`src/repositories/*.repository.module.ts`)
 *  2. one module per provider file(`src/infrastructure/providers/*.provider.module.ts`)
 *  3. for every module that owns providers/controllers, the *minimal* `imports`
 *     array derived from what its own classes actually inject
 *  4. aggregator (wiring-only) modules lose their `exports` array
 */
import * as fs from 'fs';
import * as path from 'path';

import * as ts from 'typescript';

import {
  ArrayEntry,
  EXTERNAL_OWNERS,
  GLOBAL_SYMBOLS,
  Graph,
  ModuleInfo,
  REPOSITORY_TOKEN_PREFIX,
  ROOT,
  SRC,
  kebab,
  parse,
  relative,
} from './di-graph';

/** Modules the sweep must not rewrite (hand-maintained wiring). */
export const SKIP_MODULES = new Set(['AppModule']);

/** Aggregator modules that are being dismantled by this refactor. */
export const RETIRED_MODULES = new Set([
  'RepositoriesModule',
  'InfrastructureModule',
]);

export interface GeneratedModule {
  name: string;
  file: string;
  source: string;
  exportsSymbols: string[];
  kind: 'repository' | 'provider';
}

export interface ImportSpec {
  name: string;
  forwardRef: boolean;
  /** absolute path (project module) or bare specifier (external module) */
  from: string;
  /** verbatim text for dynamic entries such as `TypeOrmModule.forFeature([...])` */
  raw?: string;
}

export interface ModulePlan {
  module: string;
  file: string;
  scope: string;
  useCase: string;
  kind: 'use-case' | 'aggregator';
  before: string[];
  after: string[];
  removed: string[];
  added: string[];
  dropExports: boolean;
  imports: ImportSpec[];
  unresolved: { consumer: string; symbol: string }[];
  changed: boolean;
}

export interface Plan {
  generated: GeneratedModule[];
  modules: ModulePlan[];
  owners: Map<string, string>;
  ownerFiles: Map<string, string>;
  collisions: { symbol: string; modules: string[] }[];
  retired: { module: string; file: string }[];
}

const NEST_EXTERNAL_MODULES = new Set([
  'ConfigModule',
  'ScheduleModule',
  'ThrottlerModule',
  'DevtoolsModule',
  'TypeOrmModule',
  'JwtModule',
  'HttpModule',
  'TerminusModule',
]);

const EXTERNAL_MODULE_SPECIFIER: Record<string, string> = {
  ConfigModule: '@nestjs/config',
  ScheduleModule: '@nestjs/schedule',
  ThrottlerModule: '@nestjs/throttler',
  TypeOrmModule: '@nestjs/typeorm',
  JwtModule: '@nestjs/jwt',
  HttpModule: '@nestjs/axios',
  TerminusModule: '@nestjs/terminus',
};

/* ------------------------------------------------------------------ *
 * 1. Repository modules                                               *
 * ------------------------------------------------------------------ */

function repositoryModules(
  graph: Graph,
  tokenOwner: Map<string, { module: string; file: string }>,
): GeneratedModule[] {
  const dir = path.join(SRC, 'repositories');
  const out: GeneratedModule[] = [];

  for (const base of fs.readdirSync(dir).sort()) {
    if (!base.endsWith('.repository.ts')) continue;
    const file = path.join(dir, base);
    const sf = parse(file);

    let className = '';
    for (const stmt of sf.statements) {
      if (ts.isClassDeclaration(stmt) && stmt.name) className = stmt.name.text;
    }
    if (!className) continue;

    const info = graph.classes.get(className);
    const entities: string[] = [];
    const extraModules = new Map<string, string>(); // module name -> file
    const unresolved: string[] = [];

    for (const dep of info?.deps ?? []) {
      if (dep.entity) {
        if (!entities.includes(dep.entity)) entities.push(dep.entity);
        continue;
      }
      if (GLOBAL_SYMBOLS.has(dep.symbol)) continue;
      const owner = tokenOwner.get(dep.symbol);
      if (owner) extraModules.set(owner.module, owner.file);
      else unresolved.push(dep.symbol);
    }
    if (unresolved.length) {
      throw new Error(
        `${className} injects ${unresolved.join(', ')} — no module provides it`,
      );
    }

    const moduleName = `${className}Module`;
    const moduleFile = file.replace(/\.ts$/, '.module.ts');

    const imports: string[] = [];
    if (entities.length) {
      imports.push(`TypeOrmModule.forFeature([${entities.join(', ')}])`);
    }
    imports.push(...[...extraModules.keys()].sort());

    const lines: string[] = ["import { Module } from '@nestjs/common';"];
    if (entities.length) {
      lines.push("import { TypeOrmModule } from '@nestjs/typeorm';");
      lines.push(`import { ${entities.join(', ')} } from 'src/entities';`);
    }
    lines.push('');
    for (const [name, target] of [...extraModules.entries()].sort()) {
      const rel =
        './' + path.basename(target).replace(/\.ts$/, '').replace(/$/, '');
      lines.push(
        `import { ${name} } from '${
          path.dirname(target) === path.dirname(moduleFile)
            ? rel
            : 'src/' +
              path
                .relative(SRC, target)
                .replace(/\.ts$/, '')
                .split(path.sep)
                .join('/')
        }';`,
      );
    }
    lines.push(`import { ${className} } from './${base.replace(/\.ts$/, '')}';`);
    lines.push('');
    lines.push('@Module({');
    if (imports.length) lines.push(`  imports: [${imports.join(', ')}],`);
    lines.push(`  providers: [${className}],`);
    lines.push(`  exports: [${className}],`);
    lines.push('})');
    lines.push(`export class ${moduleName} {}`);
    lines.push('');

    out.push({
      name: moduleName,
      file: moduleFile,
      source: lines.join('\n'),
      exportsSymbols: [className],
      kind: 'repository',
    });
  }

  return out;
}

/* ------------------------------------------------------------------ *
 * 2. Infrastructure provider modules                                  *
 * ------------------------------------------------------------------ */

interface ProviderFileInfo {
  file: string;
  arrayName: string;
  provides: string[];
  injects: string[];
}

function readProviderFile(file: string): ProviderFileInfo | undefined {
  const sf = parse(file);
  let arrayName = '';
  const provides: string[] = [];
  const injects: string[] = [];

  for (const stmt of sf.statements) {
    if (!ts.isVariableStatement(stmt)) continue;
    for (const decl of stmt.declarationList.declarations) {
      if (!ts.isIdentifier(decl.name) || !decl.initializer) continue;
      if (!ts.isArrayLiteralExpression(decl.initializer)) continue;
      if (!/Provider$/.test(decl.name.text)) continue;
      arrayName = decl.name.text;
      for (const el of decl.initializer.elements) {
        if (!ts.isObjectLiteralExpression(el)) continue;
        for (const prop of el.properties) {
          if (!ts.isPropertyAssignment(prop)) continue;
          const key = prop.name.getText();
          if (key === 'provide') provides.push(prop.initializer.getText());
          if (key === 'inject' && ts.isArrayLiteralExpression(prop.initializer)) {
            for (const dep of prop.initializer.elements) {
              injects.push(dep.getText());
            }
          }
        }
      }
    }
  }
  if (!arrayName) return undefined;
  return { file, arrayName, provides, injects };
}

function providerModules(): {
  generated: GeneratedModule[];
  tokenOwnerModule: Map<string, { module: string; file: string }>;
} {
  const dir = path.join(SRC, 'infrastructure', 'providers');
  const infos: ProviderFileInfo[] = [];

  for (const base of fs.readdirSync(dir).sort()) {
    if (!base.endsWith('.provider.ts')) continue;
    const info = readProviderFile(path.join(dir, base));
    if (info) infos.push(info);
  }

  // token -> owning provider module name
  const moduleNameOf = new Map<string, string>();
  const tokenOwner = new Map<string, string>();
  for (const info of infos) {
    // `SendGridProvider` -> `SendGridProviderModule`, `SpiderServiceProvider`
    // -> `SpiderProviderModule`: keep the casing the provider file already uses.
    const base = info.arrayName.replace(/Provider$/, '').replace(/Service$/, '');
    const name = `${base}ProviderModule`;
    moduleNameOf.set(info.file, name);
    for (const token of info.provides) tokenOwner.set(token, name);
  }

  const generated: GeneratedModule[] = infos.map((info) => {
    const moduleName = moduleNameOf.get(info.file)!;
    const base = path.basename(info.file).replace(/\.ts$/, '');
    const own = new Set(info.provides);

    const foreignModules = new Set<string>();
    let needsConfig = false;
    for (const dep of info.injects) {
      if (own.has(dep)) continue;
      if (dep === 'ConfigService') {
        needsConfig = true;
        continue;
      }
      const owner = tokenOwner.get(dep);
      if (owner && owner !== moduleName) foreignModules.add(owner);
    }

    const imports: string[] = [];
    if (needsConfig) imports.push('ConfigModule');
    imports.push(...[...foreignModules].sort());

    const lines: string[] = ["import { Module } from '@nestjs/common';"];
    if (needsConfig) lines.push("import { ConfigModule } from '@nestjs/config';");
    for (const foreign of [...foreignModules].sort()) {
      const target = infos.find((i) => moduleNameOf.get(i.file) === foreign)!;
      const targetBase = path.basename(target.file).replace(/\.ts$/, '');
      lines.push(`import { ${foreign} } from './${targetBase}.module';`);
    }
    lines.push('');
    lines.push(
      `import { ${[info.arrayName, ...info.provides].join(', ')} } from './${base}';`,
    );
    lines.push('');
    lines.push('@Module({');
    if (imports.length) lines.push(`  imports: [${imports.join(', ')}],`);
    lines.push(`  providers: [...${info.arrayName}],`);
    lines.push(`  exports: [${info.provides.join(', ')}],`);
    lines.push('})');
    lines.push(`export class ${moduleName} {}`);
    lines.push('');

    return {
      name: moduleName,
      file: info.file.replace(/\.ts$/, '.module.ts'),
      source: lines.join('\n'),
      exportsSymbols: info.provides,
      kind: 'provider' as const,
    };
  });

  const tokenOwnerModule = new Map<string, { module: string; file: string }>();
  for (const info of infos) {
    const moduleName = moduleNameOf.get(info.file)!;
    const moduleFile = info.file.replace(/\.ts$/, '.module.ts');
    for (const token of info.provides) {
      tokenOwnerModule.set(token, { module: moduleName, file: moduleFile });
    }
  }

  return { generated, tokenOwnerModule };
}

/* ------------------------------------------------------------------ *
 * 3. Minimal imports per module                                       *
 * ------------------------------------------------------------------ */

function isAggregator(mod: ModuleInfo): boolean {
  return mod.providers.length === 0 && mod.controllers.length === 0;
}

export function buildPlan(graph: Graph): Plan {
  const { generated: providers, tokenOwnerModule } = providerModules();
  const repos = repositoryModules(graph, tokenOwnerModule);
  const generated = [...repos, ...providers];

  /* ---- ownership map: symbol -> module that exports it ---- */
  const owners = new Map<string, string>();
  const ownerFiles = new Map<string, string>();
  const collisionTracker = new Map<string, Set<string>>();

  const record = (symbol: string, moduleName: string, file: string) => {
    if (!collisionTracker.has(symbol)) collisionTracker.set(symbol, new Set());
    collisionTracker.get(symbol)!.add(moduleName);
    owners.set(symbol, moduleName);
    ownerFiles.set(moduleName, file);
  };

  for (const gen of generated) {
    for (const symbol of gen.exportsSymbols) record(symbol, gen.name, gen.file);
  }
  for (const mod of graph.modules.values()) {
    if (RETIRED_MODULES.has(mod.name)) continue;
    ownerFiles.set(mod.name, mod.file);
    for (const exp of mod.exports) {
      if (!exp.name) continue;
      if (graph.modules.has(exp.name)) continue; // re-exported module, not a symbol
      record(exp.name, mod.name, mod.file);
    }
  }

  const collisions = [...collisionTracker.entries()]
    .filter(([, mods]) => mods.size > 1)
    .map(([symbol, mods]) => ({ symbol, modules: [...mods] }));

  /* ---- per-module minimal imports ---- */
  const desired = new Map<string, Map<string, boolean>>(); // module -> dep -> forwardRef
  const plans: ModulePlan[] = [];

  /* Generated modules are re-emitted wholesale in step 1, never patched. */
  const generatedFiles = new Set(generated.map((g) => g.file));

  for (const mod of graph.modules.values()) {
    if (SKIP_MODULES.has(mod.name) || RETIRED_MODULES.has(mod.name)) continue;
    if (generatedFiles.has(mod.file)) continue;

    const aggregator = isAggregator(mod);
    const before = mod.imports.map((e) =>
      e.name && !e.forwardRef ? e.name : e.text,
    );

    if (aggregator) {
      plans.push({
        module: mod.name,
        file: mod.file,
        scope: mod.scope,
        useCase: mod.useCase,
        kind: 'aggregator',
        before,
        after: before,
        removed: [],
        added: [],
        dropExports: mod.exports.length > 0,
        imports: [],
        unresolved: [],
        changed: mod.exports.length > 0,
      });
      continue;
    }

    const localProvided = new Set<string>();
    for (const p of [...mod.providers, ...mod.controllers]) {
      if (p.name) localProvided.add(p.name);
      if (p.provide) localProvided.add(p.provide);
    }

    const needs = new Map<string, boolean>();
    const external = new Map<string, boolean>();
    const unresolved: { consumer: string; symbol: string }[] = [];

    /*
     * Walk the module's own classes plus any enhancer (`@UseGuards`, …) they
     * reference: Nest resolves enhancers through this module's injector, so
     * their constructor dependencies are this module's requirements too.
     */
    const queue = [...mod.providers, ...mod.controllers]
      .map((e) => e.name)
      .filter((n): n is string => Boolean(n));
    const visited = new Set<string>();

    while (queue.length) {
      const consumerName = queue.shift()!;
      if (visited.has(consumerName)) continue;
      visited.add(consumerName);
      const info = graph.classes.get(consumerName);
      if (!info) continue;
      for (const enhancer of info.enhancers) {
        if (graph.classes.has(enhancer)) queue.push(enhancer);
      }
      const consumer = { name: consumerName };
      for (const dep of info.deps) {
        if (dep.symbol.startsWith(REPOSITORY_TOKEN_PREFIX)) continue;
        if (localProvided.has(dep.symbol)) continue;
        if (GLOBAL_SYMBOLS.has(dep.symbol)) continue;
        if (EXTERNAL_OWNERS[dep.symbol]) {
          external.set(EXTERNAL_OWNERS[dep.symbol], false);
          continue;
        }
        const owner = owners.get(dep.symbol);
        if (!owner) {
          unresolved.push({ consumer: consumer.name, symbol: dep.symbol });
          continue;
        }
        if (owner === mod.name) continue;
        needs.set(owner, (needs.get(owner) ?? false) || dep.forwardRef);
      }
    }

    // Preserve forwardRef decisions already encoded in the file.
    for (const entry of mod.imports) {
      if (entry.forwardRef && entry.name && needs.has(entry.name)) {
        needs.set(entry.name, true);
      }
    }

    desired.set(mod.name, needs);

    /* dynamic / external imports are carried over verbatim */
    const carried: ImportSpec[] = [];
    for (const entry of mod.imports) {
      if (entry.dynamic) {
        carried.push({ name: entry.text, forwardRef: false, from: '', raw: entry.text });
        continue;
      }
      if (entry.name && NEST_EXTERNAL_MODULES.has(entry.name)) {
        external.set(entry.name, false);
      }
    }
    for (const [name] of external) {
      if (!carried.some((c) => c.raw === name)) {
        carried.push({
          name,
          forwardRef: false,
          from: EXTERNAL_MODULE_SPECIFIER[name] ?? '@nestjs/common',
        });
      }
    }

    plans.push({
      module: mod.name,
      file: mod.file,
      scope: mod.scope,
      useCase: mod.useCase,
      kind: 'use-case',
      before,
      after: [],
      removed: [],
      added: [],
      dropExports: false,
      imports: carried,
      unresolved,
      changed: false,
    });
  }

  /* ---- cycle detection: mutual dependencies get forwardRef on both sides ---- */
  for (const [a, deps] of desired) {
    for (const [b, forward] of deps) {
      const other = desired.get(b);
      if (other?.has(a)) {
        deps.set(b, true);
        other.set(a, true);
      } else if (forward) {
        deps.set(b, true);
      }
    }
  }

  /* ---- materialize final import lists ---- */
  for (const plan of plans) {
    if (plan.kind === 'aggregator') continue;
    const needs = desired.get(plan.module)!;
    const moduleSpecs: ImportSpec[] = [...needs.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, forward]) => ({
        name,
        forwardRef: forward,
        from: ownerFiles.get(name)!,
      }));

    plan.imports = [...plan.imports, ...moduleSpecs];
    plan.after = plan.imports.map((i) =>
      i.raw ? i.raw : i.forwardRef ? `forwardRef(() => ${i.name})` : i.name,
    );

    const beforeSet = new Set(plan.before.map(normalize));
    const afterSet = new Set(plan.after.map(normalize));
    plan.removed = plan.before.filter((b) => !afterSet.has(normalize(b)));
    plan.added = plan.after.filter((a) => !beforeSet.has(normalize(a)));
    plan.changed = plan.removed.length > 0 || plan.added.length > 0;
  }

  const retired = [...RETIRED_MODULES]
    .map((name) => graph.modules.get(name))
    .filter(Boolean)
    .map((m) => ({ module: m!.name, file: m!.file }));

  return { generated, modules: plans, owners, ownerFiles, collisions, retired };
}

function normalize(entry: string): string {
  return entry.replace(/\s+/g, '');
}

export { relative, kebab, ROOT };
