import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  initThermodynamic,
  solarSystemExample,
  hyphalNetworkExample,
  maxSupportedNodes,
  randomClustering,
  randomPathLength,
  calculateSigma,
  analyzeEcosystem,
  EnergySystemMetrics,
} from '../../lib/wasm/thermodynamic';

export function ThermodynamicEconomics() {
  const [wasmReady, setWasmReady] = useState(false);
  const [activeSection, setActiveSection] = useState<'intro' | 'eroei' | 'network' | 'combined'>('intro');

  useEffect(() => {
    initThermodynamic().then(() => setWasmReady(true)).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-20">
      {/* Header */}
      <section className="max-w-5xl mx-auto px-6 py-8">
        <Link to="/learn" className="text-[var(--text-muted)] hover:text-[#00ff88] text-sm mb-4 inline-block">
          ← Back to Learn
        </Link>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">⚡</span>
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
              Thermodynamic Economics
            </h1>
          </div>
          <p className="text-[var(--text-secondary)] max-w-2xl">
            This Spirit calculates Energy Return on Energy Invested (EROEI) and Small-World network metrics.
            All calculations run in your browser via WASM compiled from DOL → Rust.
          </p>
          {wasmReady ? (
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00ff88]/10 text-[#00ff88] text-sm">
              <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
              WASM Loaded (56 KB)
            </div>
          ) : (
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 text-yellow-500 text-sm">
              <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
              Loading WASM...
            </div>
          )}
        </motion.div>
      </section>

      {/* Navigation Tabs */}
      <section className="max-w-5xl mx-auto px-6">
        <div className="flex gap-1 p-1 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-color)] inline-flex">
          {(['intro', 'eroei', 'network', 'combined'] as const).map(section => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeSection === section
                  ? 'bg-[#00ff88]/20 text-[#00ff88]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {section === 'intro' && '1. Introduction'}
              {section === 'eroei' && '2. EROEI Calculator'}
              {section === 'network' && '3. Small-World'}
              {section === 'combined' && '4. Full Analysis'}
            </button>
          ))}
        </div>
      </section>

      {/* Content */}
      <section className="max-w-5xl mx-auto px-6 py-8">
        {activeSection === 'intro' && <IntroSection onNext={() => setActiveSection('eroei')} />}
        {activeSection === 'eroei' && wasmReady && <EroeiSection onNext={() => setActiveSection('network')} />}
        {activeSection === 'network' && wasmReady && <NetworkSection onNext={() => setActiveSection('combined')} />}
        {activeSection === 'combined' && wasmReady && <CombinedSection />}
      </section>
    </div>
  );
}

function IntroSection({ onNext }: { onNext: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="prose prose-invert max-w-none">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">What You'll Learn</h2>
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <ConceptCard
            title="EROEI (Energy Return on Energy Invested)"
            description="The ratio of energy produced to energy consumed. A system needs EROEI ≥ 7 to sustain modern civilization."
            formula="EROEI = Energy Output / Energy Input"
          />
          <ConceptCard
            title="Small-World Networks (Watts-Strogatz)"
            description="Networks with high clustering and short path lengths. Sigma > 1 indicates small-world properties."
            formula="σ = (C/C_random) / (L/L_random)"
          />
        </div>
      </div>

      <CodeBlock
        title="DOL Schema (eroei.dol)"
        code={`gen EnergySystemMetrics {
    has total_output_kwh: f64
    has total_input_kwh: f64
    has component_count: i32

    rule positive_output {
        this.total_output_kwh >= 0.0
    }

    fun system_eroei() -> f64 {
        return this.total_output_kwh / this.total_input_kwh
    }

    fun is_viable() -> bool {
        return this.system_eroei() >= 7.0
    }
}`}
      />

      <CodeBlock
        title="Generated Rust (compiled to WASM)"
        code={`#[wasm_bindgen]
impl EnergySystemMetrics {
    pub fn system_eroei(&self) -> f64 {
        if self.total_input_kwh <= 0.0 { return 0.0; }
        self.total_output_kwh / self.total_input_kwh
    }

    pub fn is_viable(&self) -> f64 {
        if self.system_eroei() >= 7.0 { 1.0 } else { 0.0 }
    }
}`}
      />

      <button
        onClick={onNext}
        className="px-6 py-3 bg-[#00ff88] text-black font-medium rounded-lg hover:bg-[#00ff88]/90 transition"
      >
        Try the EROEI Calculator →
      </button>
    </motion.div>
  );
}

