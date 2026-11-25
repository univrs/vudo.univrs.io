// Runs WASM against the in-browser `vudo` host module inside a Worker,
// the same way src/workers/compiler.worker.ts does.
import { createVudoHost, VUDO_MODULE } from '../../src/lib/vudo-host';
import spiritUrl from './fixtures/host_spirit.wasm?url';
import abiUrl from './fixtures/abi_all.wasm?url';

const str = (v: unknown) => String(v);

async function load(url: string) {
  const module = await WebAssembly.compile(await (await fetch(url)).arrayBuffer());
  const host = createVudoHost();
  const instance = await WebAssembly.instantiate(module, { [VUDO_MODULE]: host.imports });
  host.bind(instance);
  return { module, host, exports: instance.exports as Record<string, () => number | bigint> };
}

function run(exports: Record<string, () => number | bigint>) {
  const out: Record<string, string> = {};
  for (const [name, fn] of Object.entries(exports)) {
    if (typeof fn !== 'function') continue;
    try {
      out[name] = str(fn());
    } catch (e) {
      out[name] = `THROW: ${e instanceof Error ? e.message : e}`;
    }
  }
  return out;
}

self.onmessage = async () => {
  try {
    // 1. A dol 0.8.2-compiled host-calling Spirit.
    const spirit = await load(spiritUrl);
    const spiritResults = run(
      Object.fromEntries(['greet', 'now', 'persist', 'shout'].map((n) => [n, spirit.exports[n]])),
    );

    // 2. ABI conformance: all 15 imports with the VM linker's exact signatures.
    const abi = await load(abiUrl);
    const abiResults = run(abi.exports);

    self.postMessage({
      ok: true,
      hostImportNames: Object.keys(spirit.host.imports),
      spiritImports: WebAssembly.Module.imports(spirit.module),
      spirit: spiritResults,
      spiritLogs: spirit.host.logs,
      spiritCalls: spirit.host.calls.map((c) => ({ name: c.name, result: str(c.result) })),
      abi: abiResults,
      abiLogs: abi.host.logs,
    });
  } catch (e) {
    self.postMessage({ ok: false, error: e instanceof Error ? e.message : String(e) });
  }
};
