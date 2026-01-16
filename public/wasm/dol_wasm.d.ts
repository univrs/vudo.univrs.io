/* tslint:disable */
/* eslint-disable */

/**
 * Parse and validate DOL source code
 *
 * Returns both the AST and validation results (warnings for empty exegesis, etc.)
 */
export function compile_and_validate(source: string): any;

/**
 * Compile DOL source code to an AST
 *
 * This is the main entry point for the WASM module.
 * It parses the DOL source using metadol and returns a compilation result.
 */
export function compile_dol(source: string): any;

/**
 * Compile DOL source code to WebAssembly bytecode
 *
 * This function parses DOL source, then uses the WasmCompiler to emit
 * actual WASM bytecode that can be instantiated via the browser's WebAssembly API.
 *
 * # Example (JavaScript)
 *
 * ```javascript
 * const result = compile_to_wasm(dolSource);
 * if (result.success) {
 *     const wasmModule = await WebAssembly.compile(result.bytecode);
 *     const instance = await WebAssembly.instantiate(wasmModule);
 *     // Call exported functions...
 * }
 * ```
 */
export function compile_to_wasm(source: string): any;

/**
 * Compile DOL source to WASM bytecode and return as Uint8Array
 *
 * This is a convenience function that returns the raw bytecode directly
 * as a JavaScript Uint8Array, suitable for immediate use with WebAssembly.instantiate().
 *
 * # Example (JavaScript)
 *
 * ```javascript
 * try {
 *     const wasmBytes = compile_to_wasm_bytes(dolSource);
 *     const wasmModule = await WebAssembly.instantiate(wasmBytes);
 * } catch (err) {
 *     console.error("Compilation failed:", err);
 * }
 * ```
 */
export function compile_to_wasm_bytes(source: string): Uint8Array;

/**
 * Format DOL source code (stub for future implementation)
 */
export function format_dol(source: string): string;

/**
 * Get the version of the DOL compiler
 */
export function get_version(): string;

/**
 * Initialize panic hook for better error messages in browser console
 */
export function init(): void;

/**
 * Validate DOL source without full compilation
 * Returns true if the source is syntactically valid
 */
export function validate_dol(source: string): boolean;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly init: () => void;
  readonly compile_dol: (a: number, b: number) => [number, number, number];
  readonly compile_and_validate: (a: number, b: number) => [number, number, number];
  readonly get_version: () => [number, number];
  readonly validate_dol: (a: number, b: number) => number;
  readonly format_dol: (a: number, b: number) => [number, number];
  readonly compile_to_wasm: (a: number, b: number) => [number, number, number];
  readonly compile_to_wasm_bytes: (a: number, b: number) => [number, number, number, number];
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_externrefs: WebAssembly.Table;
  readonly __externref_table_dealloc: (a: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
