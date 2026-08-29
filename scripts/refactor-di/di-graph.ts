/**
 * Shared AST utilities for the dependency-injection refactor.
 *
 * Parses every `.ts` file under `src/` with the TypeScript compiler API (syntax
 * only — no type checker, no program) and builds:
 *
 *  - a class index      (class name        -> file that declares it)
 *  - a token index      (DI token const    -> provider file that declares it)
 *  - a module index     (module class name -> its @Module metadata)
 *  - a constructor index(class name        -> the symbols it injects)
 *
 * Everything downstream (analyze.ts, apply.ts) reads these structures.
 */
import * as fs from 'fs';
import * as path from 'path';

import * as ts from 'typescript';

export const ROOT = path.resolve(__dirname, '..', '..');
export const SRC = path.join(ROOT, 'src');

/** Providers Nest resolves without a module import in this codebase. */
export const GLOBAL_SYMBOLS = new Set([
  'Reflector',
  'ModuleRef',
  'DataSource', // TypeOrmModule.forRoot is global
  'EntityManager',
  'HttpAdapterHost',
  'SchedulerRegistry',
]);

/** Marker prefix for a `@InjectRepository(XEntity)` dependency. */
export const REPOSITORY_TOKEN_PREFIX = '__typeorm_repository__:';

/** Symbols provided by a well-known external module rather than one of ours. */
export const EXTERNAL_OWNERS: Record<string, string> = {
  ConfigService: 'ConfigModule',
};

export interface ArrayEntry {
  /** Bare identifier name when the entry is a plain identifier. */
  name?: string;
  /** Verbatim source text — used to round-trip entries we do not understand. */
  text: string;
  forwardRef?: boolean;
  /** True for `TypeOrmModule.forFeature([...])`, `X.forRoot()`, object literals… */
  dynamic?: boolean;
  /** `provide:` value for inline object-literal providers. */
  provide?: string;
}

export interface ModuleInfo {
  name: string;
  file: string;
  imports: ArrayEntry[];
  providers: ArrayEntry[];
  controllers: ArrayEntry[];
  exports: ArrayEntry[];
  /** local identifier -> resolved absolute file path (or bare specifier) */
  importedFrom: Map<string, string>;
  /** local identifier -> the specifier text it was imported with */
  importedSpecifier: Map<string, string>;
  /** Component scope this module belongs to, e.g. `AIChat`, or `__root__`. */
  scope: string;
  /** Use-case folder name, e.g. `Question`, or '' for scope-level modules. */
  useCase: string;
}

export interface Dep {
  symbol: string;
  forwardRef: boolean;
  optional: boolean;
  /**
   * Set when the parameter is `@InjectRepository(XEntity)`. The token comes
   * from `TypeOrmModule.forFeature([XEntity])` in the *declaring* module, not
   * from any module export, so it is checked separately.
   */
  entity?: string;
}

export interface ClassInfo {
  name: string;
  file: string;
  deps: Dep[];
  /**
   * Enhancer classes referenced by `@UseGuards` / `@UseInterceptors` /
   * `@UsePipes` / `@UseFilters` on the class or any of its methods. Nest
   * resolves these through the declaring module's injector, so their own
   * dependencies are module requirements too.
   */
  enhancers: string[];
  /** local identifier -> resolved absolute file path (or bare specifier) */
  importedFrom: Map<string, string>;
}

export interface Graph {
  modules: Map<string, ModuleInfo>;
  classes: Map<string, ClassInfo>;
  /** DI token const name -> file declaring it */
  tokens: Map<string, string>;
  /** exported symbol -> module class name that exports it */
  owners: Map<string, string>;
  /**
   * Class names declared in more than one file. Everything here is keyed by
   * class name, so a duplicate silently resolves to whichever file was parsed
   * last — the graph is only trustworthy while this list is empty.
   */
  duplicates: { name: string; files: string[] }[];
}

export function walk(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.spec.ts')) {
      out.push(full);
    }
  }
  return out;
}

export function parse(file: string): ts.SourceFile {
  return ts.createSourceFile(
    file,
    fs.readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );
}

/**
 * Maps every named import in `sf` to the absolute path it resolves to, and to
 * the verbatim specifier it was written with (so rewrites can preserve style).
 */
