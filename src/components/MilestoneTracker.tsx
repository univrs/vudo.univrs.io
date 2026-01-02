import { useState } from "react";
import { motion } from "framer-motion";
import { VevePattern } from "./VevePattern";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface Phase {
    id: string;
    name: string;
    status: "complete" | "active" | "pending";
    tests: number;
    description: string;
    deliverables: string[];
}

interface Repository {
    name: string;
    url: string;
    status: "stable" | "active" | "pending";
    tests: number;
}

interface ENRSubsystem {
    name: string;
    status: "complete" | "active" | "pending";
    dolLines: number;
    formula?: string;
}

// User/Adoption metrics - showing the gaps honestly
interface AdoptionMetrics {
    productionDeployments: number;
    externalContributors: number;
    githubStars: number;
    npmDownloads: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════════════════

const phases: Phase[] = [
    {
        id: "phase1",
        name: "Phase 1: Parser + Lexer",
        status: "complete",
        tests: 150,
        description: "DOL language parsing foundation",
        deliverables: ["Lexer", "Parser", "AST", "Error recovery"],
    },
    {
        id: "phase2a",
        name: "Phase 2a: HIR v0.4.0",
        status: "complete",
        tests: 466,
        description: "High-level Intermediate Representation",
        deliverables: ["HirModule", "HirDecl", "HirExpr", "Type system"],
    },
    {
        id: "phase2b",
        name: "Phase 2b: VUDO VM",
        status: "complete",
        tests: 402,
        description: "WebAssembly virtual machine",
        deliverables: ["Wasmtime runtime", "Sandbox", "Fuel metering", "Host functions"],
    },
    {
        id: "phase2c",
        name: "Phase 2c: Spirit Runtime",
        status: "complete",
        tests: 50,
        description: "Capability-based agent system",
        deliverables: ["Spirit registry", "Manifest", "Capabilities", "Lifecycle"],
    },
    {
        id: "phase3",
        name: "Phase 3: MLIR + WASM Pipeline",
        status: "complete",
        tests: 50,
        description: "DOL -> HIR -> MLIR -> WASM compilation",
        deliverables: ["MLIR lowering", "WASM backend", "add.wasm validated"],
    },
    {
        id: "phase4a",
        name: "Phase 4a: Hyphal Network",
        status: "complete",
        tests: 38,
        description: "Biology-inspired distributed patterns",
        deliverables: ["Topology", "Discovery", "Growth", "Swarm coordinator"],
    },
    {
        id: "phase4b",
        name: "Phase 4b: ENR Economic Layer",
        status: "active",
        tests: 0,
        description: "Entropy-Nexus-Revival primitives",
        deliverables: ["Core types", "Entropy calculator", "Nexus topology", "Revival pool"],
    },
];

const repositories: Repository[] = [
    { name: "univrs-dol", url: "https://github.com/univrs/univrs-dol", status: "stable", tests: 454 },
    { name: "univrs-enr", url: "https://github.com/univrs/univrs-enr", status: "active", tests: 0 },
    { name: "univrs-network", url: "https://github.com/univrs/univrs-network", status: "pending", tests: 0 },
    { name: "univrs-vudo", url: "https://github.com/univrs/univrs-vudo", status: "stable", tests: 402 },
];

const enrSubsystems: ENRSubsystem[] = [
    { name: "Core", status: "active", dolLines: 529, formula: "Credits, NodeId, CreditTransfer" },
    { name: "Entropy", status: "pending", dolLines: 405, formula: "S = wn*Sn + wc*Sc + ws*Ss + wt*St" },
    { name: "Nexus", status: "pending", dolLines: 525, formula: "Election, Gradient Aggregation" },
    { name: "Revival", status: "pending", dolLines: 521, formula: "40% / 25% / 20% / 15%" },
    { name: "Septal", status: "pending", dolLines: 463, formula: "Circuit Breaker, Woronin" },
    { name: "Pricing", status: "pending", dolLines: 651, formula: "Fixed / Dynamic / Auction" },
];

// Adoption metrics - the gaps we're showing honestly
// "The dashboard shows 6/7 phases. The critique shows 0/1 users."
const adoption: AdoptionMetrics = {
    productionDeployments: 0,
    externalContributors: 0,
    githubStars: 0,
    npmDownloads: 0,
};

// ═══════════════════════════════════════════════════════════════════════════
// STATUS INDICATOR
// ═══════════════════════════════════════════════════════════════════════════

function StatusDot({ status }: { status: "complete" | "active" | "pending" | "stable" }) {
    const colors = {
        complete: "#00ff88",
        stable: "#00ff88",
        active: "#fbbf24",
        pending: "rgba(255,255,255,0.3)",
    };

    return (
        <div className="relative flex-shrink-0">
            <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors[status] }}
            />
            {status === "active" && (
                <motion.div
                    className="absolute inset-0 w-3 h-3 rounded-full"
                    style={{ backgroundColor: colors[status] }}
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function MilestoneTracker() {
    const [activeTab, setActiveTab] = useState<"phases" | "repos" | "enr">("phases");

    const totalTests = phases.reduce((sum, p) => sum + p.tests, 0);
    const completedPhases = phases.filter((p) => p.status === "complete").length;
    const totalDolLines = enrSubsystems.reduce((sum, s) => sum + s.dolLines, 0);

    return (
        <section id="milestones" className="relative py-16 md:py-32 px-4 md:px-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <motion.div
                    className="text-center mb-10 md:mb-16"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-xs md:text-sm tracking-[0.2em] md:tracking-[0.3em] uppercase text-[#00ff88]/80 mb-3 md:mb-4">
                        Development Progress
                    </h2>
                    <p className="text-xl md:text-2xl lg:text-3xl text-[var(--text-primary)] font-light">
                        The network is not pipes. It is a{" "}
                        <span className="text-[#00ff88]">living market</span>.
                    </p>
                </motion.div>

                {/* Builder Stats */}
                <motion.div
                    className="flex flex-wrap justify-center gap-6 md:gap-12 mb-6"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="text-center">
                        <div className="text-2xl md:text-3xl font-light text-[#00ff88]">
                            {completedPhases}/{phases.length}
                        </div>
                        <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
                            Phases
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl md:text-3xl font-light text-[#00ff88]">
                            {totalTests.toLocaleString()}
                        </div>
                        <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
                            Tests
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl md:text-3xl font-light text-[#fbbf24]">
                            {totalDolLines.toLocaleString()}
                        </div>
                        <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
                            DOL Lines
                        </div>
                    </div>
                </motion.div>

                {/* User/Adoption Stats - showing the gaps honestly */}
                <motion.div
                    className="flex flex-wrap justify-center gap-6 md:gap-12 mb-10 md:mb-12 py-4 border-t border-b border-white/10"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="text-center">
                        <div className="text-2xl md:text-3xl font-light text-white/40">
                            {adoption.productionDeployments}/1
                        </div>
                        <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
                            Production
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl md:text-3xl font-light text-white/40">
                            {adoption.externalContributors}
                        </div>
                        <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
                            External Contributors
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl md:text-3xl font-light text-white/40">
                            {adoption.githubStars}
                        </div>
                        <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
                            GitHub Stars
                        </div>
                    </div>
                </motion.div>

                {/* Tabs */}
                <div className="flex justify-center gap-2 mb-8">
                    {(["phases", "repos", "enr"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 text-sm rounded-full border transition-all ${
                                activeTab === tab
                                    ? "bg-[#00ff88]/15 border-[#00ff88] text-[#00ff88]"
                                    : "border-white/20 text-white/60 hover:border-white/40"
                            }`}
                        >
                            {tab === "phases" && "Phases"}
                            {tab === "repos" && "Repos"}
                            {tab === "enr" && "ENR"}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeTab === "phases" && (
                        <div className="space-y-4">
                            {phases.map((phase, i) => (
                                <motion.div
                                    key={phase.id}
                                    className="p-4 md:p-5 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg hover:border-[#00ff88]/30 transition-colors"
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <StatusDot status={phase.status} />
                                        <span className="font-medium text-[var(--text-primary)] flex-1">
                                            {phase.name}
                                        </span>
                                        <span className="text-xs text-[#00ff88] bg-[#00ff88]/10 px-2 py-1 rounded">
                                            {phase.tests} tests
                                        </span>
                                    </div>
                                    <p className="text-sm text-[var(--text-muted)] mb-3 ml-6">
                                        {phase.description}
                                    </p>
                                    <div className="flex flex-wrap gap-2 ml-6">
                                        {phase.deliverables.map((d) => (
                                            <span
                                                key={d}
                                                className="text-xs bg-white/5 px-2 py-1 rounded text-white/60"
                                            >
                                                {d}
                                            </span>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {activeTab === "repos" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {repositories.map((repo, i) => (
                                <motion.a
                                    key={repo.name}
                                    href={repo.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-4 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg hover:border-[#00ff88]/30 transition-all"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <StatusDot status={repo.status} />
                                    <span className="font-mono text-sm text-[var(--text-primary)] flex-1">
                                        {repo.name}
                                    </span>
                                    <span className="text-xs text-[#00ff88]">
                                        {repo.tests} tests
                                    </span>
                                </motion.a>
                            ))}
                        </div>
                    )}

                    {activeTab === "enr" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {enrSubsystems.map((sys, i) => (
                                <motion.div
                                    key={sys.name}
                                    className="p-4 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <StatusDot status={sys.status} />
                                        <span className="font-medium text-[var(--text-primary)]">
                                            {sys.name}
                                        </span>
                                    </div>
                                    {sys.formula && (
                                        <code className="block text-xs text-[#00ffcc] bg-[#00ff88]/5 p-2 rounded mb-2 font-mono overflow-hidden text-ellipsis whitespace-nowrap">
                                            {sys.formula}
                                        </code>
                                    )}
                                    <span className="text-xs text-[var(--text-muted)]">
                                        {sys.dolLines} DOL lines
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Footer */}
                <motion.div
                    className="mt-12 text-center"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                >
                    <VevePattern
                        type="mitan"
                        size={40}
                        className="mx-auto mb-4"
                        delay={0.5}
                    />
                    <p className="text-xs text-[var(--text-muted)]">
                        Last updated: {new Date().toLocaleDateString()}
                    </p>
                </motion.div>
            </div>
        </section>
    );
}

export default MilestoneTracker;
