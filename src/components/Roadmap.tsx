import { motion } from "framer-motion";
import { VevePattern } from "./VevePattern";

interface Milestone {
    quarter: string;
    title: string;
    description: string;
    status: "complete" | "current" | "future";
}

interface YearData {
    year: number;
    name: string;
    tagline: string;
    color: string;
    milestones: Milestone[];
}

const roadmapData: YearData[] = [
    {
        year: 1,
        name: "GENESIS",
        tagline: "The language that writes itself",
        color: "#00ff88",
        milestones: [
            {
                quarter: "Q1",
                title: "DOL Turing Extensions",
                description: "Types, control flow, functional composition",
                status: "complete",
            },
            {
                quarter: "Q2",
                title: "Meta-Programming",
                description: "Quote, eval, macros, reflection",
                status: "complete",
            },
            {
                quarter: "Q3",
                title: "Self-Hosting",
                description: "DOL v0.2.3 Stage2 - Full self-hosting: 1532 tests",
                status: "complete",
            },
            {
                quarter: "Q4",
                title: "WASM Pipeline",
                description: "DOL v0.6.0 - HIR + MLIR + WASM compilation: 1,705 tests",
                status: "complete",
            },
        ],
    },
    {
        year: 2,
        name: "MANIFESTATION",
        tagline: "The machine that runs Spirits",
        color: "#8b5cf6",
        milestones: [
            {
                quarter: "Q1",
                title: "VUDO VM",
                description: "WebAssembly sandbox, 6-state lifecycle, fuel metering",
                status: "complete",
            },
            {
                quarter: "Q2",
                title: "Spirit Runtime",
                description: "Manifest parsing, Ed25519 signatures, 15+ CLI commands",
                status: "complete",
            },
            {
                quarter: "Q3",
                title: "DOL → WASM Compiler",
                description: "Full compilation pipeline: DOL → HIR → WASM",
                status: "current",
            },
            {
                quarter: "Q4",
                title: "ENR Economic Layer",
                description: "Entropy-Nexus-Revival primitives for Spirit economics",
                status: "current",
            },
        ],
    },
    {
        year: 3,
        name: "EMERGENCE",
        tagline: "The garden that grows itself",
        color: "#fbbf24",
        milestones: [
            {
                quarter: "Q1",
                title: "Full Bootstrap",
                description: "DOL v0.7.0 - DOL compiles DOL to WASM (self-hosting complete)",
                status: "future",
            },
            {
                quarter: "Q2",
                title: "Mycelial Credits",
                description: "Creator economics, attribution chains",
                status: "future",
            },
            {
                quarter: "Q3",
                title: "Spirit Marketplace",
                description: "Discovery, ratings, remixing",
                status: "future",
            },
            {
                quarter: "Q4",
                title: "Imaginarium Launch",
                description: "The garden opens - distributed creativity platform",
                status: "future",
            },
        ],
    },
];

function MilestoneCard({
    milestone,
    color,
    index,
}: {
    milestone: Milestone;
    color: string;
    index: number;
}) {
    const isCurrent = milestone.status === "current";
    const isComplete = milestone.status === "complete";
    const isActive = isCurrent || isComplete;

    return (
        <motion.div
            className="relative pl-8 pb-8 last:pb-0"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
        >
            <div className="absolute left-[11px] top-6 bottom-0 w-px bg-white/10" />

            <div
                className="absolute left-0 top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center"
                style={{
                    borderColor: isActive ? color : "rgba(255,255,255,0.2)",
                    backgroundColor: isComplete ? color : isCurrent ? color + "20" : "transparent",
                }}
            >
                {isComplete && (
                    <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                )}
                {isCurrent && (
                    <motion.div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: color }}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                )}
            </div>

            <div className={isActive ? "opacity-100" : "opacity-60"}>
                <span
                    className="text-xs tracking-wider uppercase"
                    style={{ color }}
                >
                    {milestone.quarter} {isComplete && "✓"}
                </span>
                <h4 className="text-lg text-white mt-1">{milestone.title}</h4>
                <p className="text-sm text-white/50 mt-1">
                    {milestone.description}
                </p>
            </div>
        </motion.div>
    );
}

function YearSection({ data, index }: { data: YearData; index: number }) {
    const veveTypes: ("mitan" | "spirit" | "loa")[] = [
        "mitan",
        "spirit",
        "loa",
    ];

    return (
        <motion.div
            className="relative"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: index * 0.2 }}
        >
            <div className="flex items-center gap-6 mb-8">
                <VevePattern
                    type={veveTypes[index]}
                    size={60}
                    color={data.color}
                    delay={index * 0.3}
                />
                <div>
                    <h3
                        className="text-3xl font-light tracking-wider"
                        style={{ color: data.color }}
                    >
                        YEAR {data.year}: {data.name}
                    </h3>
                    <p className="text-white/50 italic mt-1">
                        &quot;{data.tagline}&quot;
                    </p>
                </div>
            </div>

            <div className="ml-6">
                {data.milestones.map((milestone, i) => (
                    <MilestoneCard
                        key={milestone.quarter}
                        milestone={milestone}
                        color={data.color}
                        index={i}
                    />
                ))}
            </div>
        </motion.div>
    );
}

export function Roadmap() {
    return (
        <section id="roadmap" className="relative py-32 px-6">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    className="text-center mb-20"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-sm tracking-[0.3em] uppercase text-[#fbbf24]/80 mb-4">
                        The Path to Imaginarium
                    </h2>
                    <p className="text-3xl md:text-4xl text-white/90 font-light">
                        Three years from seed to garden
                    </p>
                </motion.div>

                <div className="space-y-20">
                    {roadmapData.map((yearData, i) => (
                        <YearSection
                            key={yearData.year}
                            data={yearData}
                            index={i}
                        />
                    ))}
                </div>

                <motion.div
                    className="mt-20 text-center"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.5 }}
                >
                    <VevePattern
                        type="loa"
                        size={100}
                        color="#fbbf24"
                        className="mx-auto mb-6"
                        delay={1}
                    />
                    <p className="text-xl text-white/60 italic">
                        &quot;Systems designed to evolve and adapt to
                        change.&quot;
                    </p>
                </motion.div>
            </div>
        </section>
    );
}

export default Roadmap;
