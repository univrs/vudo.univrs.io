// src/workers/compiler.worker.ts

// Types for worker messages
interface CompileRequest {
  type: 'compile';
  source: string;
  requestId: string;
}

interface CompileResult {
  type: 'result';
  requestId: string;
  success: boolean;
  output?: {
    bytecode: Uint8Array | null;
    messages: string[];
    ast?: object;
  };
  error?: string;
  compileTime: number;
}

let initialized = false;
let wasmModule: any = null;
let initPromise: Promise<boolean> | null = null;

async function initWasm(): Promise<boolean> {
  if (initialized) return true;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      // Fetch the JS module from public folder
      const response = await fetch('/wasm/dol_wasm.js');
      if (!response.ok) {
        throw new Error(`Failed to fetch WASM module: ${response.status}`);
      }
      const jsCode = await response.text();

      // Create a blob URL to import the module
      const blob = new Blob([jsCode], { type: 'application/javascript' });
      const blobUrl = URL.createObjectURL(blob);

      try {
        // Dynamic import from blob URL
        const wasm = await import(/* @vite-ignore */ blobUrl);
        if (typeof wasm.default === 'function') {
          await wasm.default();
        }
        wasmModule = wasm;
        initialized = true;
        return true;
      } finally {
        URL.revokeObjectURL(blobUrl);
      }
    } catch (error) {
      console.error('Failed to initialize WASM:', error);
      return false;
    }
  })();

  return initPromise;
}

self.onmessage = async (e: MessageEvent<CompileRequest>) => {
  const { type, source, requestId } = e.data;

  if (type === 'compile') {
    const startTime = performance.now();

    // Try WASM compilation first
    if (await initWasm()) {
      try {
        const result = wasmModule.compile_dol(source);
        const compileTime = performance.now() - startTime;

        self.postMessage({
          type: 'result',
          requestId,
          success: true,
          output: result,
          compileTime,
        } as CompileResult);
      } catch (error) {
        const compileTime = performance.now() - startTime;
        self.postMessage({
          type: 'result',
          requestId,
          success: false,
          error: error instanceof Error ? error.message : String(error),
          compileTime,
        } as CompileResult);
      }
    } else {
      // Fallback: basic validation without WASM
      const compileTime = performance.now() - startTime;
      const validationResult = validateDolSyntax(source);

      self.postMessage({
        type: 'result',
        requestId,
        success: validationResult.valid,
        output: validationResult.valid ? {
          success: true,
          bytecode: null,
          messages: ['Compiled (fallback mode)'],
          ast: validationResult.ast,
          metadata: {
            version: '0.1.0-fallback',
            spirit_count: validationResult.ast?.length || 0,
            function_count: 0,
            source_lines: source.split('\n').length,
          },
        } : undefined,
        error: validationResult.error,
        compileTime,
      } as CompileResult);
    }
  }
};

// Simple DOL syntax validator as fallback
function validateDolSyntax(source: string): { valid: boolean; error?: string; ast?: object[] } {
  // Check for spirit or gene declaration
  const hasSpirit = source.includes('spirit');
  const hasGene = source.includes('gene');
  const hasFun = source.includes('fun ');

  if (!hasSpirit && !hasGene && !hasFun) {
    return { valid: false, error: 'Expected spirit, gene, or fun declaration' };
  }

  // Check bracket matching
  const opens = (source.match(/{/g) || []).length;
  const closes = (source.match(/}/g) || []).length;
  if (opens !== closes) {
    return { valid: false, error: `Unmatched braces: ${opens} opening, ${closes} closing` };
  }

  // Parse basic AST for simulation
  const ast: object[] = [];

  // Parse functions
  const funMatches = source.matchAll(/fun\s+(\w+)\s*\(/g);
  const functions = Array.from(funMatches).map(m => ({ type: 'Function', name: m[1] }));

  // Parse fields (has declarations)
  const hasMatches = source.matchAll(/has\s+(\w+)\s*:/g);
  const fields = Array.from(hasMatches).map(m => ({ type: 'Field', name: m[1] }));

  const spiritMatch = source.match(/spirit\s+(\w+)/);
  const geneMatch = source.match(/gene\s+(\w+)/);

  if (spiritMatch) {
    ast.push({ type: 'Spirit', name: spiritMatch[1], body: [...fields, ...functions] });
  }
  if (geneMatch) {
    ast.push({ type: 'Gene', name: geneMatch[1], body: [...fields, ...functions] });
  }

  // Add standalone functions if no gene/spirit
  if (!spiritMatch && !geneMatch && functions.length > 0) {
    ast.push(...functions);
  }

  return { valid: true, ast };
}

export {};
