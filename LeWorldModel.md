# LeWorldModel × VUDO/DOL × Imaginarium

> **A Comprehensive Integration Analysis**
> **Source paper:** Maes, Le Lidec, Scieur, LeCun, Balestriero — *LeWorldModel: Stable End-to-End Joint-Embedding Predictive Architecture from Pixels* (arXiv:2603.19312, 2026)
> **Target system:** Univrs VUDO runtime, DOL ontology, Imaginarium creator marketplace
> **Status:** Strategic research note — Phase 4/5 candidate capability
> **Philosophy:** “Imagination becomes scarce because the world model is shared.”

-----

## Table of Contents

1. [Executive Summary](#1-executive-summary)
1. [What LeWM Actually Is (And Why It Matters)](#2-what-lewm-actually-is-and-why-it-matters)
1. [Why LeWM Specifically Fits VUDO (Not Just Any World Model)](#3-why-lewm-specifically-fits-vudo-not-just-any-world-model)
1. [The Core Insight: A World Model Is a Spirit](#4-the-core-insight-a-world-model-is-a-spirit)
1. [Architectural Integration Map](#5-architectural-integration-map)
1. [DOL Surface: Modeling LeWM in Ontology-First Code](#6-dol-surface-modeling-lewm-in-ontology-first-code)
1. [VUDO Runtime Integration: WASM, Capabilities, Hosts](#7-vudo-runtime-integration-wasm-capabilities-hosts)
1. [Imaginarium Marketplace: Pricing, Attribution, Forking](#8-imaginarium-marketplace-pricing-attribution-forking)
1. [P2P / ENR Considerations: Federated World Models](#9-p2p--enr-considerations-federated-world-models)
1. [Phase Alignment: Where This Goes In The Roadmap](#10-phase-alignment-where-this-goes-in-the-roadmap)
1. [Risks, Honest Caveats, And Open Questions](#11-risks-honest-caveats-and-open-questions)
1. [Concrete Next Actions](#12-concrete-next-actions)

-----

## 1. Executive Summary

LeWorldModel (LeWM) is a Joint-Embedding Predictive Architecture (JEPA) variant from Maes, Le Lidec, Scieur, LeCun, and Balestriero (2026) that learns a stable world model end-to-end from raw pixels with only two loss terms — a next-embedding prediction loss and an isotropic-Gaussian regularizer on latent embeddings. It runs at ~15M parameters, trains in hours on a single GPU, and plans up to 48× faster than foundation-model-based world models while remaining competitive on 2D and 3D control tasks. The latent space provably encodes physical structure: probes recover position, velocity, and pose from frozen embeddings.

For Univrs, the relevance is not “we should ship a robotics demo.” The relevance is structural. LeWM is the smallest, simplest, most stable known recipe for compressing observation streams into a planning-ready latent — and *that latent* is exactly the kind of artifact the Imaginarium needs to make trade-able. A world model is a Spirit: it has authorship, it has a content hash, it has a pricing model, it gets forked, it composes with others. LeWM’s tractability (single GPU, two losses, sub-second planning) means a creator can actually train and publish one without enterprise infrastructure — which is the only way the marketplace works.

This document proposes:

1. A new DOL primitive — `world_model { ... }` — that compiles to a standardized WASM interface with embed / predict / plan host functions.
1. A VUDO runtime extension (`vudo-wm`) wrapping LeWM-style models behind a capability-gated sandbox.
1. An Imaginarium category — *Cogitos* (a sub-type of Spirit) — with pricing modeled on the latent’s information content (entropy of the embedding distribution), tying the economic model to the paper’s Gaussian regularizer in a non-trivially elegant way.
1. A Phase 4.5 insertion — between Imaginarium MVP and Social Polish — to ship one reference Cogito and prove the loop closes: train → publish → fork → earn.

The honest caveat up front: LeWM was demonstrated on offline trajectories from continuous-control environments. Generalizing it to “the world model of a creator’s app domain” is a research bet, not a deployment bet. We should treat this as a Phase 5+ R&D track that informs Phase 4 architecture choices, not a critical path item.

-----

## 2. What LeWM Actually Is (And Why It Matters)

### The technical claim

LeWM is the first JEPA that trains stably end-to-end from raw pixels using only two loss terms: a next-embedding prediction loss and a regularizer enforcing Gaussian-distributed latent embeddings. This reduces tunable loss hyperparameters from six to one compared to the only existing end-to-end alternative.

The architecture is two components:

- **Encoder** `E: o_t → z_t` — maps a frame to a compact latent.
- **Predictor** `P: (z_t, a_t) → ẑ_{t+1}` — predicts the next latent given an action.

Training is offline and reward-free — it learns from unannotated `(observation, action)` trajectories with no task labels. Planning is done at inference time via Model Predictive Control (MPC): roll the predictor forward in latent space, score against a goal embedding, optimize the action sequence.

### Why prior JEPAs were fragile and why this matters operationally

Prior end-to-end JEPAs needed exponential moving averages, pre-trained encoders, multi-term losses, or auxiliary supervision — and even with those tricks, training was unstable. LeWM removes the tricks. The Gaussian regularizer (from the LeJEPA line of work) is the entire stabilization story.

Why this matters for VUDO is simple: **fragile training pipelines cannot be a creator economy primitive.** If publishing a world model requires a cluster, a baby-sitter, and a PhD in self-supervised learning to keep the loss from collapsing, no creator will publish one. LeWM’s “two losses, one GPU, a few hours” budget is the threshold below which a Spirit-publishing creator can plausibly own the full lifecycle of their model.

### The 48× planning speedup

LeWM plans up to 48× faster than foundation-model-based world models, with full planning under one second on commodity hardware. This is the difference between a Cogito being a real-time interactive primitive (usable inside a Spirit’s render loop) versus a batch-mode oracle (usable only for offline analysis). For a marketplace where Spirits are summoned and executed on demand, real-time is the only viable mode.

### Latent structure is physically meaningful

Probes trained on frozen LeWM embeddings recover physical quantities — agent position, block position and velocity, end-effector pose — competitively with DINOv2 (which was trained on 124M images versus LeWM’s much smaller offline trajectory budget). LeWM consistently outperforms PLDM and approaches DINOv2 on most metrics. This matters for the Imaginarium because **interpretable latents are forkable latents**. A creator who buys a Cogito and wants to fine-tune it for their domain needs to know what the dimensions mean. Gaussian-regularized latents with linear-probe-recoverable structure are far more legible than the entangled representations typical of unconstrained autoencoders.

-----

## 3. Why LeWM Specifically Fits VUDO (Not Just Any World Model)

It would be easy to say “VUDO should support world models” and then list any architecture. The argument here is sharper: LeWM’s specific properties match VUDO’s specific constraints in ways most alternatives do not.

|VUDO constraint                                          |LeWM property that satisfies it                                                                                               |
|---------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------|
|Spirits compile to WASM and run sandboxed                |15M params is small enough to ship as a `.wasm` weight blob in a Spirit package                                               |
|Creators publish without enterprise infra                |Single GPU, hours of training, no pre-trained encoder dependency                                                              |
|Imaginarium needs deterministic content hashing          |Two-loss training is reproducible; same data + same seed = same weights = same hash                                           |
|Forking with attribution requires interpretable structure|Gaussian-regularized latents support linear probes — fork-and-fine-tune is a tractable operation                              |
|Pricing must reflect information content                 |The Gaussian regularizer literally optimizes the embedding distribution toward a known prior; entropy is computable and stable|
|P2P execution must work without phoning home             |Reward-free, offline-trained inference — no telemetry, no central API, no third-party encoder                                 |
|Real-time interaction inside a séance                    |Sub-second planning at 48× speedup over foundation-model alternatives                                                         |
|User sovereignty over data                               |Trains on local trajectories; no cloud round-trip for inference                                                               |

Compare this to a foundation-model approach (DINOv2 + diffusion world model, or anything Gemini/Claude-shaped): you get bigger weights, a closed encoder you can’t truly own, training costs that exclude individual creators, and inference latencies that break the interactive contract. LeWM is not just “an option.” It’s arguably the only option that doesn’t break a core VUDO imperative.

-----

## 4. The Core Insight: A World Model Is a Spirit

This is the conceptual leap that justifies the entire integration. Stay with me.

A Spirit, in the existing VUDO taxonomy, is a published, installable WASM artifact with a DOL manifest, an authorship chain, capability requirements, and a pricing model. The current mental model assumes Spirits are *applications* — tools, games, utilities, automations.

A LeWM-style world model satisfies every property of a Spirit:

- **It is a compiled WASM artifact** (encoder + predictor weights + a thin runtime wrapper).
- **It has an author** (whoever trained it on what data).
- **It has a content hash** (deterministic given training data and seed).
- **It has capability requirements** (compute budget, optionally GPU access via wgpu).
- **It has a pricing model** (per-summon, per-prediction, or per-embed).
- **It can be forked with attribution** (fine-tune on new data, the lineage chain records the parent).
- **It composes with other Spirits** (a game Spirit imports a physics Cogito as a dependency).

The biological taxonomy already has a slot for this. World models are not application Spirits — they are something more like the *substrate* on which application Spirits operate. I propose calling them **Cogitos** (a Cogito being a Spirit whose function is to *think* about the world rather than act in it). This fits the existing vocabulary: a Spirit *summons* a Cogito to ground its predictions, the way a Loa might consult a Veve.

The economic consequence is significant. Right now the Imaginarium’s value flow is:

```
Creator writes Spirit → User summons → Creator earns credits per summon
```

With Cogitos in the picture, the flow becomes layered:

```
Researcher trains Cogito  ───┐
                              ├──► Creator builds Spirit on top  ───► User summons
Data contributor licenses ───┘                                          │
                                                                        ▼
                                            Revenue splits flow up the lineage chain
```

Now the Imaginarium isn’t just a tool marketplace. It’s a marketplace for *latent representations of reality*. That is the actual Imaginarium thesis — “where human imagination becomes the scarce resource” — operationalized. The scarce resource isn’t the WASM bytecode; it’s the trained understanding of a domain.

-----

## 5. Architectural Integration Map

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                          IMAGINARIUM MARKETPLACE                             │
│                                                                              │
│   ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐         │
│   │ Application     │   │ Cogitos         │   │ Datasets        │         │
│   │ Spirits         │◄──│ (LeWM models)   │◄──│ (Trajectories)  │         │
│   │ (games, tools)  │   │ encoder+predict │   │ (.h5 / hyphal)  │         │
│   └────────┬────────┘   └────────┬────────┘   └────────┬────────┘         │
│            │                     │                     │                    │
│            │   Attribution chain flows up: data → cogito → spirit          │
│            │   Revenue splits flow down on each summon                     │
└────────────┼─────────────────────┼─────────────────────┼────────────────────┘
             │                     │                     │
             ▼                     ▼                     ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                              VUDO RUNTIME                                    │
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────────┐      │
│   │  Spirit WASM (sandboxed, capability-gated)                       │      │
│   │                                                                   │      │
│   │     calls into ──►  host fn: cogito_embed(observation) → z       │      │
│   │                     host fn: cogito_predict(z, action) → z'      │      │
│   │                     host fn: cogito_plan(z, goal, horizon) → a*  │      │
│   └──────────────────────────────────────────────────────────────────┘      │
│                                  │                                           │
│                                  ▼                                           │
│   ┌──────────────────────────────────────────────────────────────────┐      │
│   │  vudo-wm crate (NEW)                                             │      │
│   │  • LeWM encoder/predictor inference (candle or burn backend)     │      │
│   │  • MPC planner (CMA-ES or CEM in latent space)                   │      │
│   │  • Cogito loader: hash-verifies weights, sets up wasmtime        │      │
│   │  • Optional wgpu acceleration for the encoder                    │      │
│   └──────────────────────────────────────────────────────────────────┘      │
│                                  │                                           │
│                                  ▼                                           │
│   ┌──────────────────────────────────────────────────────────────────┐      │
│   │  ENR / Network layer                                             │      │
│   │  • Cogito weights distributed via IPFS (large blobs, content     │      │
│   │    addressed, deduplicates across forks)                         │      │
│   │  • Embedding-as-a-service possible: gradient-routed to nodes     │      │
│   │    with GPU resources, billed via credit ledger                  │      │
│   └──────────────────────────────────────────────────────────────────┘      │
└──────────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                              DOL COMPILER                                    │
│                                                                              │
│   New primitive:  world_model { encoder { ... } predictor { ... } }          │
│   New gene type:  Latent<dim>      (Gaussian-regularized embedding)          │
│   New trait:      WorldModel       (embed/predict/plan contract)             │
│   Compiles to:    Cogito.wasm + Cogito.dol manifest + weights.bin            │
└──────────────────────────────────────────────────────────────────────────────┘
```

Three new units of work:

1. **DOL primitive** — `world_model` block with strong typing for latents and physical quantities.
1. **`vudo-wm` crate** — a new repo under `github.com/univrs/vudo-wm` that does inference and planning.
1. **Imaginarium schema extension** — a `cogito` category with extra metadata fields (latent_dim, training_data_hash, probe_results).

-----

## 6. DOL Surface: Modeling LeWM in Ontology-First Code

The Strategic Imperative says every component should have a DOL spec written first. Here’s what one looks like for a Cogito.

```dol
// cogito-physics-2d.dol

spirit PhysicsCogito2D {
    name: "physics-cogito-2d"
    version: "0.1.0"
    kind: cogito                      // NEW kind, sibling to "tool", "game", etc.

    author: {
        name: "Univrs Research"
        account: "ed25519:..."
    }

    pricing: {
        embed:   1 credit_per_call    // host call: observation → latent
        predict: 1 credit_per_call    // host call: (latent, action) → latent
        plan:    10 credits_per_call  // host call: full MPC rollout
    }

    exegesis {
        A 2D physics world model trained on the BlockPushing dataset.
        Latent dimension: 32. Trained for 4 hours on a single A100.
        Linear probes recover agent position (R² = 0.94) and block
        velocity (R² = 0.87).
    }
}

// The world_model declaration is the new DOL primitive.
world_model PhysicsCogito2D {

    // The encoder gene formalizes the latent space contract.
    gene Latent {
        dim: 32
        distribution: Gaussian(mean: 0.0, covariance: identity)
        // The Gaussian constraint compiles into the regularization term.
        // The runtime can verify a sampled batch satisfies it (KS test).
    }

    encoder {
        input:  Image(channels: 3, height: 64, width: 64)
        output: Latent
        // architecture left to the implementation; this is contract-only.
    }

    predictor {
        input:  (Latent, Action(dim: 4))
        output: Latent
        // contract: temporal consistency, single-step prediction.
    }

    // Traits express what the model promises about reality.
    trait PhysicallyGrounded {
        law preserves_position: probe(latent, "position").r_squared > 0.85
        law preserves_velocity: probe(latent, "velocity").r_squared > 0.80
        // Laws are checked at publish time against the training trajectories.
        // A Cogito that fails its own laws cannot be published.
    }

    fun plan(start: Latent, goal: Latent, horizon: u32) -> Vec<Action> {
        // MPC in latent space; implementation in vudo-wm.
        // The DOL signature is the Imaginarium-visible contract.
    }
}
```

A few things to notice about this design:

- **The Gaussian constraint is first-class.** The paper’s regularizer is not an implementation detail — it’s a property the latent gene *promises*, and the runtime can verify. This is ontology-first: the constraint is part of the type.
- **Laws are testable invariants.** Linear-probe recoverability is a property of the trained weights. Encoding it as a DOL law means a publisher can’t ship a Cogito that doesn’t actually do what it claims.
- **Pricing is per-host-call.** Embedding once is cheap; planning a full horizon is expensive. The pricing model directly reflects compute cost, which makes credit flow legible and prevents abuse.
- **The `kind: cogito` field** is a marketplace-level discriminator. Imaginarium UI can filter by it; pricing models can vary by kind; capability requirements are templated by kind.

This integrates cleanly with DOL’s existing multi-target compilation. The same `world_model` block can compile to (a) a WASM Spirit package, (b) a Rust trait for native runtimes, (c) a TypeScript type definition for editor tooling, and (d) a JSON schema for the Imaginarium registry — exactly what DOL already does for genes and traits.

-----

## 7. VUDO Runtime Integration: WASM, Capabilities, Hosts

The VUDO VM is wasmtime-based with capability-gated host functions. Adding Cogito support is a host function extension and a new sandbox category, not a redesign.

### Host function surface

```rust
// vudo-wm/src/host.rs (new crate)

pub trait CogitoHost {
    /// Encode an observation tensor into the model's latent space.
    /// Capability required: cogito.embed
    fn cogito_embed(&mut self, cogito_id: CogitoId, obs: &[u8]) -> Result<Latent>;

    /// Roll the predictor forward one step.
    /// Capability required: cogito.predict
    fn cogito_predict(&mut self, cogito_id: CogitoId, z: &Latent, action: &[f32]) -> Result<Latent>;

    /// Run MPC to produce an action sequence reaching the goal.
    /// Capability required: cogito.plan (more expensive, separately gated)
    fn cogito_plan(
        &mut self,
        cogito_id: CogitoId,
        start: &Latent,
        goal: &Latent,
        horizon: u32,
    ) -> Result<Vec<Action>>;
}
```

### Capability-gated sandboxing

Three new capabilities slot into VUDO’s existing capability system:

- `cogito.embed` — call encoder on observations
- `cogito.predict` — call predictor on latents
- `cogito.plan` — full MPC rollout (gated separately because it’s compute-heavy and credit-expensive)

A Spirit’s manifest declares which it needs. The séance UI surfaces the request. The user grants per-summon or persistently. This is the same pattern as filesystem or network capabilities — Cogitos are just another resource type.

### Inference backend

Two reasonable backends, listed in order of preference:

1. **`candle`** (HuggingFace’s pure-Rust ML framework) — first-class WASM and CPU support, GPU via Metal/CUDA, integrates cleanly with wasmtime. Likely the right default.
1. **`burn`** — more flexible, broader autodiff support if we ever want to do fine-tuning inside the runtime (not required for inference but useful for fork operations).

The encoder does most of the compute and benefits most from GPU. wgpu is already in the Tauri stack, so a wgpu-accelerated encoder path is plausible without new infrastructure.

### Weight distribution

LeWM weights at 15M parameters are roughly 60 MB at fp32 or 30 MB at fp16. That’s too large to cram into an Imaginarium SQL row but small enough that IPFS distribution is unproblematic. Existing Phase 4 plans already include IPFS for Spirit content; Cogitos use the same path with a separate content type. Content-addressed storage means forks share weights they haven’t modified, which dramatically reduces total storage as the Cogito ecosystem grows.

### Capability cost: the GPU question

Honest acknowledgment: 15M-param inference is fast on a GPU and tolerable on a desktop CPU but painful on a phone or browser. For Phase 4, the realistic deployment is desktop Tauri IDE with optional wgpu acceleration. Browser deployment of the Cogito itself probably waits for a follow-up phase, with a fallback path of “the desktop or a remote node serves the embedding-as-a-service.” The credit-routed gradient system can naturally direct embedding requests to GPU-equipped nodes.

-----

## 8. Imaginarium Marketplace: Pricing, Attribution, Forking

This is where the LeWM × VUDO marriage gets economically interesting.

### Pricing models that make sense for Cogitos

Application Spirits are priced per-summon. Cogitos aren’t summoned in the same sense — they’re imported as dependencies and called many times during another Spirit’s execution. The pricing primitives multiply:

|Primitive     |What it charges for        |Example                                           |
|--------------|---------------------------|--------------------------------------------------|
|`embed`       |One observation → latent   |A Spirit that processes a video frame stream      |
|`predict`     |One step of latent rollout |A Spirit that does one-step lookahead             |
|`plan`        |Full MPC horizon           |A Spirit that needs goal-directed action sequences|
|`subscription`|Time-windowed unlimited use|Heavy users; flat rate per session                |

The 2% revival tax applies to all of these. The interesting design choice is whether to additionally bind pricing to *information content* — the entropy of the latent distribution, computable directly because the Gaussian regularizer makes it analytic. A higher-entropy latent (more bits) might justify higher per-call pricing. This isn’t just numerology: it ties the marketplace’s economic primitives to the model’s actual representational capacity, and it’s an honest signal because the Gaussian regularizer is enforced and verifiable.

### Attribution chains for forks

A fork in the Imaginarium currently means: copy a Spirit’s source, modify it, republish with attribution. For Cogitos, fork means *fine-tune the predictor on new trajectories* — and possibly the encoder too. The lineage is:

```
PhysicsCogito2D-v0.1.0  (Univrs Research, BlockPushing dataset)
    │
    └── PhysicsCogito2D-Soft-v0.1.0  (Alice, soft-body trajectories added)
            │
            └── SoftRobotCogito-v0.1.0  (Bob, soft-robot domain transfer)
```

Each fork records: parent hash, dataset hash of new training data, training script hash, resulting weights hash. Revenue splits flow up the chain: when a user pays Bob for `SoftRobotCogito`, a configurable cut goes to Alice and Univrs Research. This is the fork-attribution machinery already planned for application Spirits, applied to model lineage. The biological metaphor holds: forks are *graftings* on the mycelial substrate; revenue is *nutrient* flowing back to the parent hyphae.

### Discovery: probing as a search primitive

Imaginarium’s search currently indexes Spirit metadata. For Cogitos, the most useful search primitive isn’t text — it’s “find me a model whose latent space encodes property X.” Because LeWM’s latents support linear probes, a Cogito’s manifest can publish probe results as machine-readable claims:

```json
{
  "probe_results": {
    "agent_position": { "linear_r2": 0.94, "test_set_hash": "sha256:..." },
    "block_velocity": { "linear_r2": 0.87, "test_set_hash": "sha256:..." }
  }
}
```

Meilisearch indexes these. A creator looking for “a world model that understands velocity” gets a ranked list with verifiable claims. This makes the marketplace genuinely discoverable in a domain — physical properties — where text search would be useless.

-----

## 9. P2P / ENR Considerations: Federated World Models

Phase 0 (the P2P-ENR bridge) is the critical-path blocker for everything downstream, including Cogitos. Cogitos are particularly synergistic with the gradient-routed compute model the network is already designed for, in three ways.

### Inference as a routed resource

A Cogito’s embed/predict/plan calls are exactly the kind of compute the gradient broadcasts are meant to route. A node without a GPU asks the network “who can serve embeddings for cogito_id X?” The gradient surfaces nodes with the weights cached locally and GPU available, the credit ledger handles billing, the septal gate isolates failing nodes. This is a use case the existing Phase 0 design already accommodates — it just hadn’t anticipated ML inference specifically.

### Federated training (a Phase 5+ stretch)

LeWM trains offline on `(observation, action)` trajectories. A federated training scheme — multiple users contributing trajectories, training runs orchestrated by a poteau-mitan node, weight averaging via standard federated learning — is a natural fit for the network. This is far beyond Phase 4 scope and shouldn’t be in the critical path, but the architecture doesn’t preclude it. Calling it out so the foundation isn’t accidentally constrained.

### Privacy: latents are not data

A useful side effect of the JEPA architecture: clients can ship *latents* across the network instead of raw observations. A user’s webcam frame stays on-device; only a 32-dim latent crosses the wire. This satisfies user-sovereignty constraints in a way that’s structurally enforced by the architecture, not just by policy. The Gaussian regularizer also makes latent-space privacy analyses cleaner — there are real bounds on how much information a latent can carry given a fixed dimensionality and the Gaussian prior.

-----

## 10. Phase Alignment: Where This Goes In The Roadmap

Honest answer: this does not belong on the critical path. The 38-week shortest-path-to-Imaginarium is dependency-correct as currently drawn, and stuffing world-model R&D into Phase 4 would jeopardize the launch.

What I’d propose instead:

### Phase 4 (Imaginarium MVP, weeks 23-30) — Reserve schema slots

In the Imaginarium registry schema, reserve a `kind` enum value for `cogito` and a `cogito_metadata` JSON column (latent_dim, probe_results, parent_lineage). Don’t ship a Cogito; just don’t paint yourself into a corner. Cost: roughly half a day of schema work. Saves a migration later.

### Phase 4.5 (NEW, weeks 30-34) — Reference Cogito

A four-week insertion between Imaginarium MVP and Social/Launch:

- Week 1: Stand up `vudo-wm` crate with candle backend, port the LeWM reference implementation to it.
- Week 2: DOL `world_model` primitive; compile a reference Cogito to a Spirit package.
- Week 3: Imaginarium publish/discover/fork flow for Cogitos end-to-end.
- Week 4: Demo Spirit (a small interactive simulation) that imports the reference Cogito and works.

Gate: a creator can train a LeWM-style model locally, publish it as a Cogito, another user can summon and fork it, and revenue flows correctly. This is the “Imaginarium Test” applied to the world-model loop.

### Phase 5 (Social + Launch, originally weeks 31-36, now 35-40) — Carry forward

Same scope as the current Phase 5 plan. Cogitos are part of the launched marketplace, not a launch-blocker.

### Phase 6+ (Post-launch R&D)

Federated training, mobile/browser inference, Cogito composition (one Cogito’s latent feeding another’s predictor), cross-domain transfer experiments. Treat as research track, not roadmap.

The total slip is four weeks (38 → 42), and the deliverable is materially stronger: the launched Imaginarium isn’t just a tool marketplace, it’s a marketplace for *understanding*. That’s the difference between launching a feature and launching a thesis.

-----

## 11. Risks, Honest Caveats, And Open Questions

This section exists so this document doesn’t read as overclaiming. Let me push back on myself.

**The paper’s domain isn’t obviously the marketplace’s domain.** LeWM was demonstrated on continuous-control benchmarks — block pushing, locomotion. Whether the architecture transfers cleanly to “the world model of a creator’s app” depends on what creators want to model. UI interactions? Economic time series? Conversation flows? Some of these have clean latent structure; some don’t. We won’t know until we try. Phase 4.5 should pick a domain where we already know the answer (a small physics or game environment) before claiming general applicability.

**15M parameters and “a few hours” is a paper benchmark, not a product SLA.** Real creator workflows involve iteration, dataset curation, hyperparameter exploration. The actual cost of producing a publishable Cogito is probably 10-100× the headline number. Still in reach for individual creators, but not “free.”

**Linear-probe recoverability is a benchmark, not a guarantee.** Probes work on the test domain. Whether they’ll work on a creator’s chosen probe targets is empirical. The DOL `law` mechanism handles this honestly — laws are checked at publish time, and a model that fails its own laws is rejected — so the system is self-correcting, but we shouldn’t promise probe recoverability as a Cogito *feature*.

**Inference cost on the credit ledger needs careful design.** A naive `cogito_embed` per frame at 30 FPS is 30 credit transactions per second per user, which will overwhelm the ledger. Batching, leases, or session-based billing are required. This is solvable but needs explicit Phase 4.5 design work.

**The arXiv ID is unusual.** The paper is dated 2026 and the ID 2603.19312 is consistent with that vintage. Worth noting just so we’re not building on a moving target — the LeWM codebase has been active recently and the architecture is stable, but as with all bleeding-edge research, the recommended approach may evolve. Pinning to a specific commit when we port the reference implementation matters.

**Foundation-model competition.** The 48× planning speedup is over foundation-model-based world models *as of the paper’s comparisons*. Foundation models keep getting cheaper. The architectural argument (small, owned, sovereign) doesn’t depend on the speedup, but the framing should. Pitch Cogitos on sovereignty, not raw speed.

-----

## 12. Concrete Next Actions

Numbered and assignable:

1. **(Architecture, 1 day)** Write a one-page DOL spec for the `world_model` primitive, gene `Latent`, trait `WorldModel`. Circulate for review against the existing 22 HIR nodes.
1. **(Phase 4 prep, 0.5 days)** Add `kind: cogito` enum value and `cogito_metadata` JSON column to the Imaginarium registry schema before it ships.
1. **(Spike, 3 days)** Port the `lucas-maes/le-wm` reference implementation to `candle`, run inference on the released checkpoints, confirm latents match the paper’s numbers within tolerance. This validates the backend choice cheaply.
1. **(Spike, 2 days)** Build a minimal `vudo-wm` crate that loads a candle-based LeWM and exposes `embed/predict/plan` to a wasmtime instance. Single host, no networking, no credits — just prove the WASM-to-host bridge works for ML inference.
1. **(Design, 2 days)** Sketch the Phase 4.5 milestone breakdown into atomic tasks following the 30-minute-to-3-hour pattern the rest of the roadmap uses. Add gate criteria.
1. **(Strategic, 1 day)** Update the Phase Alignment Framework’s Strategic Imperatives table — does this introduce a new imperative around “model sovereignty,” or is it covered by user/creator sovereignty? My read is the latter, but worth a discussion.
1. **(Research, ongoing)** Track LeWM repository commits and follow-up papers; the architecture is recent enough that breaking changes are plausible.

-----

## Appendix: One-Sentence Summary For Each Audience

- **For the engineer:** LeWM is small enough, stable enough, and fast enough that a creator can train and publish a sovereign world model as a Spirit; we should build the runtime hooks for it.
- **For the strategist:** The Imaginarium becomes meaningfully more valuable if it sells understanding, not just utility, and LeWM is the cheapest credible path to making that real.
- **For the creator:** You’ll be able to teach the network how your domain works and get paid every time someone builds on top of it.
- **For the philosopher:** *Le réseau est Bondieu*, but Bondieu has to learn the world somehow — and now it can, on commodity hardware, in a way the network owns.

-----

*“Every tactical step must serve the strategic vision.
Every sprint must move toward the Imaginarium.
And now, every Imaginarium must serve a world.”* 🍄