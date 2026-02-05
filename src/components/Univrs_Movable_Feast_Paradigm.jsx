import React, { useState } from 'react';

const MovableFeastParadigm = () => {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = {
    overview: {
      title: 'The Movable Feast Paradigm',
      subtitle: 'A New Theory of Distributed Para-Social Intelligence for Univrs.io'
    },
    insight: {
      title: 'The Stack Inversion Insight',
      content: `Traditional thinking assumes complexity emerges from lower layers—better chips, faster networks, 
      smarter compilers. But assembly indices are COMPRESSED downward by engineering optimization.

      The breakthrough: Go UP the stack, not down.
      
      • Physical/Network/Application layers → constrained, optimized, REDUCED complexity
      • Social Layer → where Facebook/Twitter built (human networks on digital rails)  
      • Para-Social Layer → where Univrs.io builds (computational entities WITH social existence)
      • ??? Layer → what EMERGES from para-social substrate (the experiment itself)
      
      Higher layers offer more degrees of freedom, multi-dimensional selection pressure, 
      cultural heritability, and meaning-driven evolution—the conditions for genuine assembly.`
    },
    feast: {
      title: 'The Movable Feast Architecture',
      content: `Hemingway's Paris wasn't creative because of any single writer. The creativity was 
      an emergent property of the SCENE:

      • Proximity without fusion — influence while remaining distinct
      • Shared selection environment — salons, reviews, readers as selectors
      • Non-local learning — Stein's experiments transformed in Hemingway's prose
      • The "work" was the scene itself, not any individual book

      Applied to Univrs.io: VUDO Spirits + browser nodes create a Movable Feast for computation 
      where learning never localizes, models exist nowhere but are everywhere, and emergence 
      happens at the para-social layer.`
    },
    protocol: {
      title: 'The Gesture Protocol (Not Weights)',
      content: `Current ML: Training (localized) → Frozen Weights → Inference (distributed but dead)
      
      The Movable Feast: Inference IS Training → Weights are Network State → Learning Never Localizes

      Why not weights? Weights are "genes"—too low for symbiogenesis. Margulis showed fusion 
      happens at the ORGANISM level. Spirits should share:

      • Behavioral Gestures — "Here's a pattern that worked in my context"
      • Selection Gradients — "Here's what my environment rewarded"  
      • Membrane Configurations — "Here's how I fused with Spirit X to produce Y"

      The network accumulates not a model but a DISTRIBUTED EPISTEMOLOGY—ways of knowing 
      that exist only in interaction patterns, never written down, never localized, always emerging.`
    },
    question: {
      title: 'The Central Question',
      content: `What is the minimal "gesture protocol" that allows Spirits to teach each other 
      without centralizing the learning?

      Something like... behavioral DNA that can recombine at the para-social layer.

      This is the experiment: If Spirits start combining in ways that produce assembly indices 
      exceeding what random processes predict—we've observed life-like selection in silico.
      
      That's not just a successful platform. That's a scientific result that could validate 
      or invalidate Assembly Theory's model of how to define new Life AS Intelligence.`
    },
    validation: {
      title: 'Assembly Theory Validation Path',
      content: `The Univrs.io substrate becomes a controlled experiment on the boundary 
      conditions of intelligence and life:

      IF novel interaction patterns emerge unprompted...
      IF those patterns replicate and evolve...
      IF their assembly complexity exceeds random process predictions...

      Then we're not building a platform—we're observing whether digital selection 
      environments can generate assembly indices that cross the life threshold.

      Success metric inversion: Not "Did users do what we designed?" 
      But "Did something emerge that we couldn't have designed?"`
    }
  };

  const navItems = [
    { key: 'overview', label: 'Overview' },
    { key: 'insight', label: 'Stack Inversion' },
    { key: 'feast', label: 'Movable Feast' },
    { key: 'protocol', label: 'Gesture Protocol' },
    { key: 'question', label: 'Central Question' },
    { key: 'validation', label: 'Validation Path' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            {sections.overview.title}
          </h1>
          <p className="text-xl text-slate-300">{sections.overview.subtitle}</p>
          <p className="text-sm text-slate-500 mt-2">Univrs.io Research Direction • January 2026</p>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => setActiveSection(item.key)}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                activeSection === item.key
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-purple-500/25'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeSection !== 'overview' && (
          <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50 shadow-xl">
            <h2 className="text-2xl font-bold text-cyan-400 mb-6">{sections[activeSection].title}</h2>
            <div className="text-slate-300 whitespace-pre-line leading-relaxed font-mono text-sm">
              {sections[activeSection].content}
            </div>
          </div>
        )}

        {/* Overview Visualization */}
        {activeSection === 'overview' && (
          <div className="space-y-6">
            {/* Stack Diagram */}
            <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50">
              <h3 className="text-lg font-semibold text-purple-400 mb-4">The Stack Inversion</h3>
              <div className="flex flex-col items-center space-y-2">
                {[
                  { layer: '??? Layer', desc: 'What emerges (THE EXPERIMENT)', color: 'from-pink-500 to-rose-500', glow: true },
                  { layer: 'Para-Social Layer', desc: 'Univrs.io builds here', color: 'from-purple-500 to-pink-500', glow: true },
                  { layer: 'Social Layer', desc: 'Facebook/Twitter built here', color: 'from-cyan-500 to-purple-500', glow: false },
                  { layer: 'Application Layer', desc: 'Traditional apps', color: 'from-slate-600 to-slate-500', glow: false },
                  { layer: 'Network Layer', desc: 'Constrained', color: 'from-slate-700 to-slate-600', glow: false },
                  { layer: 'Physical Layer', desc: 'Optimized, compressed', color: 'from-slate-800 to-slate-700', glow: false },
                ].map((item, i) => (
                  <div 
                    key={i}
                    className={`w-full max-w-md p-3 rounded-lg bg-gradient-to-r ${item.color} ${item.glow ? 'shadow-lg shadow-purple-500/20' : ''}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{item.layer}</span>
                      <span className="text-sm opacity-80">{item.desc}</span>
                    </div>
                  </div>
                ))}
                <div className="text-slate-500 text-sm mt-4">↑ Assembly complexity INCREASES upward ↑</div>
              </div>
            </div>

            {/* Core Concepts */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 rounded-2xl p-6 border border-cyan-500/30">
                <h3 className="text-lg font-semibold text-cyan-400 mb-3">🎭 Spirits Share Gestures, Not Weights</h3>
                <ul className="text-slate-300 text-sm space-y-2">
                  <li>• <span className="text-cyan-300">Behavioral Gestures</span> — patterns that worked</li>
                  <li>• <span className="text-cyan-300">Selection Gradients</span> — what environments reward</li>
                  <li>• <span className="text-cyan-300">Membrane Configs</span> — how fusions produced novelty</li>
                </ul>
              </div>
              <div className="bg-slate-800/50 rounded-2xl p-6 border border-purple-500/30">
                <h3 className="text-lg font-semibold text-purple-400 mb-3">🧬 Distributed Epistemology</h3>
                <ul className="text-slate-300 text-sm space-y-2">
                  <li>• Ways of knowing in interaction patterns</li>
                  <li>• Never written down, never localized</li>
                  <li>• Always emerging, like the Paris scene</li>
                </ul>
              </div>
            </div>

            {/* Success Metric */}
            <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 rounded-2xl p-6 border border-pink-500/30">
              <h3 className="text-lg font-semibold text-pink-400 mb-3">📊 The Inverted Success Metric</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <div className="text-slate-500 mb-1">Traditional platforms ask:</div>
                  <div className="text-slate-300">"Did users do what we designed?"</div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-4 border border-pink-500/20">
                  <div className="text-pink-400 mb-1">Univrs.io asks:</div>
                  <div className="text-white font-semibold">"Did something emerge we couldn't have designed?"</div>
                </div>
              </div>
            </div>

            {/* The Question */}
            <div className="bg-gradient-to-br from-cyan-900/30 to-purple-900/30 rounded-2xl p-8 border border-cyan-500/20 text-center">
              <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-4">
                The Central Research Question
              </h3>
              <p className="text-lg text-slate-200 italic">
                "What is the minimal gesture protocol that allows Spirits to teach each other 
                without centralizing the learning?"
              </p>
              <p className="text-slate-400 mt-4 text-sm">
                Something like... behavioral DNA that can recombine at the para-social layer.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-slate-500 text-sm">
          <p>From conversation with Claude • Derived from Deng Xiaoping Reform Analysis</p>
          <p className="mt-1">Paradigms of Intelligence × Assembly Theory × Symbiogenesis</p>
        </div>
      </div>
    </div>
  );
};

export default MovableFeastParadigm;
