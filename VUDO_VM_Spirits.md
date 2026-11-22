# Phase 2 Progress: VUDO VM & Spirits

> **Historical snapshot (2025-12-25) — superseded.** The host-function table below is out of date.
> The real VUDO VM host ABI is the 15 functions in the `vudo` import module registered by
> `univrs-vudo/vudo/vudo_vm/src/linker.rs`: `host_log`, `host_time_now`, `host_random_bytes`,
> `host_storage_read`, `host_storage_write`, `host_storage_delete`, `host_credit_balance`,
> `host_credit_available`, `host_credit_reserve`, `host_credit_consume`, `host_credit_release`,
> `host_credit_transfer`, `host_network_connect`, `host_network_listen`, `host_network_broadcast`.
> DOL 0.8.2 compiles `sex fun` declarations against exactly these imports.

> **Date:** December 25, 2025  
> **Status:** In Progress  
> **Repository:** `~/repos/univrs-vudo/`

---

## Phase 2 Implementation Status

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                          PHASE 2: VUDO VM & SPIRITS                          ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  vudo_vm Crate           ██████████████████████████████  100% ✅             ║
║  Sandbox, Capabilities, Fuel, Limits, Host Functions                         ║
║                                                                              ║
║  spirit_runtime Crate    ██████████████████████████████  100% ✅             ║
║  Manifest, Version, Dependency, Pricing                                      ║
║                                                                              ║
║  vudo_cli Crate          ████████░░░░░░░░░░░░░░░░░░░░░░   25% 🔄             ║
║  Basic scaffolding (commands TBD)                                            ║
║                                                                              ║
║  Integration Tests       ████████████░░░░░░░░░░░░░░░░░░   40% 🔄             ║
║  integration_tests.rs, spirit_tests.rs                                       ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## Completed: vudo_vm Crate ✅

**Location:** `~/repos/univrs-vudo/vudo/vudo_vm/`

### Core Modules

| File | Purpose | Status |
|------|---------|--------|
| `src/lib.rs` | Crate root, exports | ✅ |
| `src/sandbox.rs` | Core Sandbox struct, lifecycle | ✅ |
| `src/capability.rs` | Capability types & grants | ✅ |
| `src/fuel.rs` | Fuel management | ✅ |
| `src/limits.rs` | Resource limits | ✅ |
| `src/error.rs` | Error types | ✅ |

### Sandbox Lifecycle

```
┌──────────────┐     ┌─────────┐     ┌─────────┐
│ Initializing │ ──► │  Ready  │ ──► │ Running │
└──────────────┘     └─────────┘     └────┬────┘
                                          │
                     ┌─────────┐          │
                     │ Paused  │ ◄────────┤
                     └────┬────┘          │
                          │               │
                     ┌────▼────┐     ┌────▼──────┐
                     │Terminated│    │  Failed   │
                     └─────────┘     └───────────┘
```

### Capability Types

| Capability | Description |
|------------|-------------|
| `Network` | Network access |
| `Storage` | Persistent storage |
| `Compute` | CPU/memory allocation |
| `Sensor` | Input device access |
| `Actuator` | Output device access |

### Host Functions

| File | Functions | Purpose |
|------|-----------|---------|
| `src/host/time.rs` | `host_time_now()`, `host_time_sleep()` | Time operations |
| `src/host/random.rs` | `host_random_bytes()`, `host_random_u64()` | Randomness |
| `src/host/log.rs` | `host_log_info()`, `host_log_error()` | Logging |
| `src/host/storage.rs` | `host_storage_get()`, `host_storage_set()` | Key-value storage |
| `src/host/network.rs` | `host_network_fetch()` | HTTP requests |
| `src/host/credit.rs` | `host_credit_balance()`, `host_credit_transfer()` | Mycelial credits |

### Resource Limits (ResourceLimits struct)

```rust
pub struct ResourceLimits {
    pub max_memory_bytes: u64,      // Memory limit
    pub max_cpu_quota_percent: u8,  // CPU percentage
    pub max_fuel: u64,              // Execution fuel
    pub max_duration_ms: u64,       // Time limit
}
```

---

## Completed: spirit_runtime Crate ✅

**Location:** `~/repos/univrs-vudo/vudo/spirit_runtime/`

### Core Modules

| File | Purpose | Status |
|------|---------|--------|
| `src/lib.rs` | Crate root, exports | ✅ |
| `src/manifest.rs` | TOML manifest parsing | ✅ |
| `src/version.rs` | Semantic versioning | ✅ |
| `src/dependency.rs` | Dependency resolution | ✅ |
| `src/pricing.rs` | Credit pricing models | ✅ |

### Manifest Format (manifest.toml)

```toml
[spirit]
name = "hello-world"
version = "1.0.0"
description = "A simple greeting Spirit"
author = "creator@example.com"

[capabilities]
required = ["log"]
optional = ["network"]

[dependencies]
utils = "^1.0.0"

[pricing]
model = "per-invocation"
base_cost = 10
```

### Version Requirements

| Syntax | Meaning |
|--------|---------|
| `^1.0.0` | Compatible with 1.x.x |
| `~1.0.0` | Patch updates only (1.0.x) |
| `>=1.0.0` | At least 1.0.0 |
| `1.0.0` | Exact version |

### Pricing Models