function collectImports(sf: ts.SourceFile): {
  resolved: Map<string, string>;
  specifier: Map<string, string>;
} {
  const map = new Map<string, string>();
  const specifier = new Map<string, string>();
  for (const stmt of sf.statements) {
    if (!ts.isImportDeclaration(stmt) || !stmt.importClause) continue;
    const spec = (stmt.moduleSpecifier as ts.StringLiteral).text;
    let resolved = spec;
    if (spec.startsWith('.')) {
      resolved = path.resolve(path.dirname(sf.fileName), spec) + '.ts';
    } else if (spec.startsWith('src/')) {
      resolved = path.join(ROOT, spec) + '.ts';
    }
    const bindings = stmt.importClause.namedBindings;
    if (bindings && ts.isNamedImports(bindings)) {
      for (const el of bindings.elements) {
        map.set(el.name.text, resolved);
        specifier.set(el.name.text, spec);
      }
    }
    if (stmt.importClause.name) {
      map.set(stmt.importClause.name.text, resolved);
      specifier.set(stmt.importClause.name.text, spec);
    }
  }
  return { resolved: map, specifier };
}

function decoratorsOf(node: ts.Node): readonly ts.Decorator[] {
  return (ts.canHaveDecorators(node) ? ts.getDecorators(node) : undefined) ?? [];
}

function decoratorCall(dec: ts.Decorator): ts.CallExpression | undefined {
  return ts.isCallExpression(dec.expression) ? dec.expression : undefined;
}

function decoratorName(dec: ts.Decorator): string {
  const call = decoratorCall(dec);
  const expr = call ? call.expression : dec.expression;
  return ts.isIdentifier(expr) ? expr.text : expr.getText();
}

/** Unwraps `forwardRef(() => X)` down to `X`. */
function unwrapForwardRef(
  node: ts.Expression,
): { name: string; forwardRef: boolean } | undefined {
  if (ts.isIdentifier(node)) return { name: node.text, forwardRef: false };
  if (
    ts.isCallExpression(node) &&
    ts.isIdentifier(node.expression) &&
    node.expression.text === 'forwardRef' &&
    node.arguments.length === 1
  ) {
    const arrow = node.arguments[0];
    if (ts.isArrowFunction(arrow) && ts.isIdentifier(arrow.body as ts.Node)) {
      return { name: (arrow.body as ts.Identifier).text, forwardRef: true };
    }
  }
  return undefined;
}

function readArray(
  prop: ts.ObjectLiteralElementLike | undefined,
): ArrayEntry[] {
  if (!prop || !ts.isPropertyAssignment(prop)) return [];
  const init = prop.initializer;
  if (!ts.isArrayLiteralExpression(init)) return [];
  return init.elements.map((el): ArrayEntry => {
    const text = el.getText();
    const unwrapped = ts.isIdentifier(el) ? undefined : unwrapForwardRef(el);
    if (ts.isIdentifier(el)) return { name: el.text, text };
    if (unwrapped) return { name: unwrapped.name, text, forwardRef: true };
    if (ts.isObjectLiteralExpression(el)) {
      const provide = el.properties.find(
        (p) => p.name && p.name.getText() === 'provide',
      );
      const provideName =
        provide && ts.isPropertyAssignment(provide)
          ? provide.initializer.getText()
          : undefined;
      return { text, dynamic: true, provide: provideName };
    }
    return { text, dynamic: true };
  });
}

function moduleDecoratorArg(
  cls: ts.ClassDeclaration,
): ts.ObjectLiteralExpression | undefined {
  for (const dec of decoratorsOf(cls)) {
    if (decoratorName(dec) !== 'Module') continue;
    const call = decoratorCall(dec);
    const arg = call?.arguments[0];
    if (arg && ts.isObjectLiteralExpression(arg)) return arg;
  }
  return undefined;
}

function scopeOf(file: string): { scope: string; useCase: string } {
  const rel = path.relative(SRC, file);
  const parts = rel.split(path.sep);
  if (parts[0] !== 'components') return { scope: `__${parts[0]}__`, useCase: '' };
  // components/<Scope>/[<Sub>/]<UseCase>/file.ts  |  components/<Scope>/file.ts
  const dirs = parts.slice(1, -1);
  if (dirs.length === 0) return { scope: '__components__', useCase: '' };
  return {
    scope: dirs[0],
    useCase: dirs.length > 1 ? dirs.slice(1).join('/') : '',
  };
}

