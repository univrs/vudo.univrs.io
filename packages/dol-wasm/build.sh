#!/bin/bash
# DOL-WASM Build Script
# Compiles the Rust WASM module using wasm-pack

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
OUT_DIR="$PROJECT_ROOT/public/wasm"

echo "================================"
echo "DOL-WASM Build Script"
echo "================================"
echo ""
echo "Script directory: $SCRIPT_DIR"
echo "Project root: $PROJECT_ROOT"
echo "Output directory: $OUT_DIR"
echo ""

# Check if wasm-pack is installed
if ! command -v wasm-pack &> /dev/null; then
    echo "Error: wasm-pack is not installed."
    echo "Install it with: cargo install wasm-pack"
    echo "Or visit: https://rustwasm.github.io/wasm-pack/installer/"
    exit 1
fi

# Check if Rust is installed
if ! command -v rustc &> /dev/null; then
    echo "Error: Rust is not installed."
    echo "Install it from: https://rustup.rs/"
    exit 1
fi

# Create output directory if it doesn't exist
mkdir -p "$OUT_DIR"

echo "Building dol-wasm..."
echo ""

# Build the WASM module
cd "$SCRIPT_DIR"
wasm-pack build --target web --out-dir "$OUT_DIR"

echo ""
echo "================================"
echo "Build complete!"
echo "================================"
echo ""
echo "Output files:"
ls -la "$OUT_DIR"
echo ""
echo "You can now import the WASM module in your JavaScript/TypeScript code:"
echo ""
echo "  import init, { compile_dol, validate_dol, get_version } from '/wasm/dol_wasm.js';"
echo ""
echo "  async function main() {"
echo "    await init();"
echo "    console.log('DOL Compiler', get_version()); // v0.7.0"
echo "    const result = compile_dol('gen Counter { has value: i32  fun get() -> i32 { return self.value } }');"
echo "    console.log(result);"
echo "  }"
echo ""
