/**
 * VUDO OS - Physarum Section Component
 *
 * A complete landing page section showcasing the Physarum decision network.
 * Drop this into the vudo.univrs.io site as a demonstration of
 * biological computing principles in action.
 *
 * Usage:
 *   import { PhysarumSection } from './components/PhysarumSection';
 *   // In your App.tsx or page component:
 *   <PhysarumSection />
 */

import React, { useState, useCallback } from "react";
import { PhysarumDemo } from "./PhysarumDemo";
import type { NetworkMetrics } from "../PhysarumEngine";
import "../physarum.css";

// ═══════════════════════════════════════════════════════════════════════════
// SECTION COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const PhysarumSection: React.FC = () => {
    const [metrics, setMetrics] = useState<NetworkMetrics | null>(null);

    const handleMetricsUpdate = useCallback((newMetrics: NetworkMetrics) => {
        setMetrics(newMetrics);
    }, []);

    return (
        <section className="physarum-section" id="physarum">
            {/* Section Header */}
            <div className="section-header">
                <span className="section-eyebrow">Live Demo</span>
                <h2 className="section-title">The Mycelial Network</h2>
                <p className="section-subtitle">
                    Watch Physarum polycephalum — the slime mold that computes —
                    find optimal paths through a distributed network. No central
                    coordinator. Just emergent intelligence.
                </p>
            </div>

            {/* Demo Container */}
            <div className="demo-container">
                <PhysarumDemo
                    className="demo-instance"
                    config={{
                        scenario: "migration",
                        nodeCount: 7,
                        initialConnectivity: 0.5,
                        dynamicGradients: true,
                        showLabels: true,
                        showMetrics: true,
                    }}
                    onMetricsUpdate={handleMetricsUpdate}
                />
            </div>

            {/* Explanation Cards */}
            <div className="explanation-grid">
                <div className="explanation-card">
                    <div className="card-icon">🌿</div>
                    <h3>Murray's Law</h3>
                    <p>
                        Tubes thicken proportionally to flow<sup>1/3</sup> — the
                        same principle that governs blood vessels and tree
                        branches. Optimal transport with minimal cost.
                    </p>
                </div>

                <div className="explanation-card">
                    <div className="card-icon">⚡</div>
                    <h3>Gradient Following</h3>
                    <p>
                        The network extends toward resource gradients, just like
                        mycelium grows toward nutrients. Information flows
                        downhill.
                    </p>
                </div>

                <div className="explanation-card">
                    <div className="card-icon">🔄</div>
                    <h3>Self-Healing</h3>
                    <p>
                        Remove a node, and the network reconfigures. Unused
                        tubes prune themselves. The organism <em>is</em> the
                        algorithm.
                    </p>
                </div>

                <div className="explanation-card">
                    <div className="card-icon">🌐</div>
                    <h3>No Coordinator</h3>
                    <p>
                        There's no central brain directing traffic. Each tube
                        responds to local pressure differences. Emergence
                        without control.
                    </p>
                </div>
            </div>

            {/* Connection to VUDO */}
            <div className="vudo-connection">
                <div className="connection-content">
                    <h3>How VUDO Uses This</h3>
                    <div className="connection-list">
                        <div className="connection-item">
                            <span className="connection-label">Nodes</span>
                            <span className="connection-arrow">→</span>
                            <span className="connection-value">
                                VUDO Spirits (packages)
                            </span>
                        </div>
                        <div className="connection-item">
                            <span className="connection-label">Tubes</span>
                            <span className="connection-arrow">→</span>
                            <span className="connection-value">
                                Network connections
                            </span>
                        </div>
                        <div className="connection-item">
                            <span className="connection-label">Flow</span>
                            <span className="connection-arrow">→</span>
                            <span className="connection-value">
                                Mycelial Credits
                            </span>
                        </div>
                        <div className="connection-item">
                            <span className="connection-label">Gradients</span>
                            <span className="connection-arrow">→</span>
                            <span className="connection-value">
                                Compute/storage availability
                            </span>
                        </div>
                    </div>
                    <p className="connection-quote">"The network IS Bondye."</p>
                </div>
            </div>

            {/* Technical Specs (collapsed by default) */}
            <details className="tech-specs">
                <summary>Technical Specifications</summary>
                <div className="specs-content">
                    <div className="spec-group">
                        <h4>Simulation</h4>
                        <ul>
                            <li>60 FPS physics simulation</li>
                            <li>Hagen-Poiseuille flow dynamics</li>
                            <li>Murray's Law tube adaptation</li>
                            <li>Exponential gradient decay (τ=30s)</li>
                        </ul>
                    </div>
                    <div className="spec-group">
                        <h4>Rendering</h4>
                        <ul>
                            <li>Three.js WebGL engine</li>
                            <li>Custom GLSL shaders</li>
                            <li>Unreal bloom post-processing</li>
                            <li>Instanced rendering for performance</li>
                        </ul>
                    </div>
                    <div className="spec-group">
                        <h4>Future: P2P Integration</h4>
                        <ul>
                            <li>OpenRaft consensus for credits</li>
                            <li>Chitchat gossip for gradients</li>
                            <li>Ed25519 node identity</li>
                            <li>WebSocket real-time updates</li>
                        </ul>
                    </div>
                </div>
            </details>
        </section>
    );
};

export default PhysarumSection;
