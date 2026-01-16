// src/lib/spirit-runtime.ts
// SpiritRuntime: Execute real WASM modules in the browser

export interface Spirit {
  id: string;
  name: string;
  version: string;
  module: WebAssembly.Module;
  instance: WebAssembly.Instance;
  exports: SpiritExports;
  memory: WebAssembly.Memory;
  createdAt: number;
}

export interface SpiritExports {
  functions: Map<string, CallableFunction>;
  memory?: WebAssembly.Memory;
}

export interface SpiritConfig {
  memoryPages?: number; // Initial memory pages (64KB each)
  maxMemoryPages?: number; // Maximum memory pages
  timeout?: number; // Execution timeout in ms
}

export interface ExecutionContext {
  logs: string[];
  events: Array<{ name: string; data: unknown }>;
  startTime: number;
}

const DEFAULT_CONFIG: Required<SpiritConfig> = {
  memoryPages: 1,
  maxMemoryPages: 16,
  timeout: 5000,
};

export class SpiritRuntime {
  private spirits: Map<string, Spirit> = new Map();
  private config: Required<SpiritConfig>;
  private nextId = 1;

  constructor(config: SpiritConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Load a WASM module and create a Spirit instance
   */
  async loadWasm(wasm: Uint8Array, name?: string): Promise<Spirit> {
    const id = `spirit-${this.nextId++}`;
    const spiritName = name || id;

    // Create shared memory for the Spirit
    const memory = new WebAssembly.Memory({
      initial: this.config.memoryPages,
      maximum: this.config.maxMemoryPages,
    });

    // Execution context for capturing logs and events
    const context: ExecutionContext = {
      logs: [],
      events: [],
      startTime: performance.now(),
    };

    // Build import object with DOL runtime functions
    const imports = this.createImports(memory, context);

    try {
      // Create a clean ArrayBuffer copy for WebAssembly.compile
      const wasmBuffer = new ArrayBuffer(wasm.byteLength);
      new Uint8Array(wasmBuffer).set(wasm);

      // Compile and instantiate the WASM module
      const module = await WebAssembly.compile(wasmBuffer);
      const instance = await WebAssembly.instantiate(module, imports);

      // Extract exported functions
      const exports = this.extractExports(instance);

      const spirit: Spirit = {
        id,
        name: spiritName,
        version: '0.1.0',
        module,
        instance,
        exports,
        memory,
        createdAt: Date.now(),
      };

      this.spirits.set(id, spirit);
      return spirit;
    } catch (err) {
      throw new Error(
        `Failed to load Spirit: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  /**
   * Execute a function in a Spirit
   */
  execute(
    spirit: Spirit,
    functionName: string,
    args: unknown[] = []
  ): { result: unknown; logs: string[]; events: Array<{ name: string; data: unknown }> } {
    const fn = spirit.exports.functions.get(functionName);
    if (!fn) {
      throw new Error(`Function '${functionName}' not found in Spirit '${spirit.name}'`);
    }

    // Reset execution context
    const context: ExecutionContext = {
      logs: [],
      events: [],
      startTime: performance.now(),
    };

    // Update imports with fresh context
    const imports = this.createImports(spirit.memory, context);

    try {
      // Convert args to appropriate types for WASM
      const wasmArgs = args.map((arg) => {
        if (typeof arg === 'number') return arg;
        if (typeof arg === 'bigint') return arg;
        if (typeof arg === 'boolean') return arg ? 1 : 0;
        return arg;
      });

      const result = fn(...wasmArgs);

      return {
        result,
        logs: context.logs,
        events: context.events,
      };
    } catch (err) {
      throw new Error(
        `Execution error in ${functionName}: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  /**
   * Get a Spirit by ID
   */
  getSpirit(id: string): Spirit | undefined {
    return this.spirits.get(id);
  }

  /**
   * List all loaded Spirits
   */
  listSpirits(): Spirit[] {
    return Array.from(this.spirits.values());
  }

  /**
   * Unload a Spirit and free resources
   */
  unloadSpirit(id: string): boolean {
    return this.spirits.delete(id);
  }

  /**
   * Create WASM import object with DOL runtime functions
   */
  private createImports(
    memory: WebAssembly.Memory,
    context: ExecutionContext
  ): WebAssembly.Imports {
    return {
      env: {
        // Memory
        memory,

        // Console output for i64 values
        print_i64: (value: bigint) => {
          context.logs.push(String(value));
        },

        // Console output for i32 values
        print_i32: (value: number) => {
          context.logs.push(String(value));
        },

        // Console output for f64 values
        print_f64: (value: number) => {
          context.logs.push(String(value));
        },

        // String output (pointer + length)
        print_str: (ptr: number, len: number) => {
          const bytes = new Uint8Array(memory.buffer, ptr, len);
          const str = new TextDecoder().decode(bytes);
          context.logs.push(str);
        },

        // DOL emit statement handler
        emit_event: (
          namePtr: number,
          nameLen: number,
          dataPtr: number,
          dataLen: number
        ) => {
          const nameBytes = new Uint8Array(memory.buffer, namePtr, nameLen);
          const name = new TextDecoder().decode(nameBytes);

          let data: unknown = null;
          if (dataLen > 0) {
            const dataBytes = new Uint8Array(memory.buffer, dataPtr, dataLen);
            try {
              data = JSON.parse(new TextDecoder().decode(dataBytes));
            } catch {
              data = new TextDecoder().decode(dataBytes);
            }
          }

          context.events.push({ name, data });
        },

        // Simple emit with just event name and i64 value
        emit_i64: (namePtr: number, nameLen: number, value: bigint) => {
          const nameBytes = new Uint8Array(memory.buffer, namePtr, nameLen);
          const name = new TextDecoder().decode(nameBytes);
          context.events.push({ name, data: value });
        },

        // Memory allocation (simple bump allocator)
        alloc: (size: number): number => {
          // For now, return a fixed offset - real impl would track allocations
          return 1024 + size;
        },

        // Memory deallocation (no-op for simple allocator)
        dealloc: (_ptr: number, _size: number) => {
          // No-op
        },

        // Abort handler
        abort: (msgPtr: number, filePtr: number, line: number, column: number) => {
          const msg = msgPtr
            ? new TextDecoder().decode(new Uint8Array(memory.buffer, msgPtr, 256))
            : 'Unknown error';
          throw new Error(`WASM abort at ${line}:${column}: ${msg}`);
        },
      },

      // WASI preview for broader compatibility
      wasi_snapshot_preview1: {
        fd_write: (
          fd: number,
          iovs: number,
          iovsLen: number,
          nwritten: number
        ): number => {
          // Basic stdout/stderr handling
          if (fd === 1 || fd === 2) {
            const view = new DataView(memory.buffer);
            let written = 0;
            for (let i = 0; i < iovsLen; i++) {
              const ptr = view.getUint32(iovs + i * 8, true);
              const len = view.getUint32(iovs + i * 8 + 4, true);
              const bytes = new Uint8Array(memory.buffer, ptr, len);
              context.logs.push(new TextDecoder().decode(bytes));
              written += len;
            }
            view.setUint32(nwritten, written, true);
            return 0;
          }
          return 8; // EBADF
        },
        fd_close: (): number => 0,
        fd_seek: (): number => 0,
        fd_read: (): number => 0,
        environ_get: (): number => 0,
        environ_sizes_get: (): number => 0,
        proc_exit: (code: number) => {
          throw new Error(`Process exited with code ${code}`);
        },
        clock_time_get: (
          _id: number,
          _precision: bigint,
          timePtr: number
        ): number => {
          const view = new DataView(memory.buffer);
          view.setBigUint64(timePtr, BigInt(Date.now() * 1_000_000), true);
          return 0;
        },
        random_get: (bufPtr: number, bufLen: number): number => {
          const bytes = new Uint8Array(memory.buffer, bufPtr, bufLen);
          crypto.getRandomValues(bytes);
          return 0;
        },
      },
    };
  }

  /**
   * Extract exported functions from WASM instance
   */
  private extractExports(instance: WebAssembly.Instance): SpiritExports {
    const functions = new Map<string, CallableFunction>();

    for (const [name, value] of Object.entries(instance.exports)) {
      if (typeof value === 'function') {
        functions.set(name, value as CallableFunction);
      }
    }

    const memory = instance.exports.memory as WebAssembly.Memory | undefined;

    return { functions, memory };
  }
}

// Singleton runtime instance
let runtimeInstance: SpiritRuntime | null = null;

export function getSpiritRuntime(config?: SpiritConfig): SpiritRuntime {
  if (!runtimeInstance) {
    runtimeInstance = new SpiritRuntime(config);
  }
  return runtimeInstance;
}

export function resetSpiritRuntime(): void {
  runtimeInstance = null;
}
