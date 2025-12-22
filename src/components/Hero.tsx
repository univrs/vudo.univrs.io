import { motion } from "framer-motion";
import { VevePattern } from "./VevePattern";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15, delayChildren: 0.3 },
    },
};

const letterVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
    },
};

const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
    },
};

export function Hero() {
    const title = "VUDO";

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            <motion.div
                className="relative z-10 text-center px-6 max-w-4xl mx-auto"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="flex justify-center items-center gap-4 md:gap-8 mb-6">
                    {title.split("").map((letter, i) => (
                        <motion.span
                            key={i}
                            variants={letterVariants}
                            className="text-6xl md:text-8xl lg:text-9xl font-light tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60"
                            style={{
                                fontFamily: "Space Grotesk, sans-serif",
                                textShadow: "0 0 60px rgba(0, 255, 136, 0.3)",
                            }}
                        >
                            {letter}
                        </motion.span>
                    ))}
                </div>

                <motion.p
                    variants={fadeUpVariants}
                    className="text-sm md:text-base tracking-[0.4em] uppercase text-[#00ff88]/80 mb-12"
                    style={{ fontFamily: "JetBrains Mono, monospace" }}
                >
                    Virtual Univrs Design Ontology
                </motion.p>

                <motion.div
                    variants={fadeUpVariants}
                    className="w-48 h-px bg-gradient-to-r from-transparent via-[#fbbf24] to-transparent mx-auto mb-12"
                />

                <motion.h2
                    variants={fadeUpVariants}
                    className="text-xl md:text-2xl lg:text-3xl text-white/90 mb-2 font-light"
                >
                    Systems that can become,
                </motion.h2>

                <motion.p
                    variants={fadeUpVariants}
                    className="text-lg md:text-xl lg:text-2xl text-[#00ff88] mb-12 max-w-xl mx-auto font-light italic"
                >
                    what you can imagine!
                </motion.p>

                <motion.div
                    variants={fadeUpVariants}
                    className="flex justify-center mb-12"
                >
                    <VevePattern type="mitan" size={120} delay={1.5} />
                </motion.div>

                <motion.div
                    variants={fadeUpVariants}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <a
                        href="#imaginarium"
                        className="group relative px-8 py-4 bg-[#00ff88]/10 border border-[#00ff88]/30 rounded-sm text-[#00ff88] hover:bg-[#00ff88]/20 hover:border-[#00ff88]/50 transition-all duration-300"
                    >
                        <span className="relative z-10 tracking-wider uppercase text-sm">
                            Enter the Imaginarium
                        </span>
                    </a>

                    <a
                        href="https://github.com/univrs/metadol"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-8 py-4 text-white/60 hover:text-white/90 transition-colors duration-300 tracking-wider uppercase text-sm"
                    >
                        View Source →
                    </a>
                </motion.div>

                <motion.div
                    className="absolute bottom-12 left-1/2 -translate-x-1/2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.5, duration: 1 }}
                >
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="w-6 h-10 border border-white/20 rounded-full flex justify-center"
                    >
                        <motion.div
                            animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                            className="w-1 h-2 bg-white/40 rounded-full mt-2"
                        />
                    </motion.div>
                </motion.div>
            </motion.div>
        </section>
    );
}

export default Hero;