function EroeiSection({ onNext }: { onNext: () => void }) {
  const [nodes, setNodes] = useState(1000);
  const [solarMW, setSolarMW] = useState(1.0);
  const [results, setResults] = useState<{
    solar: EnergySystemMetrics | null;
    hyphal: EnergySystemMetrics | null;
    maxNodes: bigint;
  }>({ solar: null, hyphal: null, maxNodes: BigInt(0) });

  const calculate = useCallback(async () => {
    const [solar, hyphal, max] = await Promise.all([
      solarSystemExample(),
      hyphalNetworkExample(BigInt(nodes)),
      maxSupportedNodes(solarMW, 100),
    ]);
    setResults({ solar, hyphal, maxNodes: max });
  }, [nodes, solarMW]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const combinedInput = results.solar && results.hyphal
    ? results.solar.totalInputKwh + results.hyphal.totalInputKwh
    : 0;
  const combinedEroei = results.solar
    ? results.solar.totalOutputKwh / combinedInput
    : 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <h2 className="text-2xl font-bold text-[var(--text-primary)]">EROEI Calculator</h2>

      {/* Controls */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)]">
          <label className="block text-sm text-[var(--text-muted)] mb-2">Network Nodes</label>
          <input
            type="range"
            min="100"
            max="5000"
            step="100"
            value={nodes}
            onChange={e => setNodes(Number(e.target.value))}
            className="w-full accent-[#00ff88]"
          />
          <div className="text-2xl font-mono text-[#00ff88] mt-2">{nodes.toLocaleString()}</div>
        </div>
        <div className="p-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)]">
          <label className="block text-sm text-[var(--text-muted)] mb-2">Solar Capacity (MW)</label>
          <input
            type="range"
            min="0.5"
            max="10"
            step="0.5"
            value={solarMW}
            onChange={e => setSolarMW(Number(e.target.value))}
            className="w-full accent-[#00ff88]"
          />
          <div className="text-2xl font-mono text-[#00ff88] mt-2">{solarMW.toFixed(1)} MW</div>
        </div>
      </div>

      {/* Results */}
      <div className="grid md:grid-cols-3 gap-4">
        <ResultCard
          label="Solar EROEI"
          value={results.solar?.systemEroei().toFixed(2) ?? '—'}
          status="excellent"
          detail="Pure energy producer"
        />
        <ResultCard
          label="Hyphal EROEI"
          value={results.hyphal?.systemEroei().toFixed(2) ?? '—'}
          status="critical"
          detail="Pure consumer (heterotroph)"
        />
        <ResultCard
          label="Combined EROEI"
          value={combinedEroei.toFixed(2)}
          status={combinedEroei >= 7 ? 'good' : combinedEroei >= 5 ? 'warning' : 'critical'}
          detail={combinedEroei >= 7 ? 'Viable system' : 'At risk'}
        />
      </div>

      <div className="p-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)]">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Energy Budget</h3>
        <div className="space-y-3 font-mono text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">Solar Output:</span>
            <span className="text-[#00ff88]">{results.solar?.totalOutputKwh.toLocaleString()} kWh/year</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">Solar Input:</span>
            <span className="text-yellow-500">{results.solar?.totalInputKwh.toLocaleString()} kWh/year</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">Hyphal Input:</span>
            <span className="text-red-500">{results.hyphal?.totalInputKwh.toLocaleString()} kWh/year</span>
          </div>
          <hr className="border-[var(--border-color)]" />
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">Net Energy:</span>
            <span className={results.solar && results.hyphal && results.solar.totalOutputKwh - combinedInput > 0 ? 'text-[#00ff88]' : 'text-red-500'}>
              {((results.solar?.totalOutputKwh ?? 0) - combinedInput).toLocaleString()} kWh/year
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">Max Nodes ({solarMW} MW):</span>
            <span className="text-[var(--text-primary)]">{results.maxNodes.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <button
        onClick={onNext}
        className="px-6 py-3 bg-[#00ff88] text-black font-medium rounded-lg hover:bg-[#00ff88]/90 transition"
      >
        Explore Small-World Networks →
      </button>
    </motion.div>
  );
}

