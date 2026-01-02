// Type declarations for DOL WASM module
declare module '/wasm/dol_wasm.js' {
  export default function init(): Promise<void>;

  export function compile_dol(source: string): {
    bytecode: Uint8Array | null;
    messages: string[];
    ast?: object;
  };
}
