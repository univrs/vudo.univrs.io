import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

type Section = 'intro' | 'types' | 'architecture' | 'problems' | 'dol';

export function CRDT() {
  const [activeSection, setActiveSection] = useState<Section>('intro');

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-20">
      {/* Header */}
      <section className="max-w-5xl mx-auto px-6 py-8">
        <Link to="/learn" className="text-[var(--text-muted)] hover:text-[#00ff88] text-sm mb-4 inline-block">
          ← Back to Learn
        </Link>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">🔗</span>
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
              Local-First & CRDTs
            </h1>
          </div>
          <p className="text-[var(--text-secondary)] max-w-2xl">
            Learn how VUDO enables offline-first, P2P applications using Conflict-free Replicated Data Types.
            Your data, your device — the network is optional.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00ff88]/10 text-[#00ff88] text-sm">
            <span className="w-2 h-2 rounded-full bg-[#00ff88]" />
            Powered by Automerge + Iroh P2P
          </div>
        </motion.div>
      </section>

      {/* Navigation Tabs */}
      <section className="max-w-5xl mx-auto px-6">
        <div className="flex gap-1 p-1 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-color)] inline-flex flex-wrap">
          {([
            { key: 'intro', label: '1. Local-First' },
            { key: 'types', label: '2. CRDT Types' },
            { key: 'architecture', label: '3. Architecture' },
            { key: 'problems', label: '4. Hard Problems' },
            { key: 'dol', label: '5. DOL Integration' },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeSection === key
                  ? 'bg-[#00ff88]/20 text-[#00ff88]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Content */}
      <section className="max-w-5xl mx-auto px-6 py-8">
        {activeSection === 'intro' && <IntroSection onNext={() => setActiveSection('types')} />}
        {activeSection === 'types' && <TypesSection onNext={() => setActiveSection('architecture')} />}
        {activeSection === 'architecture' && <ArchitectureSection onNext={() => setActiveSection('problems')} />}
        {activeSection === 'problems' && <ProblemsSection onNext={() => setActiveSection('dol')} />}
        {activeSection === 'dol' && <DOLSection />}
      </section>
    </div>
  );
}

// ============================================================================
// Section Components
// ============================================================================

function IntroSection({ onNext }: { onNext: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="prose prose-invert max-w-none">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">What is Local-First?</h2>
        <p className="text-[var(--text-secondary)]">
          Local-first is a software architecture where your device is the source of truth, not a cloud server.
          Apps work fully offline. Data lives on your machine. When connectivity exists, devices sync with each other
          — directly (P2P) or through optional relay servers.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <IdealCard number={1} title="No Spinners" description="Works instantly, even offline — reads and writes hit local storage." />
        <IdealCard number={2} title="Your Data" description="Data is stored locally in formats you can access and export." />
        <IdealCard number={3} title="Network Optional" description="Full functionality without connectivity." />
        <IdealCard number={4} title="Seamless Collab" description="When online, real-time co-editing just works." />
        <IdealCard number={5} title="The Long Now" description="Data outlives servers. No company shutdown kills your files." />
        <IdealCard number={6} title="Privacy Default" description="End-to-end encryption. No server-side snooping." />
        <IdealCard number={7} title="User Control" description="You choose where data lives and who sees it." />
      </div>

      <InfoBox title="The Core Question" variant="info">
        How do multiple devices converge on the same state without a central coordinator?
        That's where <strong>CRDTs</strong> come in.
      </InfoBox>

      <div className="prose prose-invert max-w-none">
        <h3 className="text-xl font-bold text-[var(--text-primary)]">Why Not Just Use Timestamps?</h3>
        <div className="grid md:grid-cols-3 gap-4 mt-4">
          <ProblemCard
            title="Clock Skew"
            description="Device clocks drift. A's '3:00 PM' might actually be after B's '3:01 PM'."
          />
          <ProblemCard
            title="Lost Intent"
            description="If Alice adds 'milk' and Bob adds 'eggs', a timestamp approach might discard one."
          />
          <ProblemCard
            title="No Causality"
            description="Timestamps can't tell if two edits are independent or one depends on the other."
          />
        </div>
      </div>

      <InfoBox title="CRDTs Solve This" variant="success">
        CRDTs encode the <em>semantics of the operation</em> into the data structure.
        Instead of "when did this happen?" they ask "what was the intent, and how do we preserve all intents?"
      </InfoBox>

      <button
        onClick={onNext}
        className="px-6 py-3 bg-[#00ff88] text-black font-medium rounded-lg hover:bg-[#00ff88]/90 transition"
      >
        Explore CRDT Types →
      </button>
    </motion.div>
  );
}

function TypesSection({ onNext }: { onNext: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="prose prose-invert max-w-none">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">The Seven CRDT Types</h2>
        <p className="text-[var(--text-secondary)]">
          Each CRDT type has specific merge semantics suited for different data patterns.
          DOL uses <code>@crdt(...)</code> annotations to specify which strategy each field uses.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border-color)]">
              <th className="text-left py-3 px-4 text-[var(--text-muted)]">Type</th>
              <th className="text-left py-3 px-4 text-[var(--text-muted)]">Use Case</th>
              <th className="text-left py-3 px-4 text-[var(--text-muted)]">Merge Strategy</th>
            </tr>
          </thead>
          <tbody className="text-[var(--text-secondary)]">
            <CRDTRow type="LWW-Register" useCase="Simple fields (name, email)" merge="Last timestamp wins" />
            <CRDTRow type="PN-Counter" useCase="Balances, counts" merge="Increments/decrements accumulate" />
            <CRDTRow type="OR-Set" useCase="Tags, members" merge="Add wins over remove" />
            <CRDTRow type="RGA" useCase="Ordered lists" merge="Unique IDs preserve order" />
            <CRDTRow type="Peritext" useCase="Rich text (bold, italic)" merge="Formatting marks merge correctly" />
            <CRDTRow type="MV-Register" useCase="Conflict preservation" merge="Keep all concurrent values" />
            <CRDTRow type="Movable Tree" useCase="Hierarchies, file systems" merge="Parent refs resolve consistently" />
          </tbody>
        </table>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <CRDTDetailCard
          title="LWW-Register"
          icon="📝"
          description="Stores a single value with a timestamp. Higher timestamp wins on merge."
          example={`Device A: set(name, "Alice", t=10)
Device B: set(name, "Alicia", t=12)
Result: "Alicia" (t=12 > t=10)`}
          gotcha="If two peers edit concurrently, one value is silently dropped."
        />
        <CRDTDetailCard
          title="PN-Counter"
          icon="🔢"
          description="Two counters per peer: increments (P) and decrements (N). Value = sum(P) - sum(N)."
          example={`Peer A: P={A:5}, N={A:1} → net: 4
Peer B: P={B:3}, N={B:0} → net: 3
Total: (5+3) - (1+0) = 7`}
          gotcha="Can go negative. Use escrow pattern for balances."
        />
        <CRDTDetailCard
          title="OR-Set"
          icon="🏷️"
          description="Each element tagged with unique ID. Remove only affects observed tags. Add wins over concurrent remove."
          example={`A: add("milk", tag=a1)
B: remove("milk", {a1})
C: add("milk", tag=c1)  // concurrent
Result: {"milk"(c1)} survives`}
          gotcha="Add-wins semantics may not suit all use cases."
        />
        <CRDTDetailCard
          title="Peritext"
          icon="📄"
          description="Rich text CRDT handling formatting marks. Developed by Ink & Switch."
          example={`Alice bolds chars 1-5
Bob italicizes chars 3-8
Result: 1-2 bold, 3-5 bold+italic, 6-8 italic`}
          gotcha="Most complex type. Still maturing in Automerge."
        />
      </div>

      <button
        onClick={onNext}
        className="px-6 py-3 bg-[#00ff88] text-black font-medium rounded-lg hover:bg-[#00ff88]/90 transition"
      >
        See the Architecture →
      </button>
    </motion.div>
  );
}