function NetworkSection({ onNext }: { onNext: () => void }) {
  const [n, setN] = useState(150);
  const [k, setK] = useState(6);
  const [clustering, setClustering] = useState(0.45);
  const [pathLength, setPathLength] = useState(3.9);
  const [results, setResults] = useState<{
    cRandom: number;
    lRandom: number;
    sigma: number;
  }>({ cRandom: 0, lRandom: 0, sigma: 0 });

  const calculate = useCallback(async () => {
    const [cRandom, lRandom] = await Promise.all([
      randomClustering(BigInt(n), k),
      randomPathLength(BigInt(n), k),
    ]);
    const sigma = await calculateSigma(clustering, pathLength, cRandom, lRandom);
    setResults({ cRandom, lRandom, sigma });
  }, [n, k, clustering, pathLength]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <h2 className="text-2xl font-bold text-[var(--text-primary)]">Small-World Network Analysis</h2>

      {/* Controls */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)]">
          <label className="block text-sm text-[var(--text-muted)] mb-2">Nodes (N)</label>
          <input
            type="range"
            min="50"
            max="500"
            step="10"
            value={n}
            onChange={e => setN(Number(e.target.value))}
            className="w-full accent-[#8b5cf6]"
          />
          <div className="text-2xl font-mono text-[#8b5cf6] mt-2">{n}</div>
        </div>
        <div className="p-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)]">
          <label className="block text-sm text-[var(--text-muted)] mb-2">Average Degree (k)</label>
          <input
            type="range"
            min="2"
            max="20"
            step="1"
            value={k}
            onChange={e => setK(Number(e.target.value))}
            className="w-full accent-[#8b5cf6]"
          />
          <div className="text-2xl font-mono text-[#8b5cf6] mt-2">{k}</div>
        </div>
        <div className="p-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)]">
          <label className="block text-sm text-[var(--text-muted)] mb-2">Clustering (C)</label>
          <input
            type="range"
            min="0.01"
            max="0.9"
            step="0.01"
            value={clustering}
            onChange={e => setClustering(Number(e.target.value))}
            className="w-full accent-[#8b5cf6]"
          />
          <div className="text-2xl font-mono text-[#8b5cf6] mt-2">{clustering.toFixed(2)}</div>
        </div>
        <div className="p-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)]">
          <label className="block text-sm text-[var(--text-muted)] mb-2">Path Length (L)</label>
          <input
            type="range"
            min="1"
            max="10"
            step="0.1"
            value={pathLength}
            onChange={e => setPathLength(Number(e.target.value))}
            className="w-full accent-[#8b5cf6]"
          />
          <div className="text-2xl font-mono text-[#8b5cf6] mt-2">{pathLength.toFixed(1)}</div>
        </div>
      </div>

      {/* Results */}
      <div className="grid md:grid-cols-3 gap-4">
        <ResultCard
          label="gamma (C/C_rand)"
          value={(clustering / results.cRandom).toFixed(2)}
          status={(clustering / results.cRandom) > 1 ? 'good' : 'warning'}
          detail="Clustering ratio"
        />
        <ResultCard
          label="lambda (L/L_rand)"
          value={(pathLength / results.lRandom).toFixed(2)}
          status={(pathLength / results.lRandom) < 2 ? 'good' : 'warning'}
          detail="Path length ratio"
        />
        <ResultCard
          label="sigma (σ)"
          value={results.sigma.toFixed(2)}
          status={results.sigma > 1 ? 'excellent' : 'critical'}
          detail={results.sigma > 1 ? 'Small-world!' : 'Not small-world'}
        />
      </div>

      <div className="p-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)]">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Network Properties</h3>
        <div className="space-y-3 font-mono text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">Edges (M):</span>
            <span className="text-[var(--text-primary)]">{((n * k) / 2).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">Random C:</span>
            <span className="text-[var(--text-muted)]">{results.cRandom.toFixed(4)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">Random L:</span>
            <span className="text-[var(--text-muted)]">{results.lRandom.toFixed(4)}</span>
          </div>
          <hr className="border-[var(--border-color)]" />
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">Interpretation:</span>
            <span className={results.sigma > 1 ? 'text-[#00ff88]' : 'text-yellow-500'}>
              {results.sigma > 1
                ? 'High clustering + short paths'
                : 'Lacks small-world properties'}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-[#8b5cf6]/10 border border-[#8b5cf6]/30">
        <p className="text-sm text-[var(--text-secondary)]">
          <strong className="text-[#8b5cf6]">Dunbar's Number:</strong> Human social networks naturally form
          small-world structures with ~150 nodes (N=150, k≈6). Try these values to see σ ≈ 7.5!
        </p>
      </div>

      <button
        onClick={onNext}
        className="px-6 py-3 bg-[#00ff88] text-black font-medium rounded-lg hover:bg-[#00ff88]/90 transition"
      >
        See Full Analysis →
      </button>
    </motion.div>
  );
}

function CombinedSection() {
  const [nodes, setNodes] = useState(1000);
  const [output, setOutput] = useState('');

  useEffect(() => {
    async function run() {
      const result = await analyzeEcosystem(1.0, BigInt(nodes), 100, 6, 0.45, 3.9);
      setOutput(result);
    }
    run();
  }, [nodes]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <h2 className="text-2xl font-bold text-[var(--text-primary)]">Full Ecosystem Analysis</h2>

      <div className="p-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)]">
        <label className="block text-sm text-[var(--text-muted)] mb-2">Network Nodes</label>
        <input
          type="range"
          min="100"
          max="3000"
          step="100"
          value={nodes}
          onChange={e => setNodes(Number(e.target.value))}
          className="w-full accent-[#00ff88]"
        />
        <div className="text-2xl font-mono text-[#00ff88] mt-2">{nodes.toLocaleString()} nodes</div>
      </div>

      <div className="p-6 rounded-xl border border-[var(--border-color)] bg-black font-mono text-sm whitespace-pre overflow-x-auto">
        <div className="text-[var(--text-muted)] mb-2">$ thermo full {nodes}</div>
        <div className="text-[#00ff88]">{output}</div>
      </div>

      <div className="p-4 rounded-lg bg-[#00ff88]/10 border border-[#00ff88]/30">
        <p className="text-sm text-[var(--text-secondary)]">
          <strong className="text-[#00ff88]">What you just learned:</strong> This entire analysis runs in
          your browser using WASM compiled from DOL schemas. No server required. The same code runs as a
          CLI tool (<code className="text-[#00ff88]">thermo</code>) and in the browser.
        </p>
      </div>

      <div className="flex gap-4">
        <Link
          to="/editor"
          className="px-6 py-3 bg-[#00ff88] text-black font-medium rounded-lg hover:bg-[#00ff88]/90 transition"
        >
          Try the DOL Editor
        </Link>
        <Link
          to="/learn"
          className="px-6 py-3 border border-[var(--border-color)] text-[var(--text-primary)] font-medium rounded-lg hover:border-[#00ff88]/50 transition"
        >
          More Tutorials
        </Link>
      </div>
    </motion.div>
  );
}

function ConceptCard({ title, description, formula }: { title: string; description: string; formula: string }) {
  return (
    <div className="p-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)]">
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{title}</h3>
      <p className="text-sm text-[var(--text-secondary)] mb-4">{description}</p>
      <code className="block p-3 rounded bg-black text-[#00ff88] text-sm font-mono">{formula}</code>
    </div>
  );
}

function CodeBlock({ title, code }: { title: string; code: string }) {
  return (
    <div className="rounded-xl border border-[var(--border-color)] overflow-hidden">
      <div className="px-4 py-2 bg-[var(--bg-surface)] border-b border-[var(--border-color)] flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <span className="text-xs text-[var(--text-muted)] ml-2">{title}</span>
      </div>
      <pre className="p-4 bg-black overflow-x-auto text-sm">
        <code className="text-[#00ff88]">{code}</code>
      </pre>
    </div>
  );
}

function ResultCard({
  label,
  value,
  status,
  detail
}: {
  label: string;
  value: string;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  detail: string;
}) {
  const colors = {
    excellent: 'text-[#00ff88] border-[#00ff88]/30 bg-[#00ff88]/5',
    good: 'text-blue-400 border-blue-400/30 bg-blue-400/5',
    warning: 'text-yellow-500 border-yellow-500/30 bg-yellow-500/5',
    critical: 'text-red-500 border-red-500/30 bg-red-500/5',
  };

  return (
    <div className={`p-4 rounded-xl border ${colors[status]}`}>
      <div className="text-xs text-[var(--text-muted)] mb-1">{label}</div>
      <div className="text-3xl font-mono font-bold">{value}</div>
      <div className="text-xs mt-1 opacity-70">{detail}</div>
    </div>
  );
}
