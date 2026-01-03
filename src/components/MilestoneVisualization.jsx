import React, { useState } from 'react';

const MilestoneVisualization = () => {
  const [activePhase, setActivePhase] = useState(4);
  
  const phases = [
    { id: 1, name: "Parser", status: "complete", tests: 150, color: "#22c55e" },
    { id: 2, name: "HIR + VM", status: "complete", tests: 868, color: "#22c55e" },
    { id: 3, name: "MLIR → WASM", status: "complete", tests: 50, color: "#22c55e" },
    { id: 4, name: "ENR Network", status: "active", tests: 0, color: "#f59e0b" },
    { id: 5, name: "Imaginarium", status: "pending", tests: 0, color: "#6b7280" },
  ];
  
  const enrSubsystems = [
    { name: "Core", icon: "💎", status: "active", desc: "Credits, NodeId, State Machine" },
    { name: "Entropy", icon: "🔥", status: "active", desc: "Sₙ + Sᶜ + Sˢ + Sᵗ" },
    { name: "Nexus", icon: "🕸️", status: "active", desc: "Topology, Election, Market" },
    { name: "Revival", icon: "♻️", status: "pending", desc: "Decomposition, Redistribution" },
    { name: "Septal", icon: "🛡️", status: "pending", desc: "Circuit Breaker, Woronin" },
  ];
  
  const repos = [
    { name: "univrs-dol", status: "✅", desc: "Compiler Pipeline" },
    { name: "univrs-enr", status: "🔄", desc: "ENR Economic Layer" },
    { name: "univrs-network", status: "🔄", desc: "P2P Networking" },
    { name: "univrs-vudo", status: "✅", desc: "VM + Runtime" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8 text-white">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="text-6xl mb-4">🍄</div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          UNIVRS.IO MILESTONE
        </h1>
        <p className="text-xl text-gray-400 mt-2">December 28, 2025</p>
        <div className="mt-4 inline-block px-6 py-2 bg-green-500/20 border border-green-500 rounded-full">
          <span className="text-green-400 font-mono">Phase 3 Complete: DOL → WASM Pipeline Working</span>
        </div>
      </div>

      {/* Proof Section */}
      <div className="max-w-2xl mx-auto mb-12 bg-black/40 rounded-xl p-6 border border-green-500/30">
        <div className="font-mono text-sm">
          <div className="text-gray-500">$ wasmtime run --invoke add add.wasm 5 7</div>
          <div className="text-green-400 text-3xl font-bold mt-2">12</div>
          <div className="text-gray-500 mt-2 text-xs">
            valid WASM • 50 tests passing • feature/mlir-wasm pushed
          </div>
        </div>
      </div>

      {/* Phase Timeline */}
      <div className="max-w-4xl mx-auto mb-12">
        <h2 className="text-xl font-semibold mb-6 text-center">Development Timeline</h2>
        <div className="flex justify-between items-center">
          {phases.map((phase, idx) => (
            <div key={phase.id} className="flex items-center">
              <button
                onClick={() => setActivePhase(phase.id)}
                className={`relative flex flex-col items-center ${activePhase === phase.id ? 'scale-110' : ''} transition-transform`}
              >
                <div 
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold border-4 ${
                    phase.status === 'complete' ? 'bg-green-500/20 border-green-500' :
                    phase.status === 'active' ? 'bg-amber-500/20 border-amber-500 animate-pulse' :
                    'bg-gray-700/20 border-gray-600'
                  }`}
                >
                  {phase.status === 'complete' ? '✓' : phase.id}
                </div>
                <div className="mt-2 text-sm font-medium">{phase.name}</div>
                <div className="text-xs text-gray-500">{phase.tests} tests</div>
              </button>
              {idx < phases.length - 1 && (
                <div className={`w-16 h-1 mx-2 ${
                  phases[idx + 1].status === 'complete' || phases[idx + 1].status === 'active' 
                    ? 'bg-green-500' : 'bg-gray-600'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Repository Status */}
      <div className="max-w-4xl mx-auto mb-12">
        <h2 className="text-xl font-semibold mb-6 text-center">Repository Ecosystem</h2>
        <div className="grid grid-cols-4 gap-4">
          {repos.map(repo => (
            <div key={repo.name} className="bg-black/30 rounded-lg p-4 border border-purple-500/30">
              <div className="text-2xl mb-2">{repo.status}</div>
              <div className="font-mono text-sm text-purple-300">{repo.name}</div>
              <div className="text-xs text-gray-500 mt-1">{repo.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ENR Subsystems (Phase 4 Detail) */}
      <div className="max-w-4xl mx-auto mb-12">
        <h2 className="text-xl font-semibold mb-6 text-center">
          Phase 4: ENR Subsystems
          <span className="text-sm text-amber-400 ml-2">(Active)</span>
        </h2>
        <div className="grid grid-cols-5 gap-4">
          {enrSubsystems.map(sys => (
            <div 
              key={sys.name}
              className={`bg-black/30 rounded-lg p-4 border text-center ${
                sys.status === 'active' ? 'border-amber-500/50' : 'border-gray-600/30'
              }`}
            >
              <div className="text-3xl mb-2">{sys.icon}</div>
              <div className="font-semibold">{sys.name}</div>
              <div className="text-xs text-gray-500 mt-1">{sys.desc}</div>
              <div className={`text-xs mt-2 ${
                sys.status === 'active' ? 'text-amber-400' : 'text-gray-600'
              }`}>
                {sys.status === 'active' ? '● Building' : '○ Queued'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Architecture Stack */}
      <div className="max-w-3xl mx-auto mb-12">
        <h2 className="text-xl font-semibold mb-6 text-center">The Stack</h2>
        <div className="space-y-2">
          {[
            { name: "Applications", desc: "Spirits, User Apps", status: "pending" },
            { name: "Imaginarium", desc: "Discovery, Marketplace", status: "pending" },
            { name: "Pricing", desc: "Fixed / Dynamic / Auction", status: "pending" },
            { name: "ENR Layer", desc: "Entropy • Nexus • Revival", status: "active" },
            { name: "Network", desc: "P2P, Chitchat Gossip", status: "ready" },
            { name: "Compiler", desc: "DOL → HIR → MLIR → WASM", status: "complete" },
            { name: "Runtime", desc: "VUDO VM, Sandbox, Fuel", status: "complete" },
          ].map((layer, idx) => (
            <div 
              key={layer.name}
              className={`p-4 rounded-lg border flex justify-between items-center ${
                layer.status === 'complete' ? 'bg-green-500/10 border-green-500/50' :
                layer.status === 'active' ? 'bg-amber-500/10 border-amber-500/50' :
                layer.status === 'ready' ? 'bg-blue-500/10 border-blue-500/50' :
                'bg-gray-800/50 border-gray-600/30'
              }`}
            >
              <div>
                <span className="font-semibold">{layer.name}</span>
                <span className="text-gray-500 ml-3 text-sm">{layer.desc}</span>
              </div>
              <div className={`text-sm ${
                layer.status === 'complete' ? 'text-green-400' :
                layer.status === 'active' ? 'text-amber-400' :
                layer.status === 'ready' ? 'text-blue-400' :
                'text-gray-500'
              }`}>
                {layer.status === 'complete' ? '✓ Complete' :
                 layer.status === 'active' ? '● Building' :
                 layer.status === 'ready' ? '◐ Ready' : '○ Pending'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quote */}
      <div className="max-w-2xl mx-auto text-center">
        <blockquote className="text-2xl italic text-purple-300">
          "The network is not pipes. It is a living market."
        </blockquote>
        <p className="text-gray-500 mt-4">— ENR Architecture</p>
      </div>

      {/* Footer */}
      <div className="text-center mt-12 text-gray-600 text-sm">
        <p>Mycelial Economics • Data Sovereignty • Digital Democracy</p>
        <p className="mt-2 font-mono">branch: feature/mlir-wasm → main</p>
      </div>
    </div>
  );
};

export default MilestoneVisualization;