function ArchitectureSection({ onNext }: { onNext: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="prose prose-invert max-w-none">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">VUDO Local-First Architecture</h2>
        <p className="text-[var(--text-secondary)]">
          Four layers work together: Application → CRDT → Sync Protocol → P2P Transport.
        </p>
      </div>

      <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-color)] overflow-hidden">
        <pre className="p-6 text-xs md:text-sm overflow-x-auto text-[var(--text-secondary)] font-mono">
{`┌─────────────────────────────────────────────────────────┐
│                    APPLICATION                          │
│  gen User { name: String @crdt(lww) }                  │
│                                                         │
│  DOL schema layer. @crdt annotations specify merge      │
│  strategy per field. App code reads/writes normally.    │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│               CRDT LAYER (Automerge)                    │
│                                                         │
│  • Operation capture: Every write → op with clock       │
│  • Merge logic: Per-type merge (LWW, OR-Set, etc.)     │
│  • Causal ordering: Vector clocks track dependencies   │
│  • Tombstones: Deleted elements marked, not removed    │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│                 SYNC PROTOCOL                           │
│                                                         │
│  • Bloom filter: "What do you have?" negotiation       │
│  • Delta sync: Only missing ops transmitted            │
│  • Causal broadcast: Ops arrive in causal order        │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│              P2P TRANSPORT (Iroh)                       │
│                                                         │
│  • Peer discovery: Public key, DHT, local network      │
│  • NAT traversal: QUIC + hole-punching + relay         │
│  • Encrypted channels: Ed25519 authenticated           │
└─────────────────────────────────────────────────────────┘`}
        </pre>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <InfoBox title="Why Automerge?" variant="info">
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Rust core — integrates with DOL's stack</li>
            <li>Formal proofs for convergence guarantees</li>
            <li>Built-in sync protocol</li>
            <li>Active development (v2.0+ is production-ready)</li>
          </ul>
        </InfoBox>
        <InfoBox title="Why Iroh?" variant="info">
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Rust-native, built on QUIC</li>
            <li>91%+ direct connection success rate</li>
            <li>Automatic relay fallback</li>
            <li>Simpler than raw libp2p for document sync</li>
          </ul>
        </InfoBox>
      </div>

      <button
        onClick={onNext}
        className="px-6 py-3 bg-[#00ff88] text-black font-medium rounded-lg hover:bg-[#00ff88]/90 transition"
      >
        Understand the Hard Problems →
      </button>
    </motion.div>
  );
}

