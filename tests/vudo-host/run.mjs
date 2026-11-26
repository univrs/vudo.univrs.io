// Playwright check for the in-browser `vudo` host module.
//   NODE_PATH=/home/ardeshir/repos/tools/playwright/node_modules node tests/vudo-host/run.mjs
// Starts Vite in-process, opens harness.html in Chromium, asserts results.
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright'); // resolved via NODE_PATH

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

// Canonical ABI: univrs-vudo vudo/vudo_vm/src/linker.rs (create_linker).
const CANONICAL = [
  'host_time_now', 'host_random_bytes', 'host_log',
  'host_storage_read', 'host_storage_write', 'host_storage_delete',
  'host_network_connect', 'host_network_listen', 'host_network_broadcast',
  'host_credit_balance', 'host_credit_transfer', 'host_credit_reserve',
  'host_credit_release', 'host_credit_consume', 'host_credit_available',
];
const DENIED = CANONICAL.filter((n) => /storage|network|credit/.test(n));

const server = await createServer({ root, logLevel: 'error', server: { port: 0 } });
await server.listen();
const url = server.resolvedUrls.local[0];
const browser = await chromium.launch();
let failed = false;
try {
  const page = await browser.newPage();
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));
  page.on('console', (m) => console.log(`  [browser:${m.type()}] ${m.text()}`));
  await page.goto(new URL('tests/vudo-host/harness.html', url).href);
  await page.waitForFunction(() => window.__vudoHostResult, null, { timeout: 30000 });
  const r = await page.evaluate(() => window.__vudoHostResult);

  const check = (name, fn) => {
    try { fn(); console.log(`ok   ${name}`); }
    catch (e) { failed = true; console.log(`FAIL ${name}\n     ${e.message}`); }
  };

  check('harness ran', () => assert.equal(r.ok, true, r.error));
  check('host exposes exactly the 15 canonical vudo fns', () =>
    assert.deepEqual([...r.hostImportNames].sort(), [...CANONICAL].sort()));
  check('Spirit imports only from module "vudo"', () => {
    assert.ok(r.spiritImports.length > 0);
    for (const i of r.spiritImports) assert.equal(i.module, 'vudo');
  });
  check('Spirit greet() -> host_log succeeds (0)', () => assert.equal(r.spirit.greet, '0'));
  check('host_log observed with level info + message', () =>
    assert.deepEqual(r.spiritLogs, [{ level: 'info', message: 'Hello from a 0.8.2 Spirit' }]));
  check('Spirit now() -> host_time_now is current Unix ns', () => {
    const drift = BigInt(r.spirit.now) - BigInt(Date.now()) * 1000000n;
    assert.ok(drift > -60_000_000_000n && drift < 60_000_000_000n, `drift ${drift}ns`);
  });
  check('Spirit persist() -> host_storage_write denied (-1)', () => assert.equal(r.spirit.persist, '-1'));
  check('Spirit shout() -> host_network_broadcast denied (-1)', () => assert.equal(r.spirit.shout, '-1'));

  check('ABI module: no signature/type errors at the boundary', () => {
    for (const [k, v] of Object.entries(r.abi)) assert.ok(!v.startsWith('THROW'), `${k}: ${v}`);
  });
  check('ABI: allowed fns succeed', () => {
    assert.ok(BigInt(r.abi.host_time_now) > 0n);
    assert.equal(r.abi.host_random_bytes, '0');
    assert.equal(r.abi.host_log, '0');
    assert.deepEqual(r.abiLogs, [{ level: 'info', message: 'abi-ok' }]);
  });
  check('ABI: invalid log level / out-of-bounds memory -> -1', () => {
    assert.equal(r.abi.host_log_bad_level, '-1');
    assert.equal(r.abi.host_log_oob, '-1');
  });
  check('ABI: all 12 browser-unsupported fns return CAPABILITY_DENIED (-1)', () => {
    assert.equal(DENIED.length, 12);
    for (const n of DENIED) assert.equal(r.abi[n], '-1', n);
  });
  check('no page errors', () => assert.deepEqual(pageErrors, []));
} finally {
  await browser.close();
  await server.close();
}
console.log(failed ? '\nFAILED' : '\nALL PASSED');
process.exit(failed ? 1 : 0);
