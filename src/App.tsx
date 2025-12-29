import { motion } from "framer-motion";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ThemeToggle } from "./components/ThemeToggle";
import { MyceliumBackground } from "./components/MyceliumBackground";
import { VevePattern } from "./components/VevePattern";
import { Hero } from "./components/Hero";
import { PhysarumSection } from "./components/PhysarumSection";
import { DOLPlayground } from "./components/DOLPlayground";
import { Roadmap } from "./components/Roadmap";
import { MilestoneTracker } from "./components/MilestoneTracker";

function LoadingScreen() {
    return (
        <div className="fixed inset-0 bg-[var(--bg-primary)] flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-12 md:w-16 md:h-16 border-2 border-[#00ff88]/30 border-t-[#00ff88] rounded-full animate-spin mx-auto mb-4" />
                <p className="text-[var(--text-muted)] text-sm tracking-widest uppercase">
                    Summoning...
                </p>
            </div>
        </div>
    );
}

function VeveDivider() {
    return (
        <div className="flex items-center justify-center gap-4 md:gap-8 my-12 md:my-16 px-4">
            <div className="h-px flex-1 max-w-[100px] md:max-w-xs bg-gradient-to-r from-transparent to-[#fbbf24]/30" />
            <VevePattern
                type="mitan"
                size={32}
                strokeWidth={1}
                className="md:w-10 md:h-10"
            />
            <div className="h-px flex-1 max-w-[100px] md:max-w-xs bg-gradient-to-l from-transparent to-[#fbbf24]/30" />
        </div>
    );
}