function ProblemsSection({ onNext }: { onNext: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="prose prose-invert max-w-none">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">The Hard Problems</h2>
        <p className="text-[var(--text-secondary)]">
          CRDTs solve convergence, but real-world systems face additional challenges.
        </p>
      </div>

      <HardProblemCard
        number={1}
        title="Tombstone Accumulation"
        description="Deletes become tombstones that persist forever, consuming memory and slowing operations."
        solution="Epoch-based garbage collection or Willow Protocol's true deletion model."
        code={`Epoch 1: All peers confirmed ops 1–1000
→ Tombstones for ops 1–1000 can be GC'd
Epoch 2: All peers confirmed ops 1–5000
→ Tombstones for 1001–5000 also collected`}
      />

      <HardProblemCard
        number={2}
        title="Mutual Credit (Balance Problem)"
        description="Financial balances have invariants that must never be violated. A PN-Counter can go negative."
        solution="The Escrow Pattern: Pre-allocate spending capacity to each device."
        code={`global_balance: 1000 (BFT-confirmed)
├── device_A escrow: 300 (can spend up to 300 offline)
├── device_B escrow: 300 (can spend up to 300 offline)
└── reserved: 400 (buffer for new devices)

Device A spends 200 → local escrow: 100 ✓
Device B spends 250 → local escrow: 50  ✓
Neither exceeds escrow → no overdraft possible`}
      />

      <HardProblemCard
        number={3}
        title="Schema Evolution"
        description="When Gen v2 adds a field, v1 peers must still sync. New field types require merge logic v1 doesn't have."
        solution="Forward compatibility + deterministic migration actors."
        code={`// Migration modeled as CRDT operation
migration_id: "user-v2-20260201"
actor_id: 0x0000000001  // Fixed, reproducible

// All peers apply same migration deterministically`}
      />

      <HardProblemCard
        number={4}
        title="Byzantine Peers"
        description="Malicious nodes can send fabricated operations — fake timestamps, impossible state transitions."
        solution="Hash-chain operations + authenticated operations + rate limiting + reputation."
        code={`Defense layers:
1. Ed25519 signatures on all ops
2. Schema validation (type + constraint checks)
3. Rate limiting (impossible throughput → throttle)
4. Reputation/web of trust over time`}
      />

      <button
        onClick={onNext}
        className="px-6 py-3 bg-[#00ff88] text-black font-medium rounded-lg hover:bg-[#00ff88]/90 transition"
      >
        See DOL Integration →
      </button>
    </motion.div>
  );
}

