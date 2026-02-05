import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const tutorials = [
  {
    id: 'crdt',
    title: 'Local-First & CRDTs',
    description: 'Learn how VUDO enables offline-first, P2P applications using Conflict-free Replicated Data Types.',
    difficulty: 'Intermediate',
    duration: '25 min',
    tags: ['CRDT', 'P2P', 'Automerge', 'Local-First'],
    icon: '🔗',
    featured: true,
  },
  {
    id: 'thermodynamic-economics',
    title: 'Thermodynamic Economics',
    description: 'Calculate EROEI, analyze network topology, and understand energy constraints in distributed systems.',
    difficulty: 'Intermediate',
    duration: '20 min',
    tags: ['EROEI', 'Small-World', 'Energy', 'WASM'],
    icon: '⚡',
    featured: true,
  },
  {
    id: 'dol-basics',
    title: 'DOL Language Basics',
    description: 'Learn the fundamentals of the Design Ontology Language for building type-safe Spirits.',
    difficulty: 'Beginner',
    duration: '15 min',
    tags: ['DOL', 'Syntax', 'Types'],
    icon: '📜',
    featured: false,
    comingSoon: true,
  },
  {
    id: 'spirit-architecture',
    title: 'Spirit Architecture',
    description: 'Understand how Spirits compile from DOL to Rust to WASM and execute in the VUDO runtime.',
    difficulty: 'Advanced',
    duration: '30 min',
    tags: ['Spirits', 'WASM', 'Runtime'],
    icon: '🔮',
    featured: false,
    comingSoon: true,
  },
];

export function Learn() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-20">
      {/* Header */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
            Learn <span className="text-[#00ff88]">VUDO</span>
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl">
            Interactive tutorials that demonstrate the DOL → Rust → WASM pipeline.
            Build real Spirits while learning thermodynamic economics and network theory.
          </p>
        </motion.div>
      </section>

      {/* Tutorial Grid */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tutorials.map((tutorial, index) => (
            <motion.div
              key={tutorial.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {tutorial.comingSoon ? (
                <div className="h-full p-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] opacity-60">
                  <TutorialCardContent tutorial={tutorial} />
                  <div className="mt-4 inline-block px-3 py-1 rounded-full bg-white/10 text-white/50 text-xs">
                    Coming Soon
                  </div>
                </div>
              ) : (
                <Link
                  to={`/learn/${tutorial.id}`}
                  className="block h-full p-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] hover:border-[#00ff88]/50 hover:shadow-[0_0_30px_rgba(0,255,136,0.1)] transition-all duration-300 group"
                >
                  <TutorialCardContent tutorial={tutorial} />
                  <div className="mt-4 text-[#00ff88] text-sm group-hover:translate-x-1 transition-transform">
                    Start Tutorial →
                  </div>
                </Link>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pipeline Diagram */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="p-8 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)]"
        >
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">The Spirit Pipeline</h2>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center">
            <PipelineStep icon="📜" label="DOL Schema" sublabel="Type-safe definitions" />
            <Arrow />
            <PipelineStep icon="🦀" label="Rust Codegen" sublabel="Native performance" />
            <Arrow />
            <PipelineStep icon="📦" label="WASM Module" sublabel="56 KB bundle" />
            <Arrow />
            <PipelineStep icon="🌐" label="Browser/CLI" sublabel="Universal runtime" />
          </div>
        </motion.div>
      </section>
    </div>
  );
}

function TutorialCardContent({ tutorial }: { tutorial: typeof tutorials[0] }) {
  return (
    <>
      <div className="flex items-start justify-between mb-4">
        <span className="text-3xl">{tutorial.icon}</span>
        {tutorial.featured && (
          <span className="px-2 py-1 rounded-full bg-[#00ff88]/20 text-[#00ff88] text-xs font-medium">
            Featured
          </span>
        )}
      </div>
      <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
        {tutorial.title}
      </h3>
      <p className="text-sm text-[var(--text-secondary)] mb-4">
        {tutorial.description}
      </p>
      <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
        <span>{tutorial.difficulty}</span>
        <span>•</span>
        <span>{tutorial.duration}</span>
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        {tutorial.tags.map(tag => (
          <span key={tag} className="px-2 py-0.5 rounded bg-white/5 text-[var(--text-muted)] text-xs">
            {tag}
          </span>
        ))}
      </div>
    </>
  );
}

function PipelineStep({ icon, label, sublabel }: { icon: string; label: string; sublabel: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-3xl mb-2">{icon}</span>
      <span className="text-[var(--text-primary)] font-medium">{label}</span>
      <span className="text-xs text-[var(--text-muted)]">{sublabel}</span>
    </div>
  );
}

function Arrow() {
  return (
    <span className="text-[#00ff88] text-2xl hidden md:block">→</span>
  );
}