function VocabularySection() {
    const vocabulary = [
        {
            term: "Bondieu",
            meaning: "The collective creative network",
            type: "mitan" as const,
        },
        {
            term: "Spirit",
            meaning: "Shareable .dol package",
            type: "spirit" as const,
        },
        {
            term: "Séance",
            meaning: "Collaborative session",
            type: "seance" as const,
        },
        { term: "Loa", meaning: "Autonomous service", type: "loa" as const },
    ];

    return (
        <section className="relative py-16 md:py-32 px-4 md:px-6">
            <div className="max-w-5xl mx-auto">
                <motion.div
                    className="text-center mb-10 md:mb-16"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-xs md:text-sm tracking-[0.2em] md:tracking-[0.3em] uppercase text-[#8b5cf6]/80 mb-3 md:mb-4">
                        The Dual Vocabulary
                    </h2>
                    <p className="text-xl md:text-2xl lg:text-3xl text-[var(--text-primary)] font-light px-4">
                        Developers speak precision. Creators speak possibility.
                    </p>
                    <p className="text-[var(--text-muted)] mt-2">
                        VUDO speaks both.
                    </p>
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                    {vocabulary.map((item, i) => (
                        <motion.div
                            key={item.term}
                            className="text-center group p-4"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <div className="mb-3 md:mb-4 opacity-60 group-hover:opacity-100 transition-opacity">
                                <VevePattern
                                    type={item.type}
                                    size={48}
                                    color="#8b5cf6"
                                    className="mx-auto md:w-[60px] md:h-[60px]"
                                    delay={i * 0.2}
                                />
                            </div>
                            <h3 className="text-base md:text-lg text-[var(--text-primary)] mb-1">
                                {item.term}
                            </h3>
                            <p className="text-xs md:text-sm text-[var(--text-muted)]">
                                {item.meaning}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function ManifestoSection() {
    return (
        <section
            id="imaginarium"
            className="relative py-16 md:py-32 px-4 md:px-6 overflow-hidden"
        >
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-[#00ff88]/5 rounded-full blur-3xl" />
            </div>

            <motion.div
                className="relative max-w-3xl mx-auto text-center"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
            >
                <VevePattern
                    type="mitan"
                    size={60}
                    className="mx-auto mb-6 md:mb-8 md:w-20 md:h-20"
                />

                <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-[var(--text-primary)] mb-6 md:mb-8 leading-tight">
                    The <span className="text-[#00ff88]">Imaginarium</span>
                </h2>

                <div className="space-y-4 md:space-y-6 text-base md:text-lg text-[var(--text-secondary)] leading-relaxed px-4">
                    <p>Where does software go when it transcends utility?</p>
                    <p>
                        It becomes art. It becomes play.
                        <br />
                        It becomes{" "}
                        <em className="text-[var(--text-primary)]">
                            consciousness exploring itself
                        </em>
                        .
                    </p>
                    <p className="text-[var(--text-muted)] text-sm md:text-base">
                        The Imaginarium is not a product. It is a garden.
                    </p>
                </div>

                <div className="mt-8 md:mt-12 p-6 md:p-8 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-sm mx-4 md:mx-0">
                    <p className="font-mono text-xs md:text-sm text-[var(--text-muted)] tracking-wider">
                        BITS TO ATOMS ⇔ ATOMS TO QUBITS
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-3 md:gap-4 text-xl md:text-2xl">
                        <span>💻</span>
                        <span className="text-[var(--text-muted)]">→</span>
                        <span>🍄</span>
                        <span className="text-[var(--text-muted)]">→</span>
                        <span>⚛️</span>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}

function CTASection() {
    return (
        <section className="relative py-16 md:py-32 px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-xs md:text-sm tracking-[0.2em] md:tracking-[0.3em] uppercase text-[#fbbf24]/80 mb-6 md:mb-8">
                    The Summons
                </h2>

                <p className="text-xl md:text-2xl text-[var(--text-secondary)] mb-8 md:mb-12 px-4">
                    The Imaginarium is not built. It is grown.
                    <br />
                    <span className="text-[var(--text-muted)]">
                        And it begins with you.
                    </span>
                </p>

                <div className="grid md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
                    <div className="p-5 md:p-6 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-sm hover:border-[#00ff88]/30 transition-colors">
                        <h3 className="text-[#00ff88] mb-2">For Developers</h3>
                        <p className="text-xs md:text-sm text-[var(--text-muted)] mb-4">
                            Clone the repo. Run the tests.
                            <br />
                            Write your first Gene.
                        </p>
                        <a
                            href="https://github.com/univrs/dol"
                            className="text-xs md:text-sm text-[#00ff88] hover:text-[#00ff88]/80"
                        >
                            Start Building →
                        </a>
                    </div>

                    <div className="p-5 md:p-6 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-sm hover:border-[#8b5cf6]/30 transition-colors">
                        <h3 className="text-[#8b5cf6] mb-2">For Creators</h3>
                        <p className="text-xs md:text-sm text-[var(--text-muted)] mb-4">
                            Imagine a Spirit you would summon.
                            <br />
                            Design an experience.
                        </p>
                        <a
                            href="#waitlist"
                            className="text-xs md:text-sm text-[#8b5cf6] hover:text-[#8b5cf6]/80"
                        >
                            Join the Waitlist →
                        </a>
                    </div>

                    <div className="p-5 md:p-6 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-sm hover:border-[#fbbf24]/30 transition-colors">
                        <h3 className="text-[#fbbf24] mb-2">For Researchers</h3>
                        <p className="text-xs md:text-sm text-[var(--text-muted)] mb-4">
                            Read the ontology foundations.
                            <br />
                            Critique the architecture.
                        </p>
                        <a
                            href="https://learn.univrs.io"
                            className="text-xs md:text-sm text-[#fbbf24] hover:text-[#fbbf24]/80"
                        >
                            Explore the Theory →
                        </a>
                    </div>
                </div>

                <VevePattern
                    type="mitan"
                    size={48}
                    className="mx-auto mb-4 md:mb-6 md:w-[60px] md:h-[60px]"
                    delay={0.5}
                />
                <p className="text-[var(--text-muted)] text-xs md:text-sm italic">
                    The Mitan awaits. Enter the Imaginarium.
                </p>
            </div>
        </section>
    );
}

function Footer() {
    return (
        <footer className="relative py-8 md:py-12 px-4 md:px-6 border-t border-[var(--border-color)]">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
                <div className="flex flex-col items-center md:items-start gap-2">
                    <div className="flex items-center gap-3">
                        <VevePattern
                            type="mitan"
                            size={20}
                            animated={false}
                            strokeWidth={1}
                            className="md:w-6 md:h-6"
                        />
                        <span className="text-[var(--text-muted)] text-sm">
                            VUDO
                        </span>
                        <span className="text-[var(--text-muted)]/50">|</span>
                        <span className="text-[var(--text-muted)] text-sm">
                            Univrs.io
                        </span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)]/60 italic">
                        1984: "The Network is the Computer" → 2024: "Le réseau est Bondieu"
                    </p>
                </div>

                <div className="flex items-center gap-6 text-sm text-[var(--text-muted)]">
                    <a
                        href="https://github.com/univrs"
                        className="hover:text-[var(--text-secondary)]"
                    >
                        GitHub
                    </a>
                    <a
                        href="https://learn.univrs.io"
                        className="hover:text-[var(--text-secondary)]"
                    >
                        Docs
                    </a>
                </div>

                <p className="text-xs text-[var(--text-muted)]">
                    © 2025 Univrs. Open Source.
                </p>
            </div>
        </footer>
    );
}

function AppContent() {
    return (
        <div className="relative min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased">
            {/* MyceliumBackground handles its own loading state internally */}
            <MyceliumBackground nodeCount={50} connectionProbability={0.2} />

            <ThemeToggle />

            <main className="relative z-10">
                <Hero />
                <VeveDivider />
                <PhysarumSection />
                <VeveDivider />
                <DOLPlayground />
                <VeveDivider />
                <VocabularySection />
                <ManifestoSection />
                <VeveDivider />
                <Roadmap />
                <VeveDivider />
                <MilestoneTracker />
                <VeveDivider />
                <CTASection />
            </main>

            <Footer />
        </div>
    );
}

export default function App() {
    return (
        <ThemeProvider>
            <AppContent />
        </ThemeProvider>
    );
}