function DOLSection() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="prose prose-invert max-w-none">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">DOL Integration</h2>
        <p className="text-[var(--text-secondary)]">
          DOL's <code>@crdt(...)</code> annotations drive code generation. The compiler produces
          Automerge-backed Rust structs with type-safe merge logic.
        </p>
      </div>

      <CodeBlock
        title="DOL Schema with CRDT Annotations"
        language="dol"
        code={`gen User {
  id: UUID @crdt(immutable)           // Set once, never changes
  name: String @crdt(lww)             // Last writer wins
  tags: Set<String> @crdt(or_set)     // Add wins over remove
  balance: Int @crdt(pn_counter)      // Increments accumulate
  bio: RichText @crdt(peritext)       // Rich text merge
}

constraint NonNegativeBalance on User {
  require: self.balance >= 0
  on_merge_violation: reject_operation
}`}
      />

      <CodeBlock
        title="Generated Rust (Automerge-backed)"
        language="rust"
        code={`#[derive(Debug, Clone, Reconcile, Hydrate)]
pub struct User {
    pub id: Uuid,
    pub name: String,
    pub tags: HashSet<String>,
    pub balance: i64,
    pub bio: automerge::Text,
}

impl User {
    pub fn merge(&mut self, remote: &User) -> Result<(), ConstraintError> {
        // LWW for name
        if remote.name_clock > self.name_clock {
            self.name = remote.name.clone();
        }
        // OR-Set union for tags
        self.tags.extend(remote.tags.iter().cloned());
        // PN-Counter accumulation for balance
        self.balance = self.balance + remote.balance_delta;
        
        // Constraint check
        if self.balance < 0 {
            return Err(ConstraintError::NonNegativeBalance);
        }
        Ok(())
    }
}`}
      />

      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)]">
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">✅ What's In Phase 1</h3>
          <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
            <li>• LWW-Register, PN-Counter, OR-Set</li>
            <li>• Basic sync over Iroh (direct connection)</li>
            <li>• Constraint validation (NonNegativeBalance)</li>
            <li>• Schema-to-Automerge compilation</li>
          </ul>
        </div>
        <div className="p-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)]">
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">🔜 Deferred to Later</h3>
          <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
            <li>• Peritext rich text (fallback to RGA)</li>
            <li>• Movable Tree</li>
            <li>• Escrow pattern for multi-device</li>
            <li>• Byzantine fault tolerance</li>
            <li>• Tombstone garbage collection</li>
          </ul>
        </div>
      </div>

      <InfoBox title="Key References" variant="info">
        <ul className="space-y-1 text-sm">
          <li>• Kleppmann et al., "Local-First Software" (2019)</li>
          <li>• Shapiro et al., "Convergent and Commutative Replicated Data Types" (2011)</li>
          <li>• Litt et al., "Peritext: A CRDT for Collaborative Rich Text" (2022)</li>
          <li>• <a href="https://automerge.org" className="text-[#00ff88] hover:underline">automerge.org</a> — Implementation docs</li>
          <li>• <a href="https://iroh.computer" className="text-[#00ff88] hover:underline">iroh.computer</a> — P2P transport</li>
        </ul>
      </InfoBox>

      <div className="p-6 rounded-xl border-2 border-[#00ff88]/30 bg-[#00ff88]/5">
        <h3 className="text-xl font-bold text-[#00ff88] mb-2">🍄 The Mycelium is Growing</h3>
        <p className="text-[var(--text-secondary)]">
          VUDO's local-first architecture means your Spirits run anywhere — browser, desktop, mobile, edge.
          No cloud required. Your data, your control. The network is just a sync channel.
        </p>
      </div>
    </motion.div>
  );
}

