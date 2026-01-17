// src/workers/compiler.worker.ts

// Types for worker messages
interface CompileRequest {
  type: 'compile';
  source: string;
  requestId: string;
}

interface ExecutionResult {
  functionName: string;
  args: number[];
  result: number | bigint | null;
  error?: string;
}

interface CompileResult {
  type: 'result';
  requestId: string;
  success: boolean;
  output?: {
    bytecode: Uint8Array | null;
    messages: string[];
    ast?: object;
    execution?: ExecutionResult[];
  };
  error?: string;
  compileTime: number;
}

let initialized = false;
let wasmModule: any = null;
let initPromise: Promise<boolean> | null = null;

/**
 * Execute WASM bytecode and return results from exported functions
 */
async function executeWasm(bytecode: Uint8Array, ast: object[]): Promise<ExecutionResult[]> {
  const results: ExecutionResult[] = [];

  try {
    // Instantiate the WASM module
    // WebAssembly.instantiate with BufferSource returns { module, instance }
    const { instance } = await WebAssembly.instantiate(
      bytecode.buffer as ArrayBuffer,
      {
        env: {
          // Provide basic env imports that might be needed
          abort: () => console.error('WASM abort called'),
          emit: (eventId: number, value: bigint) => {
            console.log(`[WASM] emit event ${eventId}: ${value}`);
          }
        }
      }
    );

    const exports = instance.exports;
    console.log('[Worker] WASM exports:', Object.keys(exports));

    // Find pure functions from AST (purity === 'pure' can be executed)
    const pureFunctions = ast.filter((node: any) =>
      node.type === 'Function' && node.purity === 'pure'
    ) as { name: string; params?: { name: string; type: string }[] }[];

    // Try to execute main() first if it exists
    if (typeof exports.main === 'function') {
      try {
        const mainResult = (exports.main as () => number | bigint)();
        results.push({
          functionName: 'main',
          args: [],
          result: mainResult
        });
        console.log('[Worker] main() =', mainResult);
      } catch (e) {
        results.push({
          functionName: 'main',
          args: [],
          result: null,
          error: e instanceof Error ? e.message : String(e)
        });
      }
    }

    // Execute other exported pure functions with sample arguments for demonstration
    for (const fn of pureFunctions) {
      if (fn.name === 'main') continue; // Already handled

      const exportedFn = exports[fn.name];
      if (typeof exportedFn === 'function') {
        try {
          // Generate sample args based on function parameters
          const argCount = fn.params?.length || (exportedFn as Function).length || 0;
          let sampleValues: number[] = [];

          // Use meaningful sample values for common function names
          if (fn.name === 'add') {
            sampleValues = [40, 2]; // Classic: 40 + 2 = 42
          } else if (fn.name === 'multiply') {
            sampleValues = [6, 7]; // Classic: 6 * 7 = 42
          } else if (fn.name === 'subtract') {
            sampleValues = [50, 8]; // 50 - 8 = 42
          } else if (fn.name === 'divide') {
            sampleValues = [84, 2]; // 84 / 2 = 42
          } else {
            // Default: use small positive integers
            sampleValues = Array(argCount).fill(0).map((_, i) => i + 1);
          }

          // Convert args to BigInt for 64-bit types
          // Parameter type format: { name: string, param_type: string } where param_type is like "Named(\"i64\")"
          const convertedArgs: (number | bigint)[] = sampleValues.map((val, idx) => {
            const param = fn.params?.[idx] as { name?: string; param_type?: string } | undefined;
            const paramType = param?.param_type || '';
            console.log(`[Worker] Param ${idx}: type="${paramType}"`);
            // Check if type contains i64 or i128 (needs BigInt) - handles both "i64" and "Named(\"i64\")"
            if (paramType.includes('64') || paramType.includes('128')) {
              return BigInt(val);
            }
            return val;
          });

          const fnResult = (exportedFn as Function)(...convertedArgs);
          results.push({
            functionName: fn.name,
            args: sampleValues, // Store original numbers for display
            result: fnResult
          });
          console.log(`[Worker] ${fn.name}(${sampleValues.join(', ')}) =`, fnResult);
        } catch (e) {
          results.push({
            functionName: fn.name,
            args: [],
            result: null,
            error: e instanceof Error ? e.message : String(e)
          });
        }
      }
    }
  } catch (e) {
    console.error('[Worker] WASM execution failed:', e);
    results.push({
      functionName: '_instantiation',
      args: [],
      result: null,
      error: e instanceof Error ? e.message : String(e)
    });
  }

  return results;
}

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
  console.log('[Worker] Received message:', type, 'requestId:', requestId);
  console.log('[Worker] Source length:', source?.length, 'chars');

  if (type === 'compile') {
    const startTime = performance.now();

    // Try WASM compilation first
    const wasmReady = await initWasm();
    console.log('[Worker] WASM ready:', wasmReady);

    if (wasmReady) {
      try {
        // Step 1: Parse DOL to AST
        console.log('[Worker] Calling compile_dol...');
        const parseResult = wasmModule.compile_dol(source);
        console.log('[Worker] Parse result:', parseResult?.success, 'AST nodes:', parseResult?.ast?.length);

        // If parsing failed, return the errors
        if (!parseResult.success) {
          const compileTime = performance.now() - startTime;
          self.postMessage({
            type: 'result',
            requestId,
            success: true,
            output: parseResult,
            compileTime,
          } as CompileResult);
          return;
        }

        // Step 2: Check if source has pure functions (for WASM codegen)
        // Note: purity is "pure" or "sex" (lowercase strings from dol-wasm)
        const hasPureFunctions = parseResult.ast?.some(
          (node: any) => node.type === 'Function' && node.purity === 'pure'
        );
        console.log('[Worker] Has pure functions:', hasPureFunctions);

        // Step 3: If we have pure functions, compile to WASM bytecode
        let bytecode: Uint8Array | null = null;
        let wasmError: string | null = null;

        if (hasPureFunctions && wasmModule.compile_to_wasm) {
          try {
            console.log('[Worker] Calling compile_to_wasm...');
            const wasmResult = wasmModule.compile_to_wasm(source);
            console.log('[Worker] WASM result:', wasmResult?.success, 'bytecode size:', wasmResult?.bytecode?.length);
            if (wasmResult.success && wasmResult.bytecode) {
              bytecode = new Uint8Array(wasmResult.bytecode);
              console.log('[Worker] Created bytecode Uint8Array:', bytecode.length, 'bytes');
            } else if (wasmResult.error) {
              wasmError = wasmResult.error;
              console.log('[Worker] WASM error:', wasmError);
            }
          } catch (wasmErr) {
            // WASM codegen failed, but AST is still valid
            wasmError = wasmErr instanceof Error ? wasmErr.message : String(wasmErr);
            console.error('[Worker] WASM compile exception:', wasmError);
          }
        } else {
          console.log('[Worker] Skipping WASM codegen - no pure functions or compile_to_wasm unavailable');
        }

        // Step 4: Execute WASM bytecode if available
        let execution: ExecutionResult[] = [];
        if (bytecode && bytecode.length > 0) {
          console.log('[Worker] Executing WASM bytecode...');
          try {
            execution = await executeWasm(bytecode, parseResult.ast || []);
            console.log('[Worker] Execution results:', execution.length, 'functions');
          } catch (execErr) {
            console.error('[Worker] Execution failed:', execErr);
            execution = [{
              functionName: '_execution',
              args: [],
              result: null,
              error: execErr instanceof Error ? execErr.message : String(execErr)
            }];
          }
        }

        const compileTime = performance.now() - startTime;
        console.log('[Worker] Compile time:', compileTime.toFixed(2), 'ms');

        // Return combined result with AST, bytecode, and execution results
        const response = {
          type: 'result',
          requestId,
          success: true,
          output: {
            ...parseResult,
            bytecode,
            wasmError,
            execution,
          },
          compileTime,
        };
        console.log('[Worker] Sending response with bytecode:', bytecode?.length ?? 'null', 'execution:', execution.length);
        self.postMessage(response as CompileResult);
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

// Simple DOL v0.8.0 syntax validator as fallback
function validateDolSyntax(source: string): { valid: boolean; error?: string; ast?: object[] } {
  // Check for spirit, gen/gene declaration
  const hasSpirit = source.includes('spirit');
  const hasGen = /\bgen\s/.test(source) || source.includes('gene');  // Support both v0.8.0 'gen' and legacy 'gene'
  const hasFun = /\bfun\s/.test(source);
  const hasSexFun = /\bsex\s+fun\s/.test(source);

  if (!hasSpirit && !hasGen && !hasFun) {
    return { valid: false, error: 'Expected spirit, gen, or fun declaration' };
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

  // Parse rules/constraints (support both v0.8.0 'rule' and legacy 'constraint')
  const ruleMatches = source.matchAll(/(?:rule|constraint)\s+(\w+)\s*{/g);
  const rules = Array.from(ruleMatches).map(m => ({ type: 'Rule', name: m[1] }));

  // Parse spirit with version
  const spiritMatch = source.match(/spirit\s+(\w+)\s*(@[\d.]+)?/);
  // Support both v0.8.0 'gen' and legacy 'gene'
  const genMatch = source.match(/(?:gen|gene)\s+(\w+)/);

  if (spiritMatch) {
    ast.push({
      type: 'Spirit',
      name: spiritMatch[1],
      version: spiritMatch[2]?.slice(1) || null,
      body: [...fields, ...rules, ...allFunctions]
    });
  }
  if (genMatch) {
    ast.push({
      type: 'Gen',
      name: genMatch[1],
      body: [...fields, ...rules, ...allFunctions]
    });
  }

  // Add standalone functions if no gen/spirit
  if (!spiritMatch && !genMatch && allFunctions.length > 0) {
    ast.push(...allFunctions);
  }

  return { valid: true, ast };
}

export {};
