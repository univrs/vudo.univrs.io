// Compile fixtures/host_spirit.dol -> fixtures/host_spirit.wasm with dol 0.8.2.
//
// Requires a Node-target build of packages/dol-wasm (path dep on ../univrs-dol):
//   wasm-pack build packages/dol-wasm --target nodejs --out-dir <repo>/tmp/dol-wasm-node
// Then: node tests/vudo-host/build-fixture.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const dol = require(join(here, '../../tmp/dol-wasm-node/dol_wasm.js'));

const source = readFileSync(join(here, 'fixtures/host_spirit.dol'), 'utf8');
const result = dol.compile_to_wasm(source);
if (!result.success) {
  console.error('compile_to_wasm failed:', result.error);
  process.exit(1);
}
const out = join(here, 'fixtures/host_spirit.wasm');
writeFileSync(out, Uint8Array.from(result.bytecode));
// get_version() is the dol-wasm crate version, not the linked dol compiler's.
console.log(`dol-wasm ${dol.get_version()} -> ${out} (${result.bytecode.length} bytes)`);
