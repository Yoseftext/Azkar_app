import { readFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const zustandShimUrl = pathToFileURL(path.join(projectRoot, 'tools/test/shims/zustand.mjs')).href;
const quranShimUrl = pathToFileURL(path.join(projectRoot, 'tools/test/shims/load-quran.mjs')).href;

function resolveLocalFile(basePath) {
  const candidates = [
    basePath,
    `${basePath}.ts`,
    `${basePath}.tsx`,
    `${basePath}.js`,
    `${basePath}.mjs`,
    path.join(basePath, 'index.ts'),
    path.join(basePath, 'index.tsx'),
    path.join(basePath, 'index.js'),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return pathToFileURL(candidate).href;
    }
  }

  throw new Error(`Cannot resolve local module: ${basePath}`);
}

function transformImportMetaEnv(source) {
  return source.replaceAll('import.meta.env', 'globalThis.__IMPORT_META_ENV__');
}

function injectImportMetaGlobShim(source) {
  if (!source.includes('import.meta.glob')) return source;

  const shim = [
    "import { readdirSync, readFileSync } from 'node:fs';",
    "import path from 'node:path';",
    "import { fileURLToPath, pathToFileURL } from 'node:url';",
    'const __TEST_IMPORT_META_GLOB__ = (moduleUrl, pattern, options = undefined) => {',
    "  if (!pattern.includes('*')) {",
    '    throw new Error(`Unsupported import.meta.glob pattern in tests: ${pattern}`);',
    '  }',
    '',
    '  const moduleDir = path.dirname(fileURLToPath(moduleUrl));',
    "  const wildcardIndex = pattern.indexOf('*');",
    '  const relativeDir = pattern.slice(0, wildcardIndex);',
    '  const absoluteDir = path.resolve(moduleDir, relativeDir);',
    '  const entries = readdirSync(absoluteDir, { withFileTypes: true });',
    '  const loaders = {};',
    '',
    '  for (const entry of entries) {',
    '    if (!entry.isFile()) continue;',
    '    const key = relativeDir + entry.name;',
    '    const absolutePath = path.join(absoluteDir, entry.name);',
    '    const targetUrl = pathToFileURL(absolutePath).href;',
    '',
    "    if (entry.name.endsWith('.json')) {",
    '      loaders[key] = async () => {',
    "        const payload = JSON.parse(readFileSync(absolutePath, 'utf8'));",
    "        return options && options.import === 'default' ? payload : { default: payload };",
    '      };',
    '      continue;',
    '    }',
    '',
    '    loaders[key] = async () => {',
    '      const imported = await import(targetUrl);',
    "      return options && options.import === 'default' ? (imported.default ?? imported) : imported;",
    '    };',
    '  }',
    '',
    '  return loaders;',
    '};',
    '',
  ].join('\n');

  return `${shim}${source}`.replace(
    /import\.meta\.glob(?:<[^>]+>)?\(\s*([\"\'])([^\"\']+)\1\s*(?:,\s*(\{[\s\S]*?\}))?\s*\)/g,
    (_, __quote, pattern, options) => `__TEST_IMPORT_META_GLOB__(import.meta.url, ${JSON.stringify(pattern)}, ${options ?? 'undefined'})`,
  );
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier === 'zustand') {
    return { url: zustandShimUrl, shortCircuit: true };
  }

  if (specifier === '@/content/loaders/load-quran') {
    return { url: quranShimUrl, shortCircuit: true };
  }

  if (specifier.startsWith('@/')) {
    const absolutePath = path.resolve(projectRoot, 'src', specifier.slice(2));
    return { url: resolveLocalFile(absolutePath), shortCircuit: true };
  }

  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (url.endsWith('.ts') || url.endsWith('.tsx')) {
    let source = await readFile(fileURLToPath(url), 'utf8');
    source = transformImportMetaEnv(source);
    source = injectImportMetaGlobShim(source);

    const transpiled = ts.transpileModule(source, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ESNext,
        jsx: ts.JsxEmit.ReactJSX,
        moduleResolution: ts.ModuleResolutionKind.Bundler,
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
      fileName: fileURLToPath(url),
      reportDiagnostics: false,
    });

    return {
      format: 'module',
      source: transpiled.outputText,
      shortCircuit: true,
    };
  }

  return nextLoad(url, context);
}