function constructorDeps(cls: ts.ClassDeclaration): Dep[] {
  const ctor = cls.members.find(ts.isConstructorDeclaration);
  if (!ctor) return [];
  const deps: Dep[] = [];
  for (const param of ctor.parameters) {
    let symbol: string | undefined;
    let entity: string | undefined;
    let forward = false;
    let optional = false;
    for (const dec of decoratorsOf(param)) {
      const name = decoratorName(dec);
      if (name === 'Optional') optional = true;
      if (name === 'InjectRepository') {
        const arg = decoratorCall(dec)?.arguments[0];
        if (arg) {
          entity = arg.getText();
          symbol = `${REPOSITORY_TOKEN_PREFIX}${entity}`;
        }
      }
      if (name !== 'Inject') continue;
      const arg = decoratorCall(dec)?.arguments[0];
      if (!arg) continue;
      const unwrapped = unwrapForwardRef(arg);
      if (unwrapped) {
        symbol = unwrapped.name;
        forward = unwrapped.forwardRef;
      } else if (ts.isStringLiteral(arg)) {
        symbol = arg.text;
      }
    }
    if (!symbol && param.type && ts.isTypeReferenceNode(param.type)) {
      symbol = param.type.typeName.getText();
    }
    if (symbol) deps.push({ symbol, forwardRef: forward, optional, entity });
  }
  return deps;
}

const ENHANCER_DECORATORS = new Set([
  'UseGuards',
  'UseInterceptors',
  'UsePipes',
  'UseFilters',
]);

/** Enhancer classes attached to the class itself or to any of its methods. */
function enhancerClasses(cls: ts.ClassDeclaration): string[] {
  const found = new Set<string>();
  const collect = (node: ts.Node) => {
    for (const dec of decoratorsOf(node)) {
      if (!ENHANCER_DECORATORS.has(decoratorName(dec))) continue;
      for (const arg of decoratorCall(dec)?.arguments ?? []) {
        if (ts.isIdentifier(arg)) found.add(arg.text);
        const unwrapped = unwrapForwardRef(arg);
        if (unwrapped) found.add(unwrapped.name);
      }
    }
  };
  collect(cls);
  for (const member of cls.members) collect(member);
  return [...found];
}

export function buildGraph(): Graph {
  const files = walk(SRC);
  const modules = new Map<string, ModuleInfo>();
  const classes = new Map<string, ClassInfo>();
  const tokens = new Map<string, string>();
  const declaredIn = new Map<string, string[]>();

  for (const file of files) {
    const sf = parse(file);
    const { resolved: importedFrom, specifier: importedSpecifier } =
      collectImports(sf);

    for (const stmt of sf.statements) {
      // DI tokens: `export const SUPABASE_CLIENT = 'SUPABASE_CLIENT';`
      if (ts.isVariableStatement(stmt)) {
        const exported = stmt.modifiers?.some(
          (m) => m.kind === ts.SyntaxKind.ExportKeyword,
        );
        if (!exported) continue;
        for (const decl of stmt.declarationList.declarations) {
          if (!ts.isIdentifier(decl.name)) continue;
          const name = decl.name.text;
          if (/^[A-Z][A-Z0-9_]*$/.test(name) && decl.initializer) {
            tokens.set(name, file);
          }
        }
        continue;
      }

      if (!ts.isClassDeclaration(stmt) || !stmt.name) continue;
      const name = stmt.name.text;
      declaredIn.set(name, [...(declaredIn.get(name) ?? []), file]);
      const meta = moduleDecoratorArg(stmt);

      if (meta) {
        const prop = (key: string) =>
          meta.properties.find((p) => p.name && p.name.getText() === key);
        const { scope, useCase } = scopeOf(file);
        modules.set(name, {
          name,
          file,
          imports: readArray(prop('imports')),
          providers: readArray(prop('providers')),
          controllers: readArray(prop('controllers')),
          exports: readArray(prop('exports')),
          importedFrom,
          importedSpecifier,
          scope,
          useCase,
        });
      } else {
        classes.set(name, {
          name,
          file,
          deps: constructorDeps(stmt),
          enhancers: enhancerClasses(stmt),
          importedFrom,
        });
      }
    }
  }

  const owners = new Map<string, string>();
  for (const mod of modules.values()) {
    for (const exp of mod.exports) {
      if (exp.name) owners.set(exp.name, mod.name);
    }
  }

  const duplicates = [...declaredIn.entries()]
    .filter(([, list]) => list.length > 1)
    .map(([name, list]) => ({ name, files: list }));

  return { modules, classes, tokens, owners, duplicates };
}

export function relative(file: string): string {
  return path.relative(ROOT, file);
}

/** kebab-case a PascalCase identifier: `AgentInstruction` -> `agent-instruction`. */
export function kebab(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}
