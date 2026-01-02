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

async function initWasm() {
  if (initialized) return true;

  try {
    // Dynamic import of WASM module (path resolved at runtime)
    // @ts-ignore - Runtime path resolved by browser
    const wasm = await import('/wasm/dol_wasm.js');
    await wasm.default();
    wasmModule = wasm;
    initialized = true;
    return true;
  } catch (error) {
    console.error('Failed to initialize WASM:', error);
    return false;
  }
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
          bytecode: null,
          messages: ['Compiled (fallback mode)'],
        } : undefined,
        error: validationResult.error,
        compileTime,
      } as CompileResult);
    }
  }
};

// Simple DOL syntax validator as fallback
function validateDolSyntax(source: string): { valid: boolean; error?: string } {
  // Check for spirit declaration
  if (!source.includes('spirit')) {
    return { valid: false, error: 'Expected spirit declaration' };
  }

  // Check bracket matching
  const opens = (source.match(/{/g) || []).length;
  const closes = (source.match(/}/g) || []).length;
  if (opens !== closes) {
    return { valid: false, error: `Unmatched braces: ${opens} opening, ${closes} closing` };
  }

  return { valid: true };
}

export {};
