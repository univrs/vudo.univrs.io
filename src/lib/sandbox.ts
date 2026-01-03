// src/lib/sandbox.ts

export interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
}

export interface SandboxOptions {
  timeout?: number; // ms, default 5000
}

const DEFAULT_TIMEOUT = 5000;

/**
 * Execute compiled WASM in a sandbox
 * For MVP, this simulates execution since we get AST results
 * Will execute real WASM when dol-wasm produces bytecode
 */
export async function executeWasm(
  wasm: Uint8Array | null,
  options: SandboxOptions = {}
): Promise<ExecutionResult> {
  const timeout = options.timeout ?? DEFAULT_TIMEOUT;
  const startTime = performance.now();

  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      resolve({
        success: false,
        error: 'Execution timed out after ' + timeout + 'ms',
        output: '',
        executionTime: timeout,
      });
    }, timeout);

    try {
      if (!wasm || wasm.length === 0) {
        // No bytecode - simulation mode
        clearTimeout(timer);
        resolve({
          success: true,
          output: '▸ Spirit executed successfully\n▸ No bytecode output (AST mode)',
          executionTime: performance.now() - startTime,
        });
        return;
      }

      // Real WASM execution
      executeWasmInternal(wasm)
        .then((output) => {
          clearTimeout(timer);
          resolve({
            success: true,
            output,
            executionTime: performance.now() - startTime,
          });
        })
        .catch((err) => {
          clearTimeout(timer);
          resolve({
            success: false,
            error: err instanceof Error ? err.message : String(err),
            output: '',
            executionTime: performance.now() - startTime,
          });
        });
    } catch (err) {
      clearTimeout(timer);
      resolve({
        success: false,
        error: err instanceof Error ? err.message : String(err),
        output: '',
        executionTime: performance.now() - startTime,
      });
    }
  });
}

async function executeWasmInternal(wasm: Uint8Array): Promise<string> {
  const output: string[] = [];

  // Create import object with console capture
  const importObject = {
    env: {
      print: (ptr: number, len: number) => {
        // Would decode from WASM memory
        output.push('[wasm output]');
      },
      log: (value: number) => {
        output.push(`log: ${value}`);
      },
    },
    wasi_snapshot_preview1: {
      fd_write: () => 0,
      fd_close: () => 0,
      fd_seek: () => 0,
      proc_exit: () => {},
    },
  };

  try {
    // Create a clean ArrayBuffer copy to satisfy TypeScript's type requirements
    const wasmBuffer = new ArrayBuffer(wasm.byteLength);
    new Uint8Array(wasmBuffer).set(wasm);
    const module = await WebAssembly.compile(wasmBuffer);
    const instance = await WebAssembly.instantiate(module, importObject);

    // Look for main or _start function
    const exports = instance.exports;
    if (typeof exports.main === 'function') {
      const result = (exports.main as Function)();
      output.push(`Result: ${result}`);
    } else if (typeof exports._start === 'function') {
      (exports._start as Function)();
    }

    return output.length > 0 ? output.join('\n') : '▸ Execution complete (no output)';
  } catch (err) {
    throw new Error(`WASM execution failed: ${err instanceof Error ? err.message : err}`);
  }
}

/**
 * Simulate execution for AST-only compilation results
 */
export function simulateExecution(ast: object): ExecutionResult {
  const startTime = performance.now();
  const output: string[] = [];

  output.push('▸ Simulation mode (fallback parser)');
  output.push('');

  // Extract info from AST
  const astArray = Array.isArray(ast) ? ast : [ast];
  for (const node of astArray) {
    const nodeType = (node as any).type;
    const nodeName = (node as any).name;
    const body = (node as any).body || [];

    if (nodeType === 'Spirit') {
      output.push(`⟡ Spirit "${nodeName}" instantiated`);
      for (const item of body) {
        if (item.type === 'Function') {
          output.push(`  → fun ${item.name}() defined`);
          if (item.name === 'main') {
            output.push(`  → main() invoked`);
            output.push(`  → return: "Hello from ${nodeName}!"`);
          }
        } else if (item.type === 'Field') {
          output.push(`  → has ${item.name} initialized`);
        }
      }
    } else if (nodeType === 'Gene') {
      output.push(`⧬ Gene "${nodeName}" instantiated`);

      // Show fields first
      const fields = body.filter((b: any) => b.type === 'Field');
      const functions = body.filter((b: any) => b.type === 'Function');

      for (const field of fields) {
        output.push(`  → has ${field.name}: initialized to default`);
      }

      for (const func of functions) {
        output.push(`  → fun ${func.name}() defined`);
      }

      // Simulate calling functions
      output.push('');
      output.push('▸ Executing...');

      const getValue = functions.find((f: any) => f.name === 'get');
      const increment = functions.find((f: any) => f.name === 'increment');

      if (increment) {
        output.push(`  → ${nodeName}.increment() called`);
        output.push(`  → value: 0 → 1`);
      }
      if (getValue) {
        output.push(`  → ${nodeName}.get() → 1`);
      }

      if (!getValue && !increment) {
        // Generic output for other genes
        if (functions.length > 0) {
          output.push(`  → ${nodeName}.${functions[0].name}() called`);
          output.push(`  → return: <simulated>`);
        }
      }
    } else if (nodeType === 'Function') {
      output.push(`▸ fun ${nodeName}() defined`);
      if (nodeName === 'main') {
        output.push(`  → main() invoked`);
      }
    }
  }

  output.push('');
  output.push('✓ Simulation complete');

  return {
    success: true,
    output: output.join('\n'),
    executionTime: performance.now() - startTime,
  };
}
