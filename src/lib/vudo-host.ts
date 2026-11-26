// src/lib/vudo-host.ts
//
// In-browser `vudo` WASM import module for DOL 0.8.2 host-calling Spirits.
//
// ABI source of truth: univrs-vudo `vudo/vudo_vm/src/linker.rs` (`create_linker`),
// mirrored by univrs-dol `src/wasm/host_abi.rs`. Module name, function names
// and WASM signatures below match it exactly. Like the VM linker, every error
// (capability denied, bad memory, bad parameter) is returned as -1, which is
// `error_codes::CAPABILITY_DENIED`.
//
// Browser behavior per function:
//   host_time_now            () -> i64                 ALLOWED: Unix time in ns
//   host_random_bytes        (ptr, len) -> i32         ALLOWED: crypto.getRandomValues
//   host_log                 (level, ptr, len) -> i32  ALLOWED: console + onLog sink
//   host_storage_read        (kp, kl, vp, vcap) -> i32 DENIED (-1): no storage capability
//   host_storage_write       (kp, kl, vp, vl) -> i32   DENIED (-1)
//   host_storage_delete      (kp, kl) -> i32           DENIED (-1)
//   host_network_connect     (ap, al) -> i64           DENIED (-1n): no sockets in a browser
//   host_network_listen      (port) -> i64             DENIED (-1n)
//   host_network_broadcast   (mp, ml) -> i64           DENIED (-1n): no peer mesh
//   host_credit_balance      (acct) -> i64             DENIED (-1n): no credit ledger
//   host_credit_transfer     (from, to, amt) -> i32    DENIED (-1)
//   host_credit_reserve      (acct, amt) -> i64        DENIED (-1n)
//   host_credit_release      (rid) -> i32              DENIED (-1)
//   host_credit_consume      (rid) -> i32              DENIED (-1)
//   host_credit_available    (acct) -> i64             DENIED (-1n)
//
// i64 values cross the JS boundary as BigInt.

export const VUDO_MODULE = 'vudo';

/** linker.rs `error_codes::CAPABILITY_DENIED` (also `HOST_ERROR`). */
export const CAPABILITY_DENIED = -1;

export const LOG_LEVELS = ['trace', 'debug', 'info', 'warn', 'error'] as const;
export type LogLevelName = (typeof LOG_LEVELS)[number];

export interface HostLogEntry {
  level: LogLevelName;
  message: string;
}

export interface HostCall {
  name: string;
  args: (number | bigint)[];
  result: number | bigint;
}

export interface VudoHostOptions {
  /** Receives each successful host_log message. Defaults to console only. */
  onLog?: (entry: HostLogEntry) => void;
}

export interface VudoHost {
  /** Pass as `{ vudo: host.imports }` in the WebAssembly import object. */
  imports: Record<string, (...args: any[]) => number | bigint>;
  /** Bind the instance's exported `memory` (required for pointer-taking fns). */
  bind(instance: WebAssembly.Instance): void;
  /** Every host call made, in order. */
  calls: HostCall[];
  logs: HostLogEntry[];
}

const MAX_RANDOM_CHUNK = 65536; // crypto.getRandomValues per-call limit

export function createVudoHost(options: VudoHostOptions = {}): VudoHost {
  let memory: WebAssembly.Memory | null = null;
  const calls: HostCall[] = [];
  const logs: HostLogEntry[] = [];

  /** Bounds-checked view into guest memory, as linker.rs `read_memory`. */
  function view(ptr: number, len: number): Uint8Array | null {
    if (!memory || ptr < 0 || len < 0) return null;
    const buf = new Uint8Array(memory.buffer);
    if (ptr + len > buf.length) return null;
    return buf.subarray(ptr, ptr + len);
  }

  function record<T extends number | bigint>(name: string, args: (number | bigint)[], result: T): T {
    calls.push({ name, args, result });
    return result;
  }

  const denied32 = (name: string) => (...args: (number | bigint)[]) =>
    record(name, args, CAPABILITY_DENIED);
  const denied64 = (name: string) => (...args: (number | bigint)[]) =>
    record(name, args, BigInt(CAPABILITY_DENIED));

  const imports: VudoHost['imports'] = {
    host_time_now: (): bigint => {
      const ns = BigInt(Math.round((performance.timeOrigin + performance.now()) * 1e6));
      return record('host_time_now', [], ns);
    },

    host_random_bytes: (ptr: number, len: number): number => {
      const args = [ptr, len];
      if (len <= 0) return record('host_random_bytes', args, CAPABILITY_DENIED);
      const out = view(ptr, len);
      if (!out) return record('host_random_bytes', args, CAPABILITY_DENIED);
      for (let i = 0; i < len; i += MAX_RANDOM_CHUNK) {
        crypto.getRandomValues(out.subarray(i, Math.min(i + MAX_RANDOM_CHUNK, len)));
      }
      return record('host_random_bytes', args, 0);
    },

    host_log: (level: number, ptr: number, len: number): number => {
      const args = [level, ptr, len];
      const name = LOG_LEVELS[level];
      const bytes = view(ptr, len);
      if (name === undefined || !bytes) return record('host_log', args, CAPABILITY_DENIED);
      let message: string;
      try {
        message = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
      } catch {
        return record('host_log', args, CAPABILITY_DENIED);
      }
      const entry = { level: name, message };
      logs.push(entry);
      const sink = name === 'trace' || name === 'debug' ? 'debug' : name;
      console[sink](`[Spirit] ${message}`);
      options.onLog?.(entry);
      return record('host_log', args, 0);
    },

    host_storage_read: denied32('host_storage_read'),
    host_storage_write: denied32('host_storage_write'),
    host_storage_delete: denied32('host_storage_delete'),

    host_network_connect: denied64('host_network_connect'),
    host_network_listen: denied64('host_network_listen'),
    host_network_broadcast: denied64('host_network_broadcast'),

    host_credit_balance: denied64('host_credit_balance'),
    host_credit_transfer: denied32('host_credit_transfer'),
    host_credit_reserve: denied64('host_credit_reserve'),
    host_credit_release: denied32('host_credit_release'),
    host_credit_consume: denied32('host_credit_consume'),
    host_credit_available: denied64('host_credit_available'),
  };

  return {
    imports,
    bind(instance) {
      const mem = instance.exports.memory;
      memory = mem instanceof WebAssembly.Memory ? mem : null;
    },
    calls,
    logs,
  };
}