| Model | Description |
|-------|-------------|
| `Free` | No cost |
| `PerInvocation` | Cost per call |
| `PerSecond` | Cost per execution time |
| `Subscription` | Monthly/periodic fee |

---

## In Progress: vudo_cli Crate 🔄

**Location:** `~/repos/univrs-vudo/vudo/vudo_cli/`

### Planned Commands

| Command | Description | Status |
|---------|-------------|--------|
| `vudo new <name>` | Create new Spirit project | 📋 |
| `vudo build` | Compile DOL → WASM | 📋 |
| `vudo pack` | Create .spirit package | 📋 |
| `vudo sign` | Sign with Ed25519 | 📋 |
| `vudo verify` | Verify signature | 📋 |
| `vudo run <spirit>` | Execute in sandbox | 📋 |
| `vudo publish` | Publish to registry | 📋 |

---

## Tests Created

| File | Coverage |
|------|----------|
| `vudo_vm/tests/integration_tests.rs` | Sandbox lifecycle, capability checks |
| `vudo_vm/tests/spirit_tests.rs` | Spirit loading, execution |

---

## Repository Structure

```
~/repos/univrs-vudo/
├── Cargo.toml                    # Workspace manifest
├── vudo/
│   ├── vudo_vm/                  # ✅ COMPLETE
│   │   ├── Cargo.toml
│   │   ├── src/
│   │   │   ├── lib.rs
│   │   │   ├── sandbox.rs        # Core sandbox
│   │   │   ├── capability.rs     # Capability system
│   │   │   ├── fuel.rs           # Fuel metering
│   │   │   ├── limits.rs         # Resource limits
│   │   │   ├── error.rs          # Error types
│   │   │   └── host/
│   │   │       ├── mod.rs
│   │   │       ├── time.rs
│   │   │       ├── random.rs
│   │   │       ├── log.rs
│   │   │       ├── storage.rs
│   │   │       ├── network.rs
│   │   │       └── credit.rs
│   │   └── tests/
│   │       ├── integration_tests.rs
│   │       └── spirit_tests.rs
│   │
│   ├── spirit_runtime/           # ✅ COMPLETE
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── lib.rs
│   │       ├── manifest.rs       # TOML parsing
│   │       ├── version.rs        # SemVer
│   │       ├── dependency.rs     # Dep resolution
│   │       └── pricing.rs        # Credit pricing
│   │
│   └── vudo_cli/                 # 🔄 IN PROGRESS
│       ├── Cargo.toml
│       └── src/
│           └── main.rs
```

---

## Alignment with DOL Ontology

| DOL Specification | Rust Implementation | Status |
|-------------------|---------------------|--------|
| `vudo-vm/genes/sandbox.dol` | `vudo_vm/src/sandbox.rs` | ✅ |
| `vudo-vm/genes/capability.dol` | `vudo_vm/src/capability.rs` | ✅ |
| `vudo-vm/traits/execution.dol` | `vudo_vm/src/host/*.rs` | ⚠️ design sketch — its host functions do not match the real linker ABI |
| `spirits/genes/manifest.dol` | `spirit_runtime/src/manifest.rs` | ✅ |
| `spirits/systems/registry.dol` | `spirit_runtime/src/registry/` | 📋 |

---

## Next Steps

### Immediate (This Week)

1. **Complete vudo_cli commands**
   ```bash
   cd ~/repos/univrs-vudo
   # Implement: vudo new, vudo build, vudo run
   ```

2. **Add local registry**
   ```rust
   // spirit_runtime/src/registry/local.rs
   pub struct LocalRegistry {
       spirits_dir: PathBuf,
       index: HashMap<String, SpiritMetadata>,
   }
   ```

3. **Create test Spirits**
   ```bash
   vudo new hello-world
   vudo new counter
   vudo new echo
   ```

### This Phase (Complete Phase 2)

- [ ] All CLI commands working
- [ ] Local registry functional
- [ ] 3 test Spirits running
- [ ] Integration tests passing
- [ ] Documentation complete

### Next Phase (Phase 3)

- [ ] Hyphal Network (P2P)
- [ ] Mycelial Economics (Credits)
- [ ] Distributed registry

---

## Build & Test

```bash
cd ~/repos/univrs-vudo

# Build all crates
cargo build

# Run tests
cargo test

# Check for warnings
cargo clippy -- -D warnings

# Format
cargo fmt
```

---

## Summary

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║   PHASE 2 PROGRESS                                                        ║
║                                                                           ║
║   ┌─────────────────────────────────────────────────────────────────┐    ║
║   │  vudo_vm         ████████████████████████████████  ✅ Complete │    ║
║   │  spirit_runtime  ████████████████████████████████  ✅ Complete │    ║
║   │  vudo_cli        ████████░░░░░░░░░░░░░░░░░░░░░░░░  🔄 25%      │    ║
║   │  Tests           ████████████░░░░░░░░░░░░░░░░░░░░  🔄 40%      │    ║
║   └─────────────────────────────────────────────────────────────────┘    ║
║                                                                           ║
║   Core sandbox execution: READY                                           ║
║   Spirit packaging: READY                                                 ║
║   CLI tooling: IN PROGRESS                                                ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

*"Le réseau est Bondieu"*

*Imagine. Summon. Create.*
