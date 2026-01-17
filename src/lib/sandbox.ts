// src/lib/sandbox.ts

import { getSpiritRuntime, Spirit } from './spirit-runtime';

export interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
  spirit?: Spirit;
}

export interface SandboxOptions {
  timeout?: number; // ms, default 5000
  spiritName?: string; // Name for the Spirit instance
}

const DEFAULT_TIMEOUT = 5000;

// Track the current Spirit for REPL interactions
let currentSpirit: Spirit | null = null;

/**
 * Get the currently loaded Spirit (for REPL use)
 */
export function getCurrentSpirit(): Spirit | null {
  return currentSpirit;
}

/**
 * Execute compiled WASM in the Spirit runtime
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
          output: '▸ No bytecode (AST-only mode)',
          executionTime: performance.now() - startTime,
        });
        return;
      }

      // Real WASM execution via SpiritRuntime
      executeWithSpirit(wasm, options.spiritName)
        .then(({ output, spirit }) => {
          clearTimeout(timer);
          currentSpirit = spirit;
          resolve({
            success: true,
            output,
            executionTime: performance.now() - startTime,
            spirit,
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

/**
 * Execute WASM using the SpiritRuntime
 */
async function executeWithSpirit(
  wasm: Uint8Array,
  name?: string
): Promise<{ output: string; spirit: Spirit }> {
  const runtime = getSpiritRuntime();
  const output: string[] = [];

  // Load the WASM as a Spirit
  const spirit = await runtime.loadWasm(wasm, name);
  output.push(`⟡ Spirit "${spirit.name}" loaded`);

  // List exported functions
  const exports = Array.from(spirit.exports.functions.keys());
  if (exports.length > 0) {
    output.push(`  Exports: ${exports.join(', ')}`);
  }

  // Auto-execute main if present
  if (spirit.exports.functions.has('main')) {
    output.push('');
    output.push('▸ Executing main()...');

    try {
      const result = runtime.execute(spirit, 'main', []);

      // Show logs from execution
      if (result.logs.length > 0) {
        for (const log of result.logs) {
          output.push(`  ${log}`);
        }
      }

      // Show events
      if (result.events.length > 0) {
        for (const event of result.events) {
          output.push(`  ⚡ ${event.name}: ${JSON.stringify(event.data)}`);
        }
      }

      // Show return value
      if (result.result !== undefined) {
        output.push('');
        output.push(`✓ main() → ${result.result}`);
      }
    } catch (err) {
      output.push(`✗ Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return { output: output.join('\n'), spirit };
}

/**
 * Simulate execution for AST-only compilation results
 * Parses source code to extract actual values and simulates function calls
 */
export function simulateExecution(ast: object, source?: string): ExecutionResult {
  const startTime = performance.now();
  const output: string[] = [];

  // Extract info from AST
  const astArray = Array.isArray(ast) ? ast : [ast];

  // Collect all functions for simulation
  const functions: Map<string, { params: string[]; purity: string; body?: string }> = new Map();
  const emittedEvents: string[] = [];

  // First pass: collect function definitions
  for (const node of astArray) {
    const nodeType = (node as any).type?.toLowerCase();
    const nodeName = (node as any).name;
    const purity = (node as any).purity;
    const params = (node as any).params || [];

    if (nodeType === 'function') {
      functions.set(nodeName, {
        params: params.map((p: any) => p.name),
        purity: purity === 'SideEffect' ? 'sex' : 'pure',
      });
    }
  }

  // Parse function bodies and calls from source
  const functionCalls: { name: string; args: number[] }[] = [];

  if (source) {
    // Parse main() body for function calls
    const mainMatch = source.match(/fun\s+main\s*\(\s*\)\s*\{([^}]+)\}/s);
    if (mainMatch) {
      const mainBody = mainMatch[1];

      // Find all function calls: funcName(arg1, arg2)
      const callRegex = /(\w+)\s*\(\s*([^)]*)\s*\)/g;
      let match;
      while ((match = callRegex.exec(mainBody)) !== null) {
        const funcName = match[1];
        const argsStr = match[2];
        // Only process known functions, skip 'let' assignments
        if (functions.has(funcName)) {
          const args = argsStr
            .split(',')
            .map(a => a.trim())
            .filter(a => a.length > 0)
            .map(a => {
              // Try to resolve variable or parse number
              const num = parseInt(a, 10);
              return isNaN(num) ? 0 : num;
            });
          functionCalls.push({ name: funcName, args });
        }
      }

      // Parse let bindings with function calls
      const letRegex = /let\s+(\w+)\s*=\s*(\w+)\s*\(\s*([^)]*)\s*\)/g;
      while ((match = letRegex.exec(mainBody)) !== null) {
        const varName = match[1];
        const funcName = match[2];
        const argsStr = match[3];
        if (functions.has(funcName)) {
          const args = argsStr
            .split(',')
            .map(a => a.trim())
            .filter(a => a.length > 0)
            .map(a => {
              const num = parseInt(a, 10);
              return isNaN(num) ? 0 : num;
            });
          functionCalls.push({ name: funcName, args });
        }
      }
    }

    // Parse emit statements from source
    const emitRegex = /emit\s+(\w+)\s*\(/g;
    let emitMatch;
    while ((emitMatch = emitRegex.exec(source)) !== null) {
      emittedEvents.push(emitMatch[1]);
    }
  }

  // Second pass: display AST structure
  for (const node of astArray) {
    const nodeType = (node as any).type?.toLowerCase();
    const nodeName = (node as any).name;
    const statements = (node as any).statements || (node as any).body || [];

    if (nodeType === 'spirit') {
      output.push(`⟡ Spirit "${nodeName}" loaded`);
    } else if (nodeType === 'gene' || nodeType === 'gen') {
      output.push(`⧬ Gen "${nodeName}" instantiated`);
      for (const stmt of statements) {
        const kind = stmt.kind || stmt.type;
        if (kind === 'Has' || kind === 'HasField') {
          output.push(`  → has ${stmt.property || stmt.name}`);
        } else if (kind === 'Is') {
          output.push(`  → is ${stmt.state}`);
        }
      }
    } else if (nodeType === 'trait') {
      output.push(`⚙ Trait "${nodeName}" defined`);
    } else if (nodeType === 'constraint' || nodeType === 'rule') {
      output.push(`⛓ Rule "${nodeName}" defined`);
    }
  }

  // Check if we have a main function
  const hasMain = functions.has('main');

  if (hasMain) {
    output.push('');
    output.push('▸ Executing main()...');
    output.push('');

    // Simulate function calls
    const variables: Map<string, number> = new Map();
    let lastResult = 0;

    // Parse let bindings from main
    if (source) {
      const mainMatch = source.match(/fun\s+main\s*\(\s*\)\s*\{([^}]+)\}/s);
      if (mainMatch) {
        const mainBody = mainMatch[1];
        const letRegex = /let\s+(\w+)\s*=\s*(\w+)\s*\(\s*([^)]*)\s*\)/g;
        let match;

        while ((match = letRegex.exec(mainBody)) !== null) {
          const varName = match[1];
          const funcName = match[2];
          const argsStr = match[3];

          if (functions.has(funcName)) {
            const func = functions.get(funcName)!;
            const args = argsStr
              .split(',')
              .map(a => a.trim())
              .filter(a => a.length > 0)
              .map(a => {
                // Check if it's a variable reference
                if (variables.has(a)) {
                  return variables.get(a)!;
                }
                const num = parseInt(a, 10);
                return isNaN(num) ? 0 : num;
              });

            // Simulate the function
            let result = 0;
            if (funcName === 'add' && args.length >= 2) {
              result = args[0] + args[1];
              output.push(`  → ${funcName}(${args.join(', ')}) = ${result}`);
            } else if (funcName === 'multiply' && args.length >= 2) {
              result = args[0] * args[1];
              output.push(`  → ${funcName}(${args.join(', ')}) = ${result}`);
            } else if (funcName === 'subtract' && args.length >= 2) {
              result = args[0] - args[1];
              output.push(`  → ${funcName}(${args.join(', ')}) = ${result}`);
            } else if (funcName === 'divide' && args.length >= 2) {
              result = args[1] !== 0 ? Math.floor(args[0] / args[1]) : 0;
              output.push(`  → ${funcName}(${args.join(', ')}) = ${result}`);
            } else {
              output.push(`  → ${funcName}(${args.join(', ')}) called`);
            }

            variables.set(varName, result);
            lastResult = result;
          }
        }

        // Parse standalone function calls (like log_result(sum))
        const callRegex = /(?<!let\s+\w+\s*=\s*)(\w+)\s*\(\s*([^)]*)\s*\)/g;
        const lines = mainBody.split('\n');
        for (const line of lines) {
          if (line.includes('let ') || line.includes('return ')) continue;

          const callMatch = line.match(/(\w+)\s*\(\s*([^)]*)\s*\)/);
          if (callMatch) {
            const funcName = callMatch[1];
            const argsStr = callMatch[2];

            if (functions.has(funcName)) {
              const func = functions.get(funcName)!;
              const args = argsStr
                .split(',')
                .map(a => a.trim())
                .filter(a => a.length > 0)
                .map(a => {
                  if (variables.has(a)) {
                    return variables.get(a)!;
                  }
                  const num = parseInt(a, 10);
                  return isNaN(num) ? 0 : num;
                });

              if (func.purity === 'sex') {
                output.push(`  📤 ${funcName}(${args.join(', ')}) → side effect`);
                for (const event of emittedEvents) {
                  output.push(`     ⚡ emit ${event}(${args.join(', ')})`);
                }
              }
            }
          }
        }

        // Check for return statement
        const returnMatch = mainBody.match(/return\s+(\w+)/);
        if (returnMatch) {
          const returnVar = returnMatch[1];
          const returnValue = variables.get(returnVar) ?? lastResult;
          output.push('');
          output.push(`✓ main() returned: ${returnValue}`);
        }
      }
    }
  }

  // If no specific output was generated, show a generic success
  if (output.length === 0) {
    output.push('▸ Code executed successfully');
    output.push('▸ No output (AST mode)');
  }

  return {
    success: true,
    output: output.join('\n'),
    executionTime: performance.now() - startTime,
  };
}