// ============================================================================
// Reusable Components
// ============================================================================

function IdealCard({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="p-4 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)]">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-6 h-6 rounded-full bg-[#00ff88]/20 text-[#00ff88] text-xs font-bold flex items-center justify-center">
          {number}
        </span>
        <h4 className="font-semibold text-[var(--text-primary)]">{title}</h4>
      </div>
      <p className="text-sm text-[var(--text-muted)]">{description}</p>
    </div>
  );
}

function ProblemCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-4 rounded-lg border border-red-500/30 bg-red-500/5">
      <h4 className="font-semibold text-red-400 mb-1">{title}</h4>
      <p className="text-sm text-[var(--text-muted)]">{description}</p>
    </div>
  );
}

function CRDTRow({ type, useCase, merge }: { type: string; useCase: string; merge: string }) {
  return (
    <tr className="border-b border-[var(--border-color)]">
      <td className="py-3 px-4 font-mono text-[#00ff88]">{type}</td>
      <td className="py-3 px-4">{useCase}</td>
      <td className="py-3 px-4">{merge}</td>
    </tr>
  );
}

function CRDTDetailCard({
  title,
  icon,
  description,
  example,
  gotcha,
}: {
  title: string;
  icon: string;
  description: string;
  example: string;
  gotcha: string;
}) {
  return (
    <div className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)]">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{icon}</span>
        <h3 className="font-bold text-[var(--text-primary)]">{title}</h3>
      </div>
      <p className="text-sm text-[var(--text-secondary)] mb-3">{description}</p>
      <pre className="p-3 rounded bg-black/30 text-xs font-mono text-[var(--text-muted)] overflow-x-auto mb-3">
        {example}
      </pre>
      <p className="text-xs text-yellow-500/80">
        <span className="font-semibold">⚠️ Gotcha:</span> {gotcha}
      </p>
    </div>
  );
}

function HardProblemCard({
  number,
  title,
  description,
  solution,
  code,
}: {
  number: number;
  title: string;
  description: string;
  solution: string;
  code: string;
}) {
  return (
    <div className="p-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)]">
      <div className="flex items-center gap-3 mb-3">
        <span className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 font-bold flex items-center justify-center">
          {number}
        </span>
        <h3 className="text-lg font-bold text-[var(--text-primary)]">{title}</h3>
      </div>
      <p className="text-[var(--text-secondary)] mb-3">{description}</p>
      <p className="text-sm text-[#00ff88] mb-3">
        <span className="font-semibold">Solution:</span> {solution}
      </p>
      <pre className="p-3 rounded bg-black/30 text-xs font-mono text-[var(--text-muted)] overflow-x-auto">
        {code}
      </pre>
    </div>
  );
}

function InfoBox({
  title,
  variant,
  children,
}: {
  title: string;
  variant: 'info' | 'success' | 'warning';
  children: React.ReactNode;
}) {
  const colors = {
    info: 'border-blue-500/30 bg-blue-500/5 text-blue-400',
    success: 'border-[#00ff88]/30 bg-[#00ff88]/5 text-[#00ff88]',
    warning: 'border-yellow-500/30 bg-yellow-500/5 text-yellow-400',
  };

  return (
    <div className={`p-4 rounded-lg border ${colors[variant]}`}>
      <h4 className="font-semibold mb-2">{title}</h4>
      <div className="text-sm text-[var(--text-secondary)]">{children}</div>
    </div>
  );
}

function CodeBlock({ title, code, language = 'typescript' }: { title: string; code: string; language?: string }) {
  return (
    <div className="rounded-xl border border-[var(--border-color)] overflow-hidden">
      <div className="px-4 py-2 bg-[var(--bg-surface)] border-b border-[var(--border-color)] flex items-center justify-between">
        <span className="text-sm text-[var(--text-muted)]">{title}</span>
        <span className="text-xs text-[var(--text-muted)] font-mono">{language}</span>
      </div>
      <pre className="p-4 bg-black/50 overflow-x-auto">
        <code className="text-sm font-mono text-[var(--text-secondary)]">{code}</code>
      </pre>
    </div>
  );
}
