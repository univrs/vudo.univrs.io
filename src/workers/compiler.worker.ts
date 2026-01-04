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
      // Fetch both JS and WASM files in parallel
      const [jsResponse, wasmResponse] = await Promise.all([
        fetch('/wasm/dol_wasm.js'),
        fetch('/wasm/dol_wasm_bg.wasm')
      ]);

      if (!jsResponse.ok) {
        throw new Error(`Failed to fetch JS module: ${jsResponse.status}`);
      }
      if (!wasmResponse.ok) {
        throw new Error(`Failed to fetch WASM binary: ${wasmResponse.status}`);
      }

      const jsCode = await jsResponse.text();
      const wasmBinary = await wasmResponse.arrayBuffer();

      // Create a blob URL to import the module
      const blob = new Blob([jsCode], { type: 'application/javascript' });
      const blobUrl = URL.createObjectURL(blob);

      try {
        // Dynamic import from blob URL
        const wasm = await import(/* @vite-ignore */ blobUrl);

        // Initialize with the WASM binary we fetched (using new API format)
        if (typeof wasm.default === 'function') {
          await wasm.default({ module_or_path: wasmBinary });
        }

        wasmModule = wasm;
        initialized = true;
        console.log('WASM module initialized successfully');
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

// Simple DOL v0.7.0 syntax validator as fallback
function validateDolSyntax(source: string): { valid: boolean; error?: string; ast?: object[] } {
  // Check for spirit or gene declaration
  const hasSpirit = source.includes('spirit');
  const hasGene = source.includes('gene');
  const hasFun = /\bfun\s/.test(source);
  const hasSexFun = /\bsex\s+fun\s/.test(source);

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

  // Parse pure functions
  const pureFunMatches = source.matchAll(/(?<!sex\s+)fun\s+(\w+)\s*\(/g);
  const pureFunctions = Array.from(pureFunMatches).map(m => ({
    type: 'Function',
    name: m[1],
    effectful: false
  }));

  // Parse effectful functions (sex fun)
  const sexFunMatches = source.matchAll(/sex\s+fun\s+(\w+)\s*\(/g);
  const effectfulFunctions = Array.from(sexFunMatches).map(m => ({
    type: 'Function',
    name: m[1],
    effectful: true
  }));

  const allFunctions = [...pureFunctions, ...effectfulFunctions];

  // Parse fields (has declarations)
  const hasMatches = source.matchAll(/has\s+(\w+)\s*:/g);
  const fields = Array.from(hasMatches).map(m => ({ type: 'Field', name: m[1] }));

  // Parse constraints
  const constraintMatches = source.matchAll(/constraint\s+(\w+)\s*{/g);
  const constraints = Array.from(constraintMatches).map(m => ({ type: 'Constraint', name: m[1] }));

  // Parse spirit with version
  const spiritMatch = source.match(/spirit\s+(\w+)\s*(@[\d.]+)?/);
  const geneMatch = source.match(/gene\s+(\w+)/);

  if (spiritMatch) {
    ast.push({
      type: 'Spirit',
      name: spiritMatch[1],
      version: spiritMatch[2]?.slice(1) || null,
      body: [...fields, ...constraints, ...allFunctions]
    });
  }
  if (geneMatch) {
    ast.push({
      type: 'Gene',
      name: geneMatch[1],
      body: [...fields, ...constraints, ...allFunctions]
    });
  }

  // Add standalone functions if no gene/spirit
  if (!spiritMatch && !geneMatch && allFunctions.length > 0) {
    ast.push(...allFunctions);
  }

  return { valid: true, ast };
}

export {};
