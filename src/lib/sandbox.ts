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
 * Parses source code to extract actual values for simulation
 */
export function simulateExecution(ast: object, source?: string): ExecutionResult {
  const startTime = performance.now();
  const output: string[] = [];

  // Parse values from source code if available
  let initialValue = 0;
  let incrementAmount = 1;
  let incrementCalls = 0;

  if (source) {
    // Parse initial value: "let c = Counter { value: X }"
    const initMatch = source.match(/let\s+\w+\s*=\s*\w+\s*\{\s*value\s*:\s*(\d+)/);
    if (initMatch) {
      initialValue = parseInt(initMatch[1], 10);
    }

    // Parse increment: "self.value = self.value + X" or "self.value + X"
    const incrMatch = source.match(/self\.value\s*(?:=\s*self\.value\s*)?\+\s*(\d+)/);
    if (incrMatch) {
      incrementAmount = parseInt(incrMatch[1], 10);
    }

    // Count increment calls
    const callMatches = source.match(/\.increment\(\)/g);
    incrementCalls = callMatches ? callMatches.length : 0;
  }

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
        } else if (item.type === 'Field') {
          output.push(`  → has ${item.name} initialized`);
        }
      }
    } else if (nodeType === 'Gene') {
      output.push(`⧬ Gene "${nodeName}" instantiated with value: ${initialValue}`);

      // Show fields and functions
      const fields = body.filter((b: any) => b.type === 'Field');
      const functions = body.filter((b: any) => b.type === 'Function');

      for (const field of fields) {
        output.push(`  → has ${field.name}: ${initialValue}`);
      }

      output.push('');
      output.push('▸ Executing main()...');

      // Simulate increment calls
      let currentValue = initialValue;
      const increment = functions.find((f: any) => f.name === 'increment');
      const getValue = functions.find((f: any) => f.name === 'get');

      if (increment && incrementCalls > 0) {
        for (let i = 0; i < incrementCalls; i++) {
          const oldValue = currentValue;
          currentValue += incrementAmount;
          output.push(`  → ${nodeName}.increment(): ${oldValue} + ${incrementAmount} = ${currentValue}`);
        }
      }

      if (getValue) {
        output.push(`  → ${nodeName}.get() → ${currentValue}`);
      }

      // Check for println
      if (source && source.includes('println')) {
        output.push(`  📤 println: ${currentValue}`);
      }

      output.push('');
      output.push(`✓ Final value: ${currentValue}`);
    } else if (nodeType === 'Function') {
      if (nodeName === 'main') {
        // main is handled above
      }
    }
  }

  return {
    success: true,
    output: output.join('\n'),
    executionTime: performance.now() - startTime,
  };
}
